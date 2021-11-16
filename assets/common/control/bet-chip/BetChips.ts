import * as _ from "lodash";

import BetItem from "../../../games/_base/view-models/BetItem";
import GameUtils from "../../utils/GameUtils";
import SnappedScrollView from "../SnappedScrollView";
import ChipConfig from "./ChipConfig";
import ChipView, { ChipDisplayType } from "./ChipView";

const { ccclass, property } = cc._decorator;
type OnChangedBet = (bet: string) => void;

@ccclass
export default class BetChips extends cc.Component {
    @property(cc.Node)
    chips: cc.Node = null;

    @property(cc.AudioSource)
    singleChipAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    multiChipAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    betChipClickAudio: cc.AudioSource = null;

    @property(cc.SpriteAtlas)
    chipAltas: cc.SpriteAtlas = null;

    @property(SnappedScrollView)
    snappedScrollView: SnappedScrollView = null;

    @property(cc.Node)
    leftButton: cc.Node = null;

    @property(cc.Node)
    rightButton: cc.Node = null;

    @property
    displaySize = 6;

    @property
    movingStep = 1;

    @property(cc.Prefab)
    chipPrefab: cc.Prefab = null;

    @property(cc.SpriteFrame)
    lowValueChipSprite: cc.SpriteFrame = null;

    public chipValues: number[] = [];
    public onChanged: OnChangedBet = (bet) => {};
    public readonly chipFlyingTime: number = 0.8;
    public readonly loginUserChipFlyingTime: number = 0.5;
    public readonly chipDelayFlyingTime: number = 1.25;

    private selectedIndex = 0;
    private chipList: cc.Node[] = [];

    onLoad() {
        this.leftButton.active = false;
        this.snappedScrollView.onScrollEnded = () => {
            const min = this.snappedScrollView.getMinDisplayIndex();

            if (this.selectedIndex < min) {
                this.selectedIndex = min;
                this.selectedIndex = Math.min(this.selectedIndex, this.chipList.length - this.displaySize);
            } else if (this.selectedIndex > min + this.displaySize - 1) {
                this.selectedIndex = min + this.displaySize - 1;
            }

            this.updateArrowVisibility();
            this.updateSelectedChipValue();
        };
    }

    setChipValues(values: number[]) {
        if (values.length === 0) {
            return;
        }
        this.chipValues = values;
        this.createChips();
        this.chipList = [...this.chips.children];
        this.setCurrentBet(this.chipValues[0].toString());
        this.snappedScrollView.initCalculatedPercent();
    }

    createChips() {
        this.chips.destroyAllChildren();
        this.chipValues.forEach((value) => {
            const node = this.createBigChip(value);
            this.chips.addChild(node);

            node.on("click", this.onClickBet.bind(this));
        });

        const layout = this.chips.getComponent(cc.Layout);
        layout.enabled = true;
        layout.updateLayout();
        layout.enabled = false;
    }

    getChipDisplayType(index: number) {
        return index > this.chipValues.length - 3 ? ChipDisplayType.VIP : ChipDisplayType.Normal;
    }

    updateLastChip(value: number) {
        const chipView = this.chipList[this.chipList.length - 1].getComponent(ChipView);
        chipView.setValue(value);
        chipView.setColor(ChipConfig.getInstance().getChipColor(value));
    }

    onEnable() {
        this.selectedIndex = 0;
        this.snappedScrollView.scrollTo(0);
        this.scrollToSelectedIndex();
    }

    public init(onChanged: OnChangedBet) {
        this.onChanged = onChanged;
    }

    public onPrevious() {
        cc.GameManager.playClick();
        this.selectedIndex -= this.movingStep;
        this.scrollToSelectedIndex();
    }

    public onNext() {
        cc.GameManager.playClick();
        this.selectedIndex += this.movingStep;
        this.scrollToSelectedIndex();
    }

    private updateArrowVisibility() {
        this.leftButton.active = true;
        this.rightButton.active = true;
        if (this.selectedIndex <= 0) {
            this.selectedIndex = 0;
            this.leftButton.active = false;
        } else if (this.selectedIndex >= this.chipList.length - 1) {
            this.selectedIndex = this.chipList.length - 1;
            this.rightButton.active = false;
        }
    }

