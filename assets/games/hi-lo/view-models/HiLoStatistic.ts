import { CardModel } from "../../../common/control/new-card/view-models/NewCard";
import GameUtils from "../../../common/utils/GameUtils";
import HiLoStatisticItem from "./HiLoStatisticItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoStatistic extends cc.Component {
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    statisticContainer: cc.Node = null;

    @property(cc.ScrollView)
    statsScrollView: cc.ScrollView = null;

    @property
    itemSize = 10;

    layout: cc.Layout;
    public spaceX: number;
    private readonly itemWidth = 46;

    onLoad() {
        this.layout = this.statisticContainer.getComponent(cc.Layout);
        this.spaceX = this.layout.spacingX;
    }

    onEnable() {
        this.statisticContainer.getComponent(cc.Widget).left = 0;
    }

    clearCards() {
        this.statisticContainer.destroyAllChildren();
    }

    updateItems(cards: CardModel[]) {
        this.clearCards();
        cards.forEach((card) => {
            this.createStatisticItem(card);
        });

        this.updatePositionHighlight();

        if (cards.length > this.itemSize) {
            this.updateContentPosition(this.getOffsetX(cards.length - this.itemSize));
        }

        this.layout && this.layout.updateLayout();
    }

    updatePositionHighlight() {
        const cardComps = this.statisticContainer.getComponentsInChildren(HiLoStatisticItem);
        cardComps.forEach((comp, index) => {
            comp.highlight.active = index === cardComps.length - 1;
        });
    }

    private getOffsetX(itemNumbers: number): number {
        return -this.statsScrollView.node.width / 2 - itemNumbers * (this.itemWidth + this.spaceX);
    }

    updateContentPosition(offsetX: number) {
        cc.tween(this.statisticContainer)
            .to(
                0.3,
                { position: cc.v3(offsetX, this.statisticContainer.position.y, this.statisticContainer.position.z) },
                { easing: "sineOut" }
            )
            .start();
    }

    createStatisticItem(card: CardModel) {
        const itemNode = GameUtils.createNodeFromPrefab(this.itemPrefab);
        this.statisticContainer.addChild(itemNode);
        const itemComp = itemNode.getComponent(HiLoStatisticItem);
        itemComp.setData(card);
    }
}
