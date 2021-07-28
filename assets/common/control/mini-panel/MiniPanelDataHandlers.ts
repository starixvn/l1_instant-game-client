import * as i18n from "i18n/runtime-scripts/LanguageData";

import { removeInRoomGameId, removeSession } from "../../../manager/auth/SessionManager";
import { numberWithCommas } from "../../helper/NumberHelper";
import GameUtils from "../../utils/GameUtils";
import NoticeUtil from "../../utils/NoticeUtil";
import { NoticeData } from "../notice/Notice";
import MiniPanel from "./MiniPanel";

export default class MiniPanelDataHandlers {
    constructor(private readonly main: MiniPanel) {}

    handleData(data) {
        if (data.mini) {
            this.handleData(data.mini);
        }

        if (data.kickedOut) {
            this.handleDataKickedOut(data.kickedOut);
        }

        if (data.apiError) {
            this.handleDataApiError(data);
        }

        if (data.reload) {
            this.main.onForceReload();
        }

        if (data.toGame) {
            this.main.loadGameRoom(data.toGame);
        }

        if (data.notice) {
            this.handleNoticeData(data.notice);
        }

        if (data.unauthorized) {
            this.main.forceKickedOut();
        }

        if (data.Authorized) {
            cc.GameManager.IS_LOGIN = true;
            this.main.onSignIn();
        }

        if (data.notPermittedToPlay) {
            removeInRoomGameId();

            const gameId = data.gameId;
            const gameName = GameUtils.getGameNameString(gameId);
            const message = i18n.t("messages.gameExcluded", { gameName: gameName });
            this.main.onForceReload(true, message);
        }

        if (data.userStakeLevel) {
            cc.GameManager.userStakeLevelData(data.userStakeLevel);
        }
    }

    handleDataKickedOut(data: any) {
        removeSession();

        if (data.umInfo) {
            cc.GameManager.forceKickedOut();
            window.umInfo = data.umInfo;
            cc.director.loadScene("um");
        } else {
            if (data.isDisabledAccount) {
                setTimeout(() => {
                    this.main.forceKickedOut();
                }, 10000);
            } else {
                this.main.forceKickedOut();
            }
            const errorCode = data.errorCode;
            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            const noticeData = { text: text } as NoticeData;
            this.main.showNotice(noticeData, this.main.forceKickedOut, this.main.forceKickedOut);
        }
    }

    handleDataApiError(apiErrorData: any) {
        const error = apiErrorData.apiError;
        const gameId = error.gameTypeId;

        if (this.main.skipShowApiErrorGameIds.includes(gameId)) {
            return;
        }

        if (error.maxBet && error.maxBet > 0) {
            cc.GameManager.userStakeLevelData(error);
        }

        this.main.showErrorNotice(error);
    }

    handleNoticeData(notice: any) {
        this.main.loading.node.active = false;
        const errorCode = notice.errorCode;
        const gameName = GameUtils.getGameNameString(notice.gameTypeId);
        const { minBet, maxBet, gameRoundId } = notice;
        const opt = { gameName, gameRoundId, errorCode, minBet: numberWithCommas(minBet), maxBet: numberWithCommas(maxBet) };
        const text = NoticeUtil.getLocalizedErrorMessage(errorCode, opt);
        if (text) {
            const noticeData = {
                text: text,
                isInfo: false
            } as NoticeData;
            this.main.showNotice(noticeData);
        }
    }
}
