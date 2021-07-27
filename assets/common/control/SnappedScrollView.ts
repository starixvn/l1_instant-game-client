const { ccclass, property } = cc._decorator;

@ccclass
export default class SnappedScrollView extends cc.Component {
    @property
    itemSize = 85;

    @property
    spacing = 8;

    @property
    enableHalfSpacing = true;

    public onScrollEnded = () => {};

    private readonly calculatedPercent: number[] = [];
    private minDisplayIndex = 0;

    public scroll: cc.ScrollView;
    private scrollBegan = false;

    onLoad() {
        this.scroll = this.getComponent(cc.ScrollView);
    }

    initCalculatedPercent() {
        const count = this.scroll.content.childrenCount;
        const contentWidth = count * this.itemSize + (count + 1) * this.spacing;
        const maxOffset = contentWidth - this.scroll.node.width;
        const haftSpacing = this.spacing / 2;
        for (let i = 0; i < count; i++) {
            let offset = (this.itemSize + this.spacing) * i + (this.enableHalfSpacing ? haftSpacing : 0);
            if (offset > maxOffset) {
                offset = maxOffset;
            }

            const percent = offset / maxOffset;
            this.calculatedPercent.push(percent);
        }
    }

    start() {
        this.initCalculatedPercent();
    }

    onScroll(scroll: cc.ScrollView, eventType) {
        if (eventType === cc.ScrollView.EventType.SCROLL_ENDED) {
            if (!this.scrollBegan) {
                return;
            }
            this.scrollBegan = false;
            const percent = this.getPercent();
            this.calculateMinDisplayIndex(percent);
            this.scrollTo(this.minDisplayIndex);
            this.onScrollEnded();
        }
        if (eventType === cc.ScrollView.EventType.SCROLL_BEGAN) {
            this.scrollBegan = true;
        }
    }

    calculateMinDisplayIndex(percent: number) {
        for (let i = 0; i < this.calculatedPercent.length; i++) {
            if (this.calculatedPercent[i] <= percent && percent <= this.calculatedPercent[i + 1]) {
                const delta1 = percent - this.calculatedPercent[i];
                const delta2 = this.calculatedPercent[i + 1] - percent;
                if (delta1 + delta2 > 0) {
                    this.minDisplayIndex = delta1 < delta2 ? i : i + 1;
                }
                break;
            }

            if (percent <= this.calculatedPercent[i]) {
                this.minDisplayIndex = i;
                break;
            }
            if (this.calculatedPercent[i] >= 1) {
                break;
            }
        }
    }

    scrollTo(index: number) {
        this.minDisplayIndex = index;
        this.scroll.scrollToPercentHorizontal(this.calculatedPercent[index], 0.3);
    }

    getPercent(): number {
        const offset = -this.scroll.getScrollOffset().x;
        if (offset < 0) {
            return 0;
        }
        const percent = offset / this.scroll.getMaxScrollOffset().x;
        if (percent > 1) {
            return 1;
        }
        return percent;
    }

    getMinDisplayIndex(): number {
        return this.minDisplayIndex;
    }
}
