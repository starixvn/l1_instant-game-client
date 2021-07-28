const { ccclass, property } = cc._decorator;

@ccclass
export default class HandleGameSound extends cc.Component {
    @property(cc.Sprite)
    soundSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    soundOnFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    soundOffFrame: cc.SpriteFrame = null;

    onLoad() {
        this.node.on("click", this.onClickSoundGame, this);
        this.initSound();
    }

    onDestroy() {
        this.node.off("click", this.onClickSoundGame, this);
    }

    initSound() {
        cc.GameManager.isSoundGame() ? this.setSoundGameOn() : this.setSoundGameOff();
    }

    onClickSoundGame() {
        cc.GameManager.playClick();
        cc.GameManager.isSoundGame() ? this.setSoundGameOff() : this.setSoundGameOn();
    }

    setSoundGameOn() {
        this.soundSprite.spriteFrame = this.soundOnFrame;
        cc.GameManager.setSoundGame(true);
    }

    setSoundGameOff() {
        this.soundSprite.spriteFrame = this.soundOffFrame;
        cc.GameManager.setSoundGame(false);
    }
}
