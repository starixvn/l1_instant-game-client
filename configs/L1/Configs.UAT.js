const configs = {
    systemType: "SC1",
    ssl: true,
    serverDomainMapper: {
        "miniuat.sgamesuat.com": "sabagame.com"
    },
    subDomain: "uatproxy",
    env: "INSTANT_Uat",
    sentry: {
        url: "https://08d902b128ea45b6a11639833224f481@sentryuat.sabagame.com/25",
        env: "INSTANT_UAT"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    guideDomain: "https://guidesuat.sabagame.com",
    kenoVietLotUrl: "https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/winning-number-keno",
    userServiceUrl: "https://uatproxy.sabagame.com/uat/user"
};

module.exports = configs;
