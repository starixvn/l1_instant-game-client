const configs = {
    desktopMiniGameScale: 1,
    GameIds: {
        Lobby: 0,
        BigSmall: 1,
        FishPrawnCrab: 3,
        DragonTiger: 7,
        MiniSedie: 9,     
        HiLo: 45
    },
    GameInfos: {
        0: {
            key: "main"
        },
        1: {
            key: "BigSmall",
            mini: true
        },
        3: {
            key: "FishPrawnCrab",
            route: "fishprawncrab",
            mini: true
        },
        7: {
            key: "DragonTiger",
            mini: true
        },
        9: {
            key: "MiniSeDie",
            mini: true
        },
        45: {
            key: "Hilo",
            mini: true
        }
    }
};

module.exports = configs;
