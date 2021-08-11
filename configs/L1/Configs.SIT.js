const configs = {
    systemType: "SC1",
    ssl: true,
    serverDomainMapper: {
        "minisit.sgamesuat.com": "sabagame.com"
    },
    subDomain: "uatproxy",
    env: "sit",
    sentry: {
        url: "https://08d902b128ea45b6a11639833224f481@sentryuat.sabagame.com/25",
        env: "SIT"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    guideDomain: "https://guidessit.sabagame.com",
    userServiceUrl: "https://uatproxy.sabagame.com/sit/user"
};

module.exports = configs;
