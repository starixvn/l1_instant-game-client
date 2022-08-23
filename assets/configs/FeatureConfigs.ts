import configs = require("./Configs");

const FeatureConfig = {
    PortraitMode: window.innerWidth < window.innerHeight && configs.systemType === "SC1"
};

export { FeatureConfig };
