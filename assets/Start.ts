const { ccclass, property } = cc._decorator;

@ccclass
export default class Start extends cc.Component {
    onLoad() {
        if (cc.sys.isMobile) {
            cc.director.loadScene("Main");
        } else {
            cc.director.loadScene("Main_Portrait");
        }
    }
}
