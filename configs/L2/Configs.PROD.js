const configs = {
    systemType: "SC2",
    ssl: true,
    disabledDirectLogin: true,
    serverDomainMapper: {
        "www.mini.v-gaming.net": "v-gaming.net",
        "mini.v-gaming.net": "v-gaming.net"
    },
    subDomain: "proxy",
    env: "",
    sentry: {
        url: "https://eb5f1c92d1da4cb6a059fa40c1276a9d@sentry.sabagame.com/48",
        env: "INSTANT_PRO"
    },
    guideDomain: "https://guides.sabagame.net"
};

module.exports = configs;
