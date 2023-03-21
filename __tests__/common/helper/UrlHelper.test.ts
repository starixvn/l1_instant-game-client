import * as urlHelper from "../../../assets/common/helper/UrlHelper";
import configs = require("../../../assets/configs/Configs");

describe("Test UrlHelper", () => {
    Object.defineProperty(window, "location", {
        value: { hostname: "www.unittest.com" },
        writable: true
    });
    Object.defineProperty(configs, "subGuideDomain", {
        value: "guides",
        writable: true
    });
    Object.defineProperty(configs, "subDomain", {
        value: "proxy",
        writable: true
    });
    describe("Test function getDomainFromHostName", () => {
        test.each`
            hostName              | expectedDomain
            ${"www.lumigame.com"} | ${"lumigame.com"}
            ${"www.sabagame.com"} | ${"sabagame.com"}
            ${"sabagame.com"}     | ${"sabagame.com"}
            ${"www.gamesaba.com"} | ${"gamesaba.com"}
            ${"gamesaba.com"}     | ${"gamesaba.com"}
            ${"www.v-gaming.net"} | ${"v-gaming.net"}
            ${"v-gaming.net"}     | ${"v-gaming.net"}
            ${"vgaming.win"}      | ${"vgaming.win"}
            ${"www.vgaming.win"}  | ${"vgaming.win"}
            ${"w2.vgaming.win"}   | ${"vgaming.win"}
        `("should return domain", ({ hostName, expectedDomain }) => {
            // Arrange
            const actual = urlHelper.extractDomainFromHostName(hostName);

            // Assert
            expect(actual).toEqual(expectedDomain);
        });
    });

    describe("Test function buildGameGuideUrl", () => {
        test("should return guide url", () => {
            //Arrange
            const expected = "https://guides.unittest.com";
            // Act
            const actual = urlHelper.buildGameGuideUrl();
            // Assert

            expect(actual).toEqual(expected);
        });
    });

    describe("Test function buildUrl", () => {
        test("should return url", () => {
            //Arrange
            const expected = `https://proxy.unittest.com/`;
            // Act
            const actual = urlHelper.buildUrl();
            // Assert

            expect(actual).toEqual(expected);
        });

        test("should return url with path", () => {
            //Arrange
            const expected = `https://proxy.unittest.com/path`;
            // Act
            const actual = urlHelper.buildUrl("http", "/path");
            // Assert

            expect(actual).toEqual(expected);
        });
    });

    describe("Test function buildUserServiceUrl", () => {
        test.each`
            env      | expectedUrl
            ${""}    | ${"https://proxy.unittest.com/user"}
            ${"dev"} | ${"https://proxy.unittest.com/dev/user"}
        `("should return User Service Url", ({ env, expectedUrl }) => {
            Object.defineProperty(configs, "env", {
                value: env,
                writable: true
            });
            // Act
            const actual = urlHelper.getUserServiceUrl();

            // Assert
            expect(actual).toEqual(expectedUrl);
        });
    });

    describe("Test function getPath", () => {
        test.each`
            gameId | env      | expectedProxyUrl
            ${0}   | ${""}    | ${"/main"}
            ${0}   | ${"dev"} | ${"/dev/main"}
            ${1}   | ${"dev"} | ${"/user/bigsmall"}
        `("should return ProxyUrl", ({ gameId, env, expectedProxyUrl }) => {
            Object.defineProperty(configs, "env", {
                value: env,
                writable: true
            });
            // Act
            const actual = urlHelper.getPath(gameId);

            // Assert
            expect(actual).toEqual(expectedProxyUrl);
        });
    });

    describe("Test function buildServerUrl", () => {
        test("should return Server Url", () => {
            //Arrange
            const expected = "https://proxy.unittest.com/user/bigsmall";
            // Act
            const actual = urlHelper.buildServerUrl("http", "", 1);

            // Assert
            expect(actual).toEqual(expected);
        });
    });
});
