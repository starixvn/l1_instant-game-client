import * as _ from "lodash";

import BetItem from "../../../games/_base/view-models/BetItem";
import { lazyInject } from "../../../manager/Application";
import { ComponentSystem, ICashSystem, ICreditSystem } from "../../../manager/System";
import { nFormatter } from "../../helper/NumberHelper";
import GameUtils from "../../utils/GameUtils";
import SnappedScrollView from "../SnappedScrollView";
import BetChipItem from "./BetChipItem";
import ChipConfig from "./ChipConfig";

const { ccclass, property } = cc._decorator;
type OnChangedBet = (bet: string) => void;

@ccclass
export default class BetChips extends ComponentSystem implements ICreditSystem, ICashSystem {
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

    public chipValues: number[];
    public onChanged: OnChangedBet = (bet) => {};
    public readonly chipFlyingTime: number = 0.8;
    public readonly loginUserChipFlyingTime: number = 0.5;
    public readonly chipDelayFlyingTime: number = 1.25;

    @lazyInject(ChipConfig)
    public readonly chipConfig: ChipConfig;
    private selectedIndex = 0;
    private chipList: cc.Node[] = [];

    constructor() {
        super();
    }

    customizeCredit(): void {
        this.chipValues = [1, 5, 10, 50, 100, 200, 500, 1000, 2000];
    }

    customizeCash(): void {
        this.chipValues = [10, 20, 50, 100, 200, 500, 1000, 5000, 10000, 20000];
    }

    onLoad() {
        //use chipVaues here ,
        this.createChips();

        this.leftButton.active = false;
        this.chipList = [...this.chips.children];
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

    createChips() {
        this.chipValues.forEach((value) => {
            const node = cc.instantiate(this.chipPrefab);
            this.chips.addChild(node);

            this.updateChipItem(node, value);

            const button = node.getComponent(cc.Button);
            const event = new cc.Component.EventHandler();
            event.target = this.node;
            event.component = "BetChips";
            event.handler = "onClickBet";
            button.clickEvents.push(event);
        });

        const layout = this.chips.getComponent(cc.Layout);
        layout.enabled = true;
        layout.updateLayout();
        layout.enabled = false;
    }

    updateChipItem(node: cc.Node, value: number) {
        const chip = node.getComponent(BetChipItem);
        chip.sprite.spriteFrame = this.chipAltas.getSpriteFrame(this.chipConfig.getBigChipSpriteName(value));
        chip.label.string = nFormatter(value, 0);
        node.name = `${value}`;
    }

    updateLastChip(value: number) {
        this.updateChipItem(this.chipList[this.chipList.length - 1], value);
    }

    onEnable() {
        this.selectedIndex = 0;
        this.snappedScrollView.scrollTo(0);
        this.scrollToSelectedIndex();
    }

    public init(onChanged: OnChangedBet) {
        this.onChanged = onChanged;
        this.setCurrentBet(this.chipValues[0].toString());
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

    public onClickBet(event) {
        const bet = event.target.name;
        this.betChipClickAudio.play();
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
            this.startMoveChip(chip, cc.v2(destBoxInChipBoxSpacePosition.x, destBoxInChipBoxSpacePosition.y));
        });
    }

    public moveChipsWithRandomAmount(chipsBox: cc.Node, destBox: cc.Node, flyTime: number = this.chipFlyingTime, randomAmount = 3) {
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
                this.startMoveChip(cloneChip, cc.v2(destBoxInChipBoxSpacePosition), flyTime);
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
        chipBox.children.length > 0 && this.playMultiChipsSound();

        _.forEach(chipBox.children, (chip) => {
            const cloneChip = cc.instantiate(chip);
            cloneChip.position = dealerBoxInChipBoxSpacePosition;
            chipBox.addChild(cloneChip);
            const randomPosition = this.getRandomPositionChip(cloneChip, chipBox);
            cloneChip.runAction(this.moveChipTo(randomPosition));
        });
    }

    public placeChipBet(bet: number, destNode: cc.Node, startNode: cc.Node = null, onComplete = () => {}) {
        let chipPosition: cc.Vec3;
        const isLoginUserPlaceBet = startNode == null;

        if (startNode) {
            chipPosition = startNode.parent.convertToWorldSpaceAR(startNode.position);
        } else {
            const chip = this.chips.children.filter((child) => child.name === bet.toString())[0];
            chipPosition = chip.parent.convertToWorldSpaceAR(chip.position);
        }

        chipPosition = destNode.convertToNodeSpaceAR(chipPosition);
        const chipNode = this.createChip(bet);
        chipNode.position = chipPosition;
        const randomPosition = this.getRandomPositionChip(chipNode, destNode);
        destNode.addChild(chipNode);

        if (isLoginUserPlaceBet) {
            this.playSingleChipsSound();
        }
        chipNode.runAction(
            cc.sequence(
                this.moveChipTo(randomPosition, isLoginUserPlaceBet ? this.loginUserChipFlyingTime : this.chipFlyingTime),
                cc.callFunc(() => {
                    onComplete();
                })
            )
        );
    }

    public getChipNode(bet: number): cc.Node {
        return this.chips.children.find((child) => child.name === bet.toString());
    }

