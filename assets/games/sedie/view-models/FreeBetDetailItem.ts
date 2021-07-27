
const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeBetDetailItem extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Label)
    value: cc.Label = null;
}
