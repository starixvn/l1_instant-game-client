import configs from "../configs/Configs";

export const sentryLogger = {
    sentryUrl: null,
    loaded: false,
    isEnabled: () => {
        return sentryLogger.sentryUrl != null && document && document.head;
    },
    loadScript: () => {
        if (window.Sentry && !sentryLogger.loaded) {
            window.Sentry.init({
                dsn: configs.sentry.url,
                environment: configs.sentry.env,
                maxValueLength: 5000,
                ignoreErrors: ["fullscreen error", "exitFullscreen", "start the audio device"]
            });
            sentryLogger.loaded = true;
        }
    },
    start: () => {
        try {
            sentryLogger.sentryUrl = configs.sentry.url;

            if (sentryLogger.isEnabled() && document.head && !document.getElementById("sentry-logger")) {
                const sentryScript = document.createElement("script");

                sentryScript.setAttribute("id", "sentry-logger");
                sentryScript.setAttribute("src", "https://browser.sentry-cdn.com/5.15.0/bundle.min.js");
                sentryScript.setAttribute("integrity", "sha384-+ysfQckQvwCB5SppH41IScIz/Iynt2pePnJNMl+D7ZOzDJ+VYhQEuwB0pA60IDM0");
                sentryScript.setAttribute("crossorigin", "anonymous");
                sentryScript.onload = () => {
                    sentryLogger.loadScript();
                };

                document.head.appendChild(sentryScript);
            }
        } catch (ex) {
            console.log(ex);
        }
    },

    log: (message) => {
        if (sentryLogger.isEnabled()) {
            sentryLogger.loadScript();
            window.Sentry && window.Sentry.captureMessage(message);
        }
    },

    logError: (exception) => {
        if (sentryLogger.isEnabled()) {
            sentryLogger.loadScript();
            window.Sentry && window.Sentry.captureException(exception);
        }
    },

    setUser: (user) => {
        if (sentryLogger.isEnabled() && user) {
            setTimeout(function () {
                try {
                    window.Sentry &&
                        window.Sentry.configureScope(function (scope) {
                            scope.setUser(user);
                        });
                } catch (ex) {
                    console.log(ex);
                }
            }, 5000);
        }
    },

    setTag: (tag) => {
        if (sentryLogger.isEnabled() && tag) {
            try {
                window.Sentry &&
                    window.Sentry.configureScope(function (scope) {
                        scope.setTag(tag.id, tag.value);
                    });
            } catch (ex) {
                console.log(ex);
            }
        }
    },

    setCharacterName: (name) => {
        sentryLogger.setTag({ id: "character-name", value: name });
    },

    setSocketIoId: (socketId) => {
        sentryLogger.setTag({ id: "socket-io-id", value: socketId });
    }
};

export default function () {
    return sentryLogger;
}