    public moveChipWithCallback({ chipNode, bet, destNode, startNode, onComplete, delayDestroy, duration, fadeDuration = 1 }) {
        let chipPosition: cc.Vec3;
        const isLoginUserPlaceBet = startNode == null;
        if (startNode) {
            chipPosition = startNode.parent.convertToWorldSpaceAR(startNode.position);
        } else {
            let chip = this.chips.children.filter((child) => child.name === bet.toString())[0];
            if (!chip) {
                const chips = this.chips.children.filter((child) => +child.name < bet).sort((b, a) => +a.name - +b.name);
                chip = chips[0];
                bet = +chip.name;
            }
            chipPosition = chip.parent.convertToWorldSpaceAR(chip.position);
        }

        chipPosition = destNode.convertToNodeSpaceAR(chipPosition);
        chipNode.position = chipPosition;
        destNode.addChild(chipNode);

        if (isLoginUserPlaceBet) {
            this.playSingleChipsSound();
        }

        chipNode.runAction(
            cc.sequence(
                this.moveChipTo(cc.v2(0, 0), duration),
                cc.delayTime(delayDestroy),
                cc.callFunc(() => {
                    chipNode.runAction(cc.sequence(cc.fadeOut(fadeDuration), cc.removeSelf(true)));
                    onComplete();
                })
            )
        );
    }

    public initChips(chipsData: any, chipsBox: cc.Node) {
        if (!chipsData) {
            return;
        }

        const chipBets = Object.keys(chipsData);

        _.forEach(chipBets, (chipBet) => {
            const chipCountOfBet = chipsData[chipBet];
            for (let i = 0; i < chipCountOfBet; i++) {
                const chip = this.createChip(+chipBet);
                const randomPosition = this.getRandomPositionChip(chip, chipsBox);
                chip.position = cc.v3(randomPosition);
                chipsBox.addChild(chip);
            }
        });
    }

    public playMultiChipsSound() {}

    public playSingleChipsSound() {
        cc.GameManager.isSoundGame() && this.singleChipAudio.play();
    }

    private startMoveChip(chip: cc.Node, destBoxInChipBoxSpacePosition: cc.Vec2, flyTime: number = this.chipFlyingTime) {
        chip.runAction(this.moveChipTo(destBoxInChipBoxSpacePosition, flyTime));
        this.destroyChip(chip, flyTime);
    }

    private moveChipTo(position: cc.Vec2, time: number = this.chipFlyingTime): cc.ActionInterval {
        return cc.moveTo(time, position).easing(cc.easeSineOut());
    }

    private getRandomPositionChip(chip: cc.Node, box: cc.Node): cc.Vec2 {
        const xDest = _.random(Math.floor(chip.width / 2), Math.floor(box.width - chip.width / 2) + 1);
        const yDest = _.random(Math.floor(chip.height / 2), Math.floor(box.height - chip.height / 2) + 1);
        return cc.v2(xDest, yDest);
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
                const chipNode = this.createChip(+chip);
                layoutNode.addChild(chipNode);
            }
        });

        return node;
    }

    public showChipOwnBet(item: BetItem, bet: number) {
        item.clearChips();
        const nodes = this.createChipNodes(bet);
        nodes.forEach((node) => {
            const randomPosition = this.getRandomPositionChip(node, item.chipNode);
            node.position = cc.v3(randomPosition);
            item.chipNode.addChild(node);
        });
    }

    private createChipNodes(bet: number): cc.Node[] {
        const nodes = [];
        const options = [...this.chipValues].reverse();
        const values = GameUtils.getChipValues(bet, options);
        const keys = Object.keys(values).sort((a, b) => +b - +a);
        keys.forEach((chip) => {
            const count = values[chip];
            for (let i = 0; i < count; i++) {
                const chipNode = this.createChip(+chip);
                nodes.push(chipNode);
            }
        });

        return nodes;
    }

    public createChip(bet: number): cc.Node {
        const chip = new cc.Node();
        // chip.group = "Chip";
        const chipSprite = chip.addComponent(cc.Sprite);
        const name = this.chipConfig.getSmallChipSpriteName(bet);

        chipSprite.spriteFrame = this.chipAltas.getSpriteFrame(name);
        return chip;
    }

    public createBigChip(bet: number): cc.Node {
        const chip = cc.instantiate(this.chipPrefab);
        this.updateChipItem(chip, bet);
        return chip;
    }

    private destroyChip(chip: cc.Node, delayTime: number) {
        this.node.runAction(
            cc.sequence(
                cc.delayTime(delayTime * 1.5),
                cc.callFunc(() => chip.destroy())
            )
        );
    }

    private updateSelectedBet(targetName: string) {
        const highlight = {
            scale: 1.05, //1.15,
            offsetY: 3 //,
        };
        this.chips.children.forEach((chip) => {
            const chipItem = chip.getComponent(BetChipItem);
            chip.stopAllActions();
            if (chip.name === targetName) {
                chipItem.highlight.active = true;
                chip.zIndex = 2;
                cc.tween(chip)
                    .to(0.2, {
                        scale: highlight.scale,
                        position: cc.v2(chip.position.x, highlight.offsetY)
                    })
                    .start();
            } else {
                chipItem.highlight.active = false;
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
        const item = this.chipList[this.selectedIndex].name;
        this.setCurrentBet(item);
    }
}
