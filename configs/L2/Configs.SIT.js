const configs = {
    systemType: "SC2",
    ssl: true,
    disabledDirectLogin: true,
    serverDomainMapper: {
        "sit.sabagame.net": "sabagame.net"
    },
    subDomain: "uatproxy",
    env: "sit",
    sentry: {
        url: "https://df0ce89a96b045e4ae626c16a143d8f9@sentryuat.sabagame.com/51",
        env: "SIT"
    },
    guideDomain: "https://guidessit.sabagame.net",
    userServiceUrl: "https://uatproxy.sabagame.net/sit/user"
};

module.exports = configs;
