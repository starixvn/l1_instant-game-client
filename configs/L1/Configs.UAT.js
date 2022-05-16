const configs = {
    systemType: "SC1",
    ssl: true,
    serverDomainMapper: {
        "l1miniuat.sgamesuat.com": "sgamesuat.com"
    },
    subDomain: "l1uatproxy",
    env: "uat",
    sentry: {
        url: "https://08d902b128ea45b6a11639833224f481@sentryuat.sabagame.com/25",
        env: "INSTANT_UAT"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    enableMsgpackParserOnGame: {
        45: true,
        1: true,
        9: true,
        3: true
    }
};

module.exports = configs;
