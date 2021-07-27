const { ccclass, property } = cc._decorator;

@ccclass
export default class PaginationCommonItem extends cc.Component {
    @property(cc.Node)
    bgSelect: cc.Node = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Label)
    number: cc.Label = null;

    page: number;
}
