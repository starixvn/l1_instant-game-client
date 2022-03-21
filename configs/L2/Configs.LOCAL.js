const configs = {
    systemType: "SC2",
    ssl: true,
    disabledDirectLogin: true,
    serverDomainMapper: {
        "l2-mini.lumigame.com": "lumigame.com"
    },
    subDomain: "l2-proxy",
    env: "",
    sentry: {
        url: "https://b015ef787273452c8fce4af733e62d59@sentry.lumigame.com/29",
        env: "INSTANT_LOCAL"
    },
    guideDomain: "https://l2-guide.lumigame.com"
};

module.exports = configs;