    private scrollToSelectedIndex() {
        this.updateArrowVisibility();

        const min = this.snappedScrollView.getMinDisplayIndex();
        if (this.selectedIndex <= min) {
            this.snappedScrollView.scrollTo(min > 0 ? min - 1 : 0);
        }
        if (this.selectedIndex >= min + this.displaySize - 1) {
            this.snappedScrollView.scrollTo(min + 1);
        }
        this.updateSelectedChipValue();
    }

    public onClickBet(target) {
        const bet = target.node.name;
        cc.GameManager.playSFX(this.betChipClickAudio.clip);
        let i = 0;
        for (; i < this.chipList.length; i++) {
            if (this.chipList[i].name === bet) {
                break;
            }
        }
        this.selectedIndex = i;
        this.scrollToSelectedIndex();
    }

    public setCurrentBet(bet: string) {
        this.updateSelectedBet(bet);
        this.onChanged(bet);
    }

    public moveChips(chipsBox: cc.Node, destBox: cc.Node) {
        const destBoxPosition = destBox.parent.convertToWorldSpaceAR(destBox.position);
        const destBoxInChipBoxSpacePosition = chipsBox.convertToNodeSpaceAR(destBoxPosition);

        _.forEach(chipsBox.children, (chip) => {
            this.moveChipThenDestroy(chip, destBoxInChipBoxSpacePosition, this.chipFlyingTime);
        });
    }

    public moveChipsWithRandomAmount(chipsBox: cc.Node, destBox: cc.Node, flyTime: number) {
        const randomAmount = 3;
        const destBoxPosition = destBox.parent.convertToWorldSpaceAR(destBox.position);
        const cloneChipsBox = cc.instantiate(chipsBox);
        cloneChipsBox.destroyAllChildren();
        chipsBox.parent.addChild(cloneChipsBox);

        const destBoxInChipBoxSpacePosition = cloneChipsBox.convertToNodeSpaceAR(destBoxPosition);
        const chipsCount = _.round(_.random(1, randomAmount));

        for (let i = 0; i < chipsCount; i++) {
            const chip = chipsBox.children[i];

            if (chip) {
                const cloneChip = cc.instantiate(chip);
                cloneChipsBox.addChild(cloneChip);
                this.moveChipThenDestroy(cloneChip, destBoxInChipBoxSpacePosition, flyTime);
            }
        }

        this.node.runAction(
            cc.sequence(
                cc.delayTime(flyTime * 1.5),
                cc.callFunc(() => cloneChipsBox.destroy())
            )
        );
    }

    public payChipsToWinningBetItem(chipBox: cc.Node, dealerBox: cc.Node) {
        const dealerBoxPosition = dealerBox.parent.convertToWorldSpaceAR(dealerBox.position);
        const dealerBoxInChipBoxSpacePosition = chipBox.convertToNodeSpaceAR(dealerBoxPosition);

        _.forEach(chipBox.children, (chip) => {
            const cloneChip = cc.instantiate(chip);
            cloneChip.position = dealerBoxInChipBoxSpacePosition;
            chipBox.addChild(cloneChip);
            const randomPosition = this.getRandomPositionChip(cloneChip, chipBox);
            cloneChip.runAction(this.moveChipTo(randomPosition, this.chipFlyingTime));
        });
    }

    public placeChipToChipBox(bet: number, destNode: cc.Node, startNode: cc.Node, onComplete: () => void) {
        const isLoginUserPlaceBet = startNode == null;
        this.checkLoginUserPlaceBet(startNode);
        const chipPosition = destNode.convertToNodeSpaceAR(this.getPositonChipOnContainer(startNode, bet));
        const chipNode = this.createSmallChip(bet);
        chipNode.position = chipPosition;
        const randomPosition = this.getRandomPositionChip(chipNode, destNode);
        destNode.addChild(chipNode);

        chipNode.runAction(
            cc.sequence(
                this.moveChipTo(randomPosition, isLoginUserPlaceBet ? this.loginUserChipFlyingTime : this.chipFlyingTime),
                cc.callFunc(() => {
                    if (onComplete) {
                        onComplete();
                    }
                })
            )
        );
    }

