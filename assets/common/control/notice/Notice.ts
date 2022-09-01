import * as i18n from "i18n/runtime-scripts/LanguageData";

const { ccclass, property } = cc._decorator;

export interface NoticeData {
    title: string;
    text: string;
    button: NoticeButton;
    isInfo: boolean;
    autoClearDuration: number;
    canNotClose: boolean;
}

export interface NoticeButton {
    text: string;
}

@ccclass
export default class Notice extends cc.Component {
    @property(cc.Node)
    popupNode: cc.Node = null;

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    message: cc.Label = null;

    @property(cc.Node)
    buttonNode: cc.Node = null;

    @property(cc.Label)
    buttonLabel: cc.Label = null;

    @property()
    duration = 3;

    public handleClickButton: () => void;
    public handleClose: () => void;
    private canNotClose = false;

    onDisable() {
        this.node.destroyAllChildren();
        this.node.destroy();
    }

    public init(data: NoticeData) {
        if (data.autoClearDuration) {
            this.updateAutoClearDuration(data.autoClearDuration);
        }
        if (data.canNotClose) {
            this.canNotClose = data.canNotClose;
        }
        this.node.active = true;

        cc.GameManager.miniPanel.showLoading(false);

        this.setTitle(data.title);
        this.setMessage(data.text);
        this.setButton(data.button);
    }

    private updateAutoClearDuration(duration: number) {
        this.handleClearDuration();
        this.duration = duration;
    }

    public onClickButton() {
        if (this.canNotClose) {
            return;
        }
        cc.GameManager.playClick();

        if (this.handleClickButton) {
            this.handleClickButton();
        }

        this.node.active = false;
    }

    public close() {
        if (this.canNotClose) {
            return;
        }
        if (this.handleClose) {
            this.handleClose();
        }

        this.node.active = false;
    }

    public setTitle(title: string) {
        if (title) {
            this.title.string = title.toUpperCase();
        } else {
            this.title.string = i18n.t("messages.noticeTitle");
        }
    }

    public setMessage(message: string) {
        if (message) {
            this.message.string = message;
        }
    }

    public setButton(button: any) {
        if (button) {
            this.message.node.y = 15;
            this.buttonLabel.string = button.text;
            this.buttonNode.active = true;
        } else {
            this.buttonNode.active = false;
        }
    }

    private handleClearDuration() {
        this.scheduleOnce(() => {
            this.close();
        }, this.duration);
    }
}
