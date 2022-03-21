const configs = {
    systemType: "SC2",
    ssl: true,
    disabledDirectLogin: true,
    serverDomainMapper: {
        "l2miniuat.sgamesuat.com": "sgamesuat.com"
    },
    subDomain: "l2uatproxy",
    env: "uat",
    sentry: {
        url: "https://df0ce89a96b045e4ae626c16a143d8f9@sentryuat.sabagame.com/51",
        env: "INSTANT_UAT"
    },
    guideDomain: "https://guidesuat.sabagame.net"
};

module.exports = configs;
