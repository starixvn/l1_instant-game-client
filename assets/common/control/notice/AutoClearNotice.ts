import Notice from "./Notice";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoClearNotice extends cc.Component {
    @property(Notice)
    notice: Notice = null;

    @property()
    duration = 3;

    onEnable() {
        this.scheduleOnce(() => {
            if (this.notice.isValid) {
                this.notice.close();
            }
        }, this.duration);
    }
}
