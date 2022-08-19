import BaccaratCards from "./BaccaratCards";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratCardsUI extends cc.Component {
    @property(BaccaratCards)
    playerCards: BaccaratCards = null;

    @property(BaccaratCards)
    bankerCards: BaccaratCards = null;

    @property(cc.Label)
    winningText: cc.Label = null;

    onLoad() {
        this.winningText.node.parent.active = false;
    }
}
