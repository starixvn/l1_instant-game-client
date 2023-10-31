window.envConfig = {
    systemType: "SC2",
    ssl: true,
    disabledDirectLogin: true,
    subDomain: "l2uatproxy",
    env: "uat",
    sentry: {
        url: "https://df0ce89a96b045e4ae626c16a143d8f9@sentryuat.sabagame.com/51",
        env: "INSTANT_UAT"
    },
    subGuideDomain: "l2guidesuat",
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
    clientSubDomain: "l2uatclient",
    gameIdsSupportBoostedOddsForInstantSite: "1,9",
    boostedOddsDelayTimeByMinutes: 15
};
