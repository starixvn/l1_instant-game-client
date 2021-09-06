import BetItem from "../../../assets/games/_base/view-models/BetItem";

let node: cc.Node;
let betItem: BetItem;

beforeEach(() => {
    node = new cc.Node();
    betItem = node.addComponent(BetItem);
});

describe("setOwnBet", () => {
    beforeEach(() => {
        const ownBetLabel = node.addComponent(cc.Label);
        betItem.ownBet = ownBetLabel;
    });

    it("should do nothing when ownBet is null", () => {
        betItem.ownBet = null;
        betItem.setOwnBet(0);

        expect(betItem.ownBet).toBeNull();
    });
    it("should empty when bet is zero", () => {
        betItem.setOwnBet(0);

        expect(betItem.ownBet.string).toEqual("");
    });

    it("should bet value when bet is greater than zero", () => {
        betItem.setOwnBet(1000);

        expect(betItem.ownBet.string).toEqual("1,000");
    });
});