    public getChipNode(bet: number): cc.Node {
        return this.chips.children.find((child) => child.name === bet.toString());
    }

    private checkLoginUserPlaceBet(startNode: cc.Node) {
        const isLoginUserPlaceBet = startNode == null;
        if (isLoginUserPlaceBet) {
            this.playSingleChipsSound();
        }
    }

    private getPositonChipOnContainer(startNode: cc.Node, bet: number) {
        let chipPosition: cc.Vec3;
        if (startNode) {
            chipPosition = startNode.parent.convertToWorldSpaceAR(startNode.position);
        } else {
            let chip = this.getChipNode(bet);
            if (!chip) {
                const chips = this.chips.children.filter((child) => +child.name < bet).sort((b, a) => +a.name - +b.name);
                chip = chips[0];
                bet = +chip.name;
            }
            chipPosition = chip.parent.convertToWorldSpaceAR(chip.position);
        }

        return chipPosition;
    }

    public moveChipWithCallback({ chipNode, bet, destNode, startNode, onComplete, delayDestroy, duration, fadeDuration }) {
        this.checkLoginUserPlaceBet(startNode);
        const chipPosition = destNode.convertToNodeSpaceAR(this.getPositonChipOnContainer(startNode, bet));
        chipNode.position = chipPosition;
        destNode.addChild(chipNode);

        chipNode.runAction(
            cc.sequence(
                this.moveChipTo(cc.v3(0, 0), duration),
                cc.delayTime(delayDestroy),
                cc.callFunc(() => {
                    chipNode.runAction(cc.sequence(cc.fadeOut(fadeDuration), cc.removeSelf(true)));
                    onComplete();
                })
            )
        );
    }

    public addChipsToChipBox(rate: number, chipsData: any, chipsBox: cc.Node) {
        if (!chipsData) {
            return;
        }

        const values = Object.keys(chipsData);
        _.forEach(values, (value) => {
            const chipCountOfBet = chipsData[value];
            const convertChip = GameUtils.getValueByCurrency(+value, rate);
            const convertValues = GameUtils.getChipQuantity(convertChip, this.chipValues);
            for (let i = 0; i < chipCountOfBet; i++) {
                Object.keys(convertValues).forEach((chipValue) => {
                    let count = convertValues[chipValue];
                    for (; count > 0; count--) {
                        const chip = this.createSmallChip(+chipValue);
                        const randomPosition = this.getRandomPositionChip(chip, chipsBox);
                        chip.position = randomPosition;
                        chipsBox.addChild(chip);
                    }
                });
            }
        });
    }

    public playSingleChipsSound() {
        cc.GameManager.playSFX(this.singleChipAudio.clip);
    }

    private moveChipThenDestroy(chip: cc.Node, destBoxInChipBoxSpacePosition: cc.Vec3, flyTime: number) {
        cc.tween(chip)
            .then(this.moveChipTo(destBoxInChipBoxSpacePosition, flyTime))
            .delay(0.5 * flyTime)
            .call(() => chip.destroy())
            .start();
    }

    private moveChipTo(position: cc.Vec3, time: number): cc.ActionInterval {
        return cc.moveTo(time, cc.v2(position.x, position.y)).easing(cc.easeSineOut());
    }

    private getRandomPositionChip(chip: cc.Node, box: cc.Node): cc.Vec3 {
        const chipBoundingBox = chip.getBoundingBox();
        const xDest = _.random(Math.floor(chip.width / 4), Math.floor(box.width - chipBoundingBox.width / 2) + 1);
        const yDest = _.random(Math.floor(chip.height / 4), Math.floor(box.height - chipBoundingBox.height / 2) + 1);
        return cc.v3(xDest, yDest);
    }

