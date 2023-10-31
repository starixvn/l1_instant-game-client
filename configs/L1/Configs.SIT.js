window.envConfig = {
    systemType: "SC1",
    ssl: true,
    subDomain: "l1uatproxy",
    env: "sit",
    sentry: {
        url: "https://08d902b128ea45b6a11639833224f481@sentryuat.sabagame.com/25",
        env: "INSTANT_SIT"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    subGuideDomain: "l1guidessit",
    enableMsgpackParserOnGame: {
        45: true,
        1: true,
        9: true,
        3: true,
        7: true,
        10: true,
        25: true
    },
    enableMsgpackParserOnNotification: true,
    clientSubDomain: "l1uatclient",
    gameIdsSupportBoostedOddsForInstantSite: "1,9",
    boostedOddsDelayTimeByMinutes: 15
};
