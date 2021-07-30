const configs = {
    systemType: "SC1",
    ssl: true,
    serverDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.14": "lumigame.com",
        "games.lumigame.com": "lumigame.com"
    },
    subDomain: "l1-proxy",
    env: "",
    sentry: {
        url: "https://2af29bdacdbf4d9ba2db6600b450541f@sentry.lumigame.com/28",
        env: "LOCAL"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    guideDomain: "https://l1-guide.lumigame.com",
    userServiceUrl: "https://l1-proxy.lumigame.com/user"
};

module.exports = configs;
