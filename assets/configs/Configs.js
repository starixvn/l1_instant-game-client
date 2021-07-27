const configs = {
    systemType: "SC2",
    ssl: true,
    serverDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.14": "lumigame.com",
        "l2-games1.lumigame.com": "lumigame.com"
    },
    subDomain: "l2-proxy1",
    env: "",
    sentry: {
        url: "https://b015ef787273452c8fce4af733e62d59@sentry.lumigame.com/29",
        env: "LOCAL_1"
    },
    guideDomain: "https://l2-guide-1.lumigame.com",
    userServiceUrl: "https://l2-proxy1.lumigame.com/user"
};

module.exports = configs;
