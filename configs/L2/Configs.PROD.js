const configs = {
    systemType: "SC2",
    ssl: true,
    disabledDirectLogin: true,
    serverDomainMapper: {
        "www.sabagame.net": "sabagame.net",
        "sabagame.net": "sabagame.net",
        "www.gamesaba.net": "gamesaba.net",
        "gamesaba.net": "gamesaba.net"
    },
    subDomain: "proxy",
    env: "",
    sentry: {
        url: "https://eb5f1c92d1da4cb6a059fa40c1276a9d@sentry.sabagame.com/48",
        env: "PRO"
    },
    guideDomain: "https://guides.sabagame.net",
    userServiceUrl: "https://proxy.sabagame.net/user"
};

module.exports = configs;
