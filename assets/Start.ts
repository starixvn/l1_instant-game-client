const { ccclass, property } = cc._decorator;

@ccclass
export default class Start extends cc.Component {
    onLoad() {
        cc.director.loadScene("Main_Portrait");
    }
}
