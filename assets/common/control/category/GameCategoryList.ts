import CategoryList from "./CategoryList";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCategoryList extends CategoryList {
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    scrollToSelectedGame(itemId: number) {
        const item = this.items.find((i) => i.itemId === itemId);
        const current = Math.abs(this.scrollView.getScrollOffset().x);
        const delta = item.node.convertToWorldSpaceAR(cc.v2(0, 0)).x - this.scrollView.node.convertToWorldSpaceAR(cc.v2(0, 0)).x;
        setTimeout(() => {
            this.scrollView.scrollToOffset(cc.v2(current + delta, 0), 0.5);
        }, 100);
    }
}
