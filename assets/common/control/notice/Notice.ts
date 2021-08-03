import * as i18n from "i18n/runtime-scripts/LanguageData";

const { ccclass, property } = cc._decorator;

export interface NoticeData {
    title: string;
    text: string;
    button: NoticeButton;
    isInfo: boolean;
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

    public handleClickButton: () => void;

    public handleClose: () => void;

    onEnable() {
        this.popupNode.opacity = 0;
        this.popupNode.scale = 0;
        this.popupNode.runAction(cc.spawn(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()), cc.fadeTo(0.5, 255)));
    }

    onDisable() {
        this.node.destroyAllChildren();
        this.node.destroy();
    }

    public init(data: NoticeData) {
        this.node.active = true;

        cc.GameManager.miniPanel.showLoading(false);

        this.setTitle(data.title);
        this.setMessage(data.text);
        this.setButton(data.button);
        this.setBackground(data.isInfo);
    }

    public onClickButton() {
        cc.GameManager.playClick();

        if (this.handleClickButton) {
            this.handleClickButton();
        }

        this.node.active = false;
    }

    public close() {
        if (this.handleClose) {
            this.handleClose();
        }

        this.node.active = false;
    }

    public setBackground(isInfo: boolean) {
        // if (isInfo) {
        //     this.popupNode.spriteFrame = this.infoBackground;
        // } else {
        //     this.popupNode.spriteFrame = this.errorBackground;
        // }
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

    // update (dt) {}
}
