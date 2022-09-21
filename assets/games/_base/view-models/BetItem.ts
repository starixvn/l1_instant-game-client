import BlinkNode from "../../../common/control/BlinkNode";
import { numberWithCommas } from "../../../common/helper/NumberHelper";
import { getLowercaseObjectKeys } from "../../../common/helper/ObjectHelper";
import GameUtils from "../../../common/utils/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BetItem extends cc.Component {
    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Label)
    ownBet: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    @property(cc.Node)
    chipNode: cc.Node = null;

    @property(cc.Node)
    highlight: cc.Node = null;

    @property(cc.Node)
    highlightBackground: cc.Node = null;

    @property(cc.Node)
    highlightBorder: cc.Node = null;

    @property(cc.Node)
    normalBorder: cc.Node = null;

    @property
    enabledHighlightOdds = false;

    @property({
        type: cc.Node,
        visible: function () {
            return this.enabledHighlightOdds;
        }
    })
    highlightOddsBackground: cc.Node = null;

    public betCallback = (e) => {};

    private _ownBetValue: number;

    get ownBetValue() {
        return this._ownBetValue;
    }

    public clearOwnBetValue() {
        this._ownBetValue = 0;
    }

    public setOwnBet(bet: number) {
        this._ownBetValue = bet;
        if (this.ownBet) {
            this.ownBet.string = bet > 0 ? numberWithCommas(bet) : "";
        }
    }

    protected setTotalBet(bet: number) {
        if (this.totalBet) {
            this.totalBet.string = bet > 0 ? numberWithCommas(bet) : "";
        }
    }

    public onBetClick(e) {
        cc.GameManager.playClick();
        this.betCallback(e);
    }

    public setTotalBetsData(data: any) {
        const totalBetsKeys = getLowercaseObjectKeys(data);
        const value = data[totalBetsKeys[this.node.name.toLowerCase()]];
        this.setTotalBet(GameUtils.getValueByCurrency(value || 0));
    }

    public setOwnBetsData(data: any) {
        const ownBetsKeys = getLowercaseObjectKeys(data);
        const ownBet = data[ownBetsKeys[this.node.name.toLowerCase()]];
        ownBet && this.setOwnBet(ownBet);
    }

    public setOdd(value: string) {
        if (this.odds) {
            this.odds.string = `1:${value}`;
        }
    }

    public highLightOdds(boostedChoice) {
        const color = cc.Color.WHITE;
        if (boostedChoice && this.enabledHighlightOdds) {
            this.odds.node.color = color.fromHEX("#FA3A35");
            this.highlightOddsBackground.active = true;
        } else this.odds.node.color = color;
    }

    public clearChips() {
        this.chipNode.destroyAllChildren();
    }

    public clearBet() {
        if (this.chipNode) {
            this.clearChips();
        }
        this.setOwnBet(0);
        this.setTotalBet(0);
    }

    public setHighlight(highlight: boolean, isAnimated = true) {
        this.setHighlightItems(highlight, isAnimated);
    }

    public resetHighlight() {
        this.setHighlightItems(false);
    }

    public stopAnimation() {
        this.blinkNode.node.stopAllActions();
        this.blinkNode.node.opacity = 255;
    }

    protected get blinkNode() {
        return this.highlight.getComponent("BlinkNode") as BlinkNode;
    }

    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        this.highlight.active = highlight && isAnimated;
        if (this.highlightBackground) {
            this.highlightBackground.active = highlight && isAnimated;
        }
        if (this.highlightBorder) {
            this.highlightBorder.active = highlight;
        }
        if (this.normalBorder) {
            this.normalBorder.active = !highlight;
        }
    }

    protected resetHighlightOptions() {
        this.highlight.active = false;
        if (this.highlightBackground) {
            this.highlightBackground.active = false;
        }
    }

    protected setHighlightItemsOptions(highlight: boolean, isAnimated = true) {
        this.highlight.active = highlight && isAnimated;
        if (this.highlightBackground) {
            this.highlightBackground.active = highlight && isAnimated;
        }

        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }

        if (this.normalBorder) {
            this.normalBorder.active = !highlight;
        }
    }
}
