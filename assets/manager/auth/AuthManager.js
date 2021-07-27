import i18n from "i18n/runtime-scripts/LanguageData";

import httpHelper from "../../common/helper/httpHelper";
import { buildServerUrl } from "../../common/helper/UrlHelper";
import logger from "../../common/logger";
import NoticeUtil from "../../common/utils/NoticeUtil";
import * as configs from "../../configs/Configs";
import * as sessionManager from "./SessionManager";
import UserService from "./UserService";

const sentryLogger = logger();
const sessionExpiredTimeoutMinutes = 19.8;

export function preChecking(cb) {
    const settingUrl = buildServerUrl(configs.ssl, "http", "/api/settings");

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("isUM") && urlParams.get("isUM") === "true") {
        window.umInfo = {
            isUM: true,
            startTime: new Date(),
            endTime: new Date()
        };
        cc.director.loadScene("um");
        return;
    }

    if (urlParams.has("isTimeout") && urlParams.get("isTimeout") === "true") {
        cc.director.loadScene("sessiontimeout");
        return;
    }

    httpHelper.get(
        settingUrl,
        function (settingResponse) {
            try {
                window.siteSettings = settingResponse;
                if (settingResponse && settingResponse.umInfo && settingResponse.umInfo.isUM) {
                    window.umInfo = settingResponse.umInfo;
                    cc.director.loadScene("um");

                    return settingResponse;
                }

                const session = sessionManager.getSession();
                const isSessionExpired = verifySession(session);

                if (isSessionExpired && !urlParams.has("token")) {
                    signOut();

                    return settingResponse;
                }
            } catch (ex) {
                sentryLogger.logError(ex);
            }

            cb();

            return void 0;
        },
        true
    );
}

export function checkSSO(labelMessage, onSuccessFunc) {
    let isSuccess = false;
    const urlParams = new URLSearchParams(window.location.search);
    const authData = sessionManager.getSession();

    if (urlParams.has("token")) {
        UserService.getInstance()
            .auth.sso(urlParams.get("token"))
            .then((response) => {
                if (response.isAuthenticated) {
                    window.authData = response;
                    sentryLogger.setUser(response);
                    window.authData.time = new Date();
                    window.openGameId = urlParams.get("gameId");
                    sessionManager.storeSessionData(response);
                    clearTokenOnUrl();
                    onSuccessFunc();
                } else {
                    labelMessage.string = i18n.t("ui.login_failed");
                }
            })
            .catch((error) => {
                labelMessage.string = i18n.t("ui.connection_lost");
                sentryLogger.logError(error);
            });

        isSuccess = true;
    } else if (authData && authData.isAuthenticated && authData.ss) {
        isSuccess = true;
        window.authData = authData;
        sessionManager.updateLanguage(authData);
        sentryLogger.setUser(authData);
        onSuccessFunc();
    }

    return isSuccess;
}

export function clearTokenOnUrl() {
    try {
        history.pushState(null, "", location.href.split("?")[0]);
    } catch (ex) {
        console.log(ex);
    }
}

export function signOut() {
    cc.director.loadScene("sessiontimeout");
    sessionManager.removeSession();
}

let autoTriggerSignInTimeout = null;

export function triggerSignIn(main) {
    if (!!window.authData) {
        UserService.getInstance()
            .auth.authorize(window.authData.ss, window.authData.username)
            .then((response) => {
                if (response.user) {
                    main.handleUserData(response.user);
                }
                main.serviceAuthorized(response.authorized);
            })
            .catch((e) => {
                sentryLogger.logError(e);
                // const session = sessionManager.getSession();
                // const isSessionExpired = verifySession(session);

                // if (!isSessionExpired) {
                //     main.loadLobbyMenuFromStorage();
                // }
            });
    }
}

export function auth() {
    if (!!window.authData) {
        const authentication = {
            username: window.authData.username,
            data: window.authData
        };

        autoTriggerSignInTimeout = setTimeout(() => {
            cc.RedT.send({ authentication });
        }, 500);
    }
}

export function verifySession(session) {
    let isSessionExpired = true;

    try {
        if (session && session.time) {
            const now = new Date();
            const lastRecheckIn = new Date(session.time);
            const differenceInMinutes = Math.abs(now - lastRecheckIn) / (1000 * 60);

            if (differenceInMinutes <= sessionExpiredTimeoutMinutes) {
                isSessionExpired = false;
            }
        }
    } catch (ex) {
        sentryLogger.logError(ex);
    }

    return isSessionExpired;
}

export function reCheckIn() {
    try {
        const session = sessionManager.getSession();
        const isSessionExpired = verifySession(session);

        if (isSessionExpired) {
            signOut();
        } else {
            UserService.getInstance()
                .auth.reCheckIn(session.ss, session.username)
                .then((response) => {
                    if (response.isSuccessful) {
                        session.time = new Date();
                        sessionManager.storeSessionData(session);

                        if (response.apiError) {
                            if (response.isDisableAccount) {
                                setTimeout(signOut, 10000);
                                const noticeData = {
                                    text: i18n.t("messages.accountClosed")
                                };
                                cc.RedT.inGame && cc.RedT.inGame.showNotice(noticeData, signOut, signOut);
                            } else {
                                const errorCode = response.apiError.errorCode;
                                const message = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
                                const noticeData = { text: message };
                                cc.RedT.inGame && cc.RedT.inGame.showNotice(noticeData);
                            }
                        } else {
                            if (cc.RedT.user) {
                                cc.RedT.user.red = response.balance;
                                cc.RedT.inGame && cc.RedT.inGame.loadUserData(cc.RedT.user);
                            }
                        }
                    } else {
                        signOut();
                    }
                })
                .catch((error) => sentryLogger.logError(error));
        }
    } catch (ex) {
        console.log(JSON.stringify(ex));
    }
}
