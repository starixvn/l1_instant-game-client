export const BetTypes = ["player", "banker", "tie"];

export type Settlement = {
    banker: boolean;
    bankerPair: boolean;
    big: boolean;
    natural: boolean;
    player: boolean;
    playerPair: boolean;
    small: boolean;
    tie: boolean;
};

export type Result = {
    banker: Cards;
    cards: CardModel[];
    player: Cards;
};

export type Cards = {
    card1: CardModel;
    card2: CardModel;
    card3?: CardModel;
};

export type CardModel = {
    card: number;
    type: number;
};

export type FinishResult = {
    roundId: number;
    result: Result;
    settlementResult: Settlement;
    winningPlayers: Record<
        number,
        {
            bet: number;
            rate: number;
            win: boolean;
        }
    >;
};

export type GameConfig = {
    maxBet: number;
    maxBetPerChoices: Choices;
    minBet: number;
    odds: Choices;
    stakeLevels: [];
};

export type Choices = {
    banker: number;
    bankerPair: number;
    big: number;
    player: number;
    playerPair: number;
    small: number;
    tie: number;
};
