const { ccclass, property } = cc._decorator;

@ccclass
export default class RotateNode extends cc.Component {
  @property
  degreePerSecond = 360;

  onEnable() {
    cc.tween(this.node)
      .by(1, {
        angle: -this.degreePerSecond,
      })
      .repeatForever()
      .start();
  }
}
