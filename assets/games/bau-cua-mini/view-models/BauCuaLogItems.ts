const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCuaLogItems extends cc.Component {
    @property({ type: cc.Sprite })
    icon: cc.Sprite[] = [];
}
