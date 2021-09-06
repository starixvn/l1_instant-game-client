module.exports = {
    preset: "ts-jest",
    testResultsProcessor: "jest-sonar-reporter",
    collectCoverageFrom: ["<rootDir>/assets/**/*.ts"],
    coverageDirectory: "coverage",
    setupFiles: ["jest-canvas-mock", "<rootDir>/__tests__/utils/cocos2d-js-for-preview.js"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["/lib/", "/node_modules/"],
    moduleFileExtensions: ["ts", "js"],
    testMatch: ["**/__tests__/**/*.+(ts)", "**/?(*.)+(spec|test).+(ts)"],
    transformIgnorePatterns: ["cocos2d-js-for-preview.js"]
};
