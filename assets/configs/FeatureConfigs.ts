import configs = require("./Configs");

const FeatureConfig = {
    PortraitMode: !cc.sys.isMobile && configs.systemType === "SC1"
};

export { FeatureConfig };
