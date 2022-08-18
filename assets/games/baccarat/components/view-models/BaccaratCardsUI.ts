const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratCardsUI extends cc.Component {
    @property(cc.Node)
    winning: cc.Node = null;
}
