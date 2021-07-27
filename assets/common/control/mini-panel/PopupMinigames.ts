const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupMinigames extends cc.Component {
    @property(cc.Node)
    list: cc.Node = null;
    @property(cc.Node)
    panel: cc.Node = null;
    @property(cc.Node)
    background: cc.Node = null;
    @property(cc.Node)
    menuIcon: cc.Node = null;

    @property(cc.Node)
    jackPotContainer: cc.Node = null;

    @property(cc.Prefab)
    jackpotWinnerPrefab: cc.Prefab = null;

    private ttOffset = cc.v2(0, 0);
    private ttOffset2 = cc.v2(0, 0);
    private toggleRuning = false;

    onLoad() {
        cc.RedT.setting.popupMini = cc.RedT.setting.popupMini || {};
        this.background.active = false;
        this.background.opacity = 0;
        this.list.active = false;
        this.list.scale = 0;

        if (void 0 !== cc.RedT.setting.popupMini.position) {
            this.node.position = cc.RedT.setting.popupMini.position;
        }
        this.schedule(this.moveToEdge, 0.1, cc.macro.REPEAT_FOREVER);

        // init jackpot winner icon
        // const jackpot = cc.instantiate(this.jackpotWinnerPrefab);
        // const jackpotWinner = jackpot.getComponent(JackpotWinner);
        // jackpotWinner.popupMiniGame = this;
        // this.jackPotContainer.addChild(jackpot);
        // this.jackPotContainer.active = false;
    }

    onDestroy() {
        this.unschedule(this.moveToEdge);
    }
    onEnable() {
        this.panel.on(cc.Node.EventType.TOUCH_START, this.eventStart, this);
        this.panel.on(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this);
        this.panel.on(cc.Node.EventType.TOUCH_END, this.eventEnd, this);
        this.panel.on(cc.Node.EventType.TOUCH_CANCEL, this.eventEnd, this);
        this.panel.on(cc.Node.EventType.MOUSE_ENTER, this.setTop, this);
    }
    onDisable() {
        this.panel.off(cc.Node.EventType.TOUCH_START, this.eventStart, this);
        this.panel.off(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this);
        this.panel.off(cc.Node.EventType.TOUCH_END, this.eventEnd, this);
        this.panel.off(cc.Node.EventType.TOUCH_CANCEL, this.eventEnd, this);
        this.panel.off(cc.Node.EventType.MOUSE_ENTER, this.setTop, this);
    }
    eventStart(e) {
        this.setTop();
        this.ttOffset = cc.v2(e.touch.getLocationX() - this.node.position.x, e.touch.getLocationY() - this.node.position.y);
        this.ttOffset2 = cc.v2(
            e.touch.getLocationX() - (e.touch.getLocationX() - this.node.position.x),
            e.touch.getLocationY() - (e.touch.getLocationY() - this.node.position.y)
        );
    }
    eventMove(e) {
        this.node.position = cc.v3(e.touch.getLocationX() - this.ttOffset.x, e.touch.getLocationY() - this.ttOffset.y);
    }
    getCurrentSize() {
        let listBox = this.list.getBoundingBox();

        if (!this.list.active && this.jackPotContainer.active) {
            listBox = this.jackPotContainer.getBoundingBox();
        }

        return cc.v2(Math.max(this.node.width, listBox.width), Math.max(this.node.height, listBox.height));
    }
    moveToEdge() {
        const width = this.node.parent.width;
        const height = this.node.parent.height;
        const fixTopPadding = 100;
        const size = this.getCurrentSize();
        const maxX = width / 2 - size.x / 2;
        const maxY = height / 2 - size.y / 2;
        const deltaWidth = maxX - Math.abs(this.node.x);
        const deltaHeight = maxY - Math.abs(this.node.y);

        let posX, posY;
        if (deltaWidth < deltaHeight) {
            posY = this.node.y;
            posY = Math.min(maxY, posY);
            posY = Math.max(-maxY, posY);
            posX = this.node.x < 0 ? -maxX : maxX;
        } else {
            posX = this.node.x;
            posX = Math.min(maxX, posX);
            posX = Math.max(-maxX, posX);
            posY = this.node.y < 0 ? -maxY : maxY;
        }

        posY = Math.min(maxY - fixTopPadding, posY);

        this.node.runAction(cc.moveTo(0.1, posX, posY).easing(cc.easeSineOut()));
        cc.RedT.setting.popupMini.position = cc.v2(posX, posY);
    }

    eventEnd(e) {
        this.moveToEdge();
        const xChanger = this.ttOffset2.x - (e.touch.getLocationX() - this.ttOffset.x);
        const yChanger = this.ttOffset2.y - (e.touch.getLocationY() - this.ttOffset.y);
        if (xChanger < 5 && xChanger > -5 && yChanger < 5 && yChanger > -5) {
            this.toggle();
        }
    }

    toggle() {
        cc.RedT.audio.playClick();
        if (!this.toggleRuning) {
            this.toggleRuning = true;
            const menuAnimation = this.menuIcon.getComponent(cc.Animation);

            if (this.list.scale !== 0) {
                this.hideListGame();
                menuAnimation.play();
            } else {
                this.showListGame();
                menuAnimation.stop();
                this.menuIcon.getChildByName("icon").angle = 0;
            }
        }
    }
    showListGame() {
        this.background.active = true;
        this.background.runAction(cc.fadeTo(0.1, 224));
        cc.RedT.setting.popupMini.open = true;
        this.list.scale = 1;

        cc.tween(this.node)
            .to(0.2, { scale: 0, opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                this.list.active = true;
                cc.tween(this.menuIcon).to(0.2, { scale: 0.8 }, { easing: "sineOut" }).start();
            })
            .to(0.3, { scale: 1, opacity: 255 }, { easing: "sineIn" })
            .call(() => {
                this.toggleRuning = false;
            })
            .start();
    }

    hideListGame() {
        cc.RedT.setting.popupMini.open = false;

        cc.tween(this.node)
            .to(0.2, { scale: 0, opacity: 0 }, { easing: "sineIn" })
            .call(() => {
                this.background.active = false;
                this.toggleRuning = false;
                this.list.active = false;
                this.list.scale = 0;
            })
            .to(0.2, { scale: 1, opacity: 255 }, { easing: "sineOut" })
            .call(() => {
                cc.tween(this.menuIcon).to(0.2, { scale: 0.9 }, { easing: "sineOut" }).start();
            })
            .start();
    }

    setTop() {
        this.node.parent.insertChild(this.node, this.node.parent.childrenCount - 1);
    }
}
