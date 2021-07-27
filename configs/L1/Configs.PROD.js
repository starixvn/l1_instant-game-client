const configs = {
    systemType: "SC1",
    ssl: true,
    serverDomainMapper: {
        "www.sabagame.com": "sabagame.com",
        "sabagame.com": "sabagame.com",
        "www.gamesaba.com": "gamesaba.com",
        "gamesaba.com": "gamesaba.com"
    },
    subDomain: "proxy",
    env: "",
    sentry: {
        url: "https://19b3909c434341f0b13eb3a8529e5862@sentry.sabagame.com/9",
        env: "PRO"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    guideDomain: "https://guides.sabagame.com",
    userServiceUrl: "https://proxy.sabagame.com/user"
};

module.exports = configs;
