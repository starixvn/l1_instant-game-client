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
    this.node.on('click', this.onClickSoundGame, this);
    this.initSound();
  }

  onDestroy() {
    this.node.off('click', this.onClickSoundGame, this);
  }

  initSound() {
    cc.RedT.isSoundGame() ? this.setSoundGameOn() : this.setSoundGameOff();
  }

  onClickSoundGame() {
    cc.RedT.audio.playClick();
    cc.RedT.isSoundGame() ? this.setSoundGameOff() : this.setSoundGameOn();
  }

  setSoundGameOn() {
    this.soundSprite.spriteFrame = this.soundOnFrame;
    cc.RedT.setSoundGame(true);
  }

  setSoundGameOff() {
    this.soundSprite.spriteFrame = this.soundOffFrame;
    cc.RedT.setSoundGame(false);
  }
}
