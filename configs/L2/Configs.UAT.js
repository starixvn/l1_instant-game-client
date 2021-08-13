const configs = {
    systemType: "SC2",
    ssl: true,
    disabledDirectLogin: true,
    serverDomainMapper: {
        "uat.sabagame.net": "sabagame.net"
    },
    subDomain: "uatproxy",
    env: "INSTANT_Uat",
    sentry: {
        url: "https://df0ce89a96b045e4ae626c16a143d8f9@sentryuat.sabagame.com/51",
        env: "INSTANT_UAT"
    },
    guideDomain: "https://guidesuat.sabagame.net",
    userServiceUrl: "https://uatproxy.sabagame.net/uat/user"
};

module.exports = configs;
