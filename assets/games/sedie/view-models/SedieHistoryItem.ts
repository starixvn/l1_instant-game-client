import SedieHistoryItemBase from '../../_base/view-models/SedieHistoryItemBase';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistoryItem extends SedieHistoryItemBase {
    @property(cc.Label)
    odd: cc.Label = null;

    @property(cc.Label)
    even: cc.Label = null;

    @property(cc.Label)
    red2: cc.Label = null;

    @property(cc.Label)
    red3: cc.Label = null;

    @property(cc.Label)
    red4: cc.Label = null;

    @property(cc.Label)
    white3: cc.Label = null;

    @property(cc.Label)
    white4: cc.Label = null;

    public itemCallback = () => {};

    _betLog: any;

    get betLog() {
        return this._betLog;
    }

    set betLog(value: any) {
        this._betLog = value;
        this.itemCallback();
    }
}
