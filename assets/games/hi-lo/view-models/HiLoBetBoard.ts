import BetChips from "../../../common/control/bet-chip/BetChips";
import GameUtils from "../../../common/utils/GameUtils";
import HiLoBetChipItem from "./HiLoBetChipItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoBetBoard extends BetChips {
    @property(cc.Node)
    disableLayer: cc.Node = null;

    @property(cc.Prefab)
    numberBetPrefab: cc.Prefab = null;

    @property
    isLimitChip = false;

    @property({
        type: cc.Integer,
        visible: function (this: HiLoBetBoard) {
            return this.isLimitChip;
        }
    })
    chipsNumber = 8;

    disableBetBoard(status: boolean) {
        this.disableLayer.active = status;
        this.leftButton && (this.leftButton.active = !status);
        this.rightButton && (this.rightButton.active = !status);
        this.disablePrevNextButtons(status);
    }

    createChips() {
        this.chipList.forEach((chip) => chip.destroy());
        this.chipList = [];
        this.chipValues.forEach((value, index) => {
            if (!this.isLimitChip || index < this.chipsNumber) {
                const node = this.createChipNode(value);
                this.chips.addChild(node);
                node.on("click", this.onClickBet.bind(this));
                this.chipList.push(node);
            }
        });

        this.updateChipLayout();
    }

    createChipNode(value: number): cc.Node {
        const node = GameUtils.createNodeFromPrefab(this.numberBetPrefab);
        node.getComponent(HiLoBetChipItem).renderBetChipItem(value);
        return node;
    }

    updateSelectedBet(targetName: string) {
        this.chips.children.forEach((chip) => {
            const isSelected = targetName === chip.name;
            chip.getComponent(HiLoBetChipItem).setSelectedBg(isSelected);
        });
    }

    highlightChip(chip: cc.Node, highlight: boolean) {
        chip.getComponent(HiLoBetChipItem).setSelectedBg(highlight);
    }

    disablePrevNextButtons(status: boolean) {
        if (this.leftButton && this.rightButton) {
            this.leftButton.active = !status;
            this.rightButton.active = !status;
            if (this.selectedIndex <= 0) {
                this.leftButton.active = false;
            }
        }
    }
}