    public createChipStack(bet: number, options: number[]) {
        const values = GameUtils.getChipValues(bet, options);
        const node = new cc.Node();
        const layoutNode = new cc.Node();
        layoutNode.y = -13; //half size chip
        node.addChild(layoutNode);
        layoutNode.anchorY = 0;
        const layout = layoutNode.addComponent(cc.Layout);
        layout.type = cc.Layout.Type.VERTICAL;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.verticalDirection = cc.Layout.VerticalDirection.BOTTOM_TO_TOP;
        layout.spacingY = -22;
        const keys = Object.keys(values).sort((a, b) => +b - +a);
        keys.forEach((chip) => {
            const count = values[chip];
            for (let i = 0; i < count; i++) {
                const chipNode = this.createSmallChip(+chip);
                layoutNode.addChild(chipNode);
            }
        });

        return node;
    }

    public createSmallChip(bet: number): cc.Node {
        if (bet === 0) {
            const node = this.createLowValueChip();
            node.rotation = _.random(0, 360);
            return node;
        }
        const chip = this.createBigChip(bet);
        const chipView = chip.getComponent(ChipView);
        chipView.applyForSmallChip();
        chip.scale = 0.29;
        chip.group = "Chip";
        return chip;
    }

    private createLowValueChip() {
        const node = new cc.Node();
        const sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.lowValueChipSprite;
        return node;
    }

    public createBigChip(value: number): cc.Node {
        const chip = cc.instantiate(this.chipPrefab);
        const chipView = chip.getComponent(ChipView);
        chipView.setColor(ChipConfig.getInstance().getChipColor(value));
        chipView.setValue(value);
        const index = this.chipValues.findIndex((chipValue) => chipValue === value);
        chipView.setType(this.getChipDisplayType(index));
        return chip;
    }

    private updateSelectedBet(targetName: string) {
        this.chips.children.forEach((chip) => {
            chip.stopAllActions();

            const activeNode = chip.getChildByName("active");
            if (chip.name === targetName) {
                activeNode.active = true;
                chip.zIndex = 2;
                cc.tween(chip)
                    .to(0.2, {
                        scale: 1.15,
                        position: cc.v2(chip.position.x, 12)
                    })
                    .start();
            } else {
                activeNode.active = false;
                chip.zIndex = 1;
                cc.tween(chip)
                    .to(0.2, {
                        scale: 1,
                        position: cc.v2(chip.position.x, 0)
                    })
                    .start();
            }
        });
    }

    updateSelectedChipValue() {
        if (this.chipList.length === 0) {
            return;
        }
        const item = this.chipList[this.selectedIndex].name;
        this.setCurrentBet(item);
    }

    //for instant game
    private createChipNodes(bet: number): cc.Node[] {
        const nodes = [];
        const values = GameUtils.getChipQuantity(bet, this.chipValues);
        const keys = Object.keys(values).sort((a, b) => +b - +a);
        keys.forEach((chip) => {
            const count = values[chip];
            for (let i = 0; i < count; i++) {
                const chipNode = this.createSmallChip(+chip);
                nodes.push(chipNode);
            }
        });

        return nodes;
    }

    public showChipOwnBet(item: BetItem, bet: number) {
        item.clearChips();
        const nodes = this.createChipNodes(bet);
        nodes.forEach((node) => {
            const randomPosition = this.getRandomPositionChip(node, item.chipNode);
            node.position = randomPosition;
            item.chipNode.addChild(node);
        });
    }

    public payChipsToWinningBetItemWithAmount(chipBox: cc.Node, dealerBox: cc.Node, amount: number) {
        console.log("amount ", amount);
        const dealerBoxPosition = dealerBox.parent.convertToWorldSpaceAR(dealerBox.position);
        const dealerBoxInChipBoxSpacePosition = chipBox.convertToNodeSpaceAR(dealerBoxPosition);

        const chipNodes = this.createChipNodes(amount);
        chipNodes.forEach((node) => {
            node.position = dealerBoxInChipBoxSpacePosition;
            chipBox.addChild(node);
            const randomPosition = this.getRandomPositionChip(node, chipBox);
            node.runAction(this.moveChipTo(randomPosition, this.chipFlyingTime));
        });
    }
}
