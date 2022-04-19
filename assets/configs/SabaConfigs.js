const configs = {
    desktopMiniGameScale: 1,
    GameIds: {
        Lobby: 0,
        BigSmall: 1,
        SeDie: 2,
        FishPrawnCrab: 3,
        TurboBigSmall: 4,
        TurboOddEven: 6,
        DragonTiger: 7,
        KenoProMax: 8,
        MiniSedie: 9,
        Baccarat: 10,
        KenoProViet: 11,
        KenoMax: 12,
        KenoMax2: 13,
        KenoMini: 14,
        KenoMini2: 15,
        KenoEast: 16,
        KenoWest: 17,
        KenoSouth: 18,
        KenoNorth: 19,
        Roulette: 21,
        VipSedie: 22,
        BlackJack: 23,
        SpecialSeDie: 24,
        SicBo: 25,
        VipFishPrawnCrab: 26,
        VipBaccarat: 27,
        VipSedieWar: 28,
        FourGuardians: 29,
        Lottery: 31,
        ThreeCards: 35,
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
        2: {
            key: "SeDie",
        },
        3: {
            key: "BauCua",
            route: "fishprawncrab",
            mini: true
        },
        4: {
            key: "TXTurbo",
            route: "turbobigsmall",
            mini: true
        },
        6: {
            id: 6,
            key: "OETurbo",
            route: "turbooddeven",
            mini: true
        },
        7: {
            key: "DragonTiger",
            mini: true
        },
        8: {
            key: "KenoProMax"
        },
        9: {
            key: "MiniSeDie",
            mini: true
        },
        10: {
            key: "Baccarat"
        },
        11: {
            key: "KenoProViet",
            mini: true,
            mainSocket: true
        },
        21: {
            key: "Roulette"
        },
        22: {
            key: "VipSeDie",
            route: "vsedie"
        },
        23: {
            key: "BlackJack"
        },
        24: {
            key: "SpecialSeDie",
            mini: true
        },
        25: {
            key: "SicBo"
        },
        26: {
            key: "VipFishPrawnCrab"
        },
        27: {
            key: "VipBaccarat"
        },
        28: {
            key: "VipSedieWar"
        },
        29: {
            key: "FourGuardians"
        },
        31: {
            key: "Lottery"
        },
        35: {
            key: "ThreeCards"
        },
        45: {
            key: "Hilo",
            mini: true
        }
    }
};

module.exports = configs;
