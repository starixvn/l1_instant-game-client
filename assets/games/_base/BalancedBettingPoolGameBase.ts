import * as i18n from "i18n/runtime-scripts/LanguageData";
import * as _ from "lodash";

import BetBoard, { BetInfo } from "../../common/control/ber-board/BetBoard";
import DraggableItem from "../../common/control/draggable/DraggableItem";
import PresetBet from "../../common/control/PresetBet";
import { numberWithCommas } from "../../common/helper/NumberHelper";
import SocketIOMiniGameBase from "./SocketIOMiniGameBase";
import BalancedBettingPoolBetItem from "./view-models/BalancedBettingPoolBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class BalancedBettingPoolGameBase extends SocketIOMiniGameBase {
    @property(cc.Node)
    betBoardContainer: cc.Node = null;

    @property(cc.Prefab)
    betBoardPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    presetBetPrefab: cc.Prefab = null;

    @property(cc.Node)
    balanceBetNoticeContainer: cc.Node = null;

    @property(cc.Prefab)
    balanceBetNoticePrefab: cc.Prefab = null;

    @property(cc.Node)
    historyButton: cc.Node = null;

    private presetBet: PresetBet;
    private betBoard: BetBoard;
    private presetBetValue = 0;
    private presetBetSettingKey: string;

    protected selectedBetAmountLabels: { [choice: string]: cc.Label };
    protected selectedBetAmountSprites: { [choice: string]: cc.Sprite };
    protected selectedBetAmountClickedImages: { [choice: string]: cc.SpriteFrame };
    protected selectedBetAmountUnClickedImages: { [choice: string]: cc.SpriteFrame };
    protected betPercentages: { [choice: string]: cc.Label };

    public totalBets: { [choice: string]: number };

    onLoad() {
        super.onLoad();

        this.initPresetBetBoard();
        this.initBetBoard();

        const draggableItem = this.getComponent(DraggableItem);
        draggableItem.touchCallback.start = (node) => {
            this.node.parent.insertChild(this.node, this.node.parent.childrenCount - 1);
        };
    }

    onSelectBetChoiceClick(event: cc.Event, choice: string) {
        if (!this.gameConfigs) {
            return;
        }
        this.setSelectedBetAmountSpriteFrame(choice, true);
        const betInfo = {
            choice: choice,
            bet: 0,
            betItem: null,
            maxBet: this.gameConfigs.maxbet
        };
        this.betBoard.show(betInfo);
        this.betBoard.node.runAction(
            cc.sequence(
                cc.delayTime(0.05),
                cc.callFunc(() => {
                    SocketIOMiniGameBase.adjustPosition(this.betBoard, this.node);
                })
            )
        );
    }

    private initPresetBetBoard() {
        const node = cc.instantiate(this.presetBetPrefab);
        this.presetBet = node.getComponent(PresetBet);
        this.presetBet.onChangedBet = this.changedPresetBet.bind(this);
        this.presetBet.getPreset = this.getPresetBet.bind(this);
        this.node.addChild(node);
        node.active = false;

        this.presetBetSettingKey = `presetBet_${this.gameName}_${cc.GameManager.user.UID}`;
        this.presetBetValue = parseFloat(cc.sys.localStorage.getItem(this.presetBetSettingKey)) || 0;
    }

    private changedPresetBet(value: number) {
        this.presetBetValue = value;
        cc.sys.localStorage.setItem(this.presetBetSettingKey, this.presetBetValue);
    }

    private getPresetBet() {
        return this.presetBetValue;
    }

    protected initBetBoard() {
        const betBoardNode = cc.instantiate(this.betBoardPrefab);
        this.betBoard = betBoardNode.getComponent(BetBoard);
        this.betBoard.callback = {
            getPreset: this.getPresetBet.bind(this),
            acceptedBet: this.onAcceptedBet.bind(this),
            changedBet: this.onChangedBet.bind(this),
            cancel: this.onCancelBet.bind(this)
        };

        this.betBoardContainer && this.betBoardContainer.addChild(betBoardNode);
        this.betBoard.node.active = false;
    }

    onAcceptedBet(info: BetInfo) {
        const { choice, bet } = info;

        this.resetSelectedBetAmountLabel(choice);
        this.setSelectedBetAmountSpriteFrame(choice, false);

        if (!this.validateBet()) {
            return;
        }

        this.sendBetRequest(choice, bet);
    }

    onChangedBet(info: BetInfo) {
        const { bet, choice } = info;
        const maxBet = this.gameConfigs.maxbet;
        const betAmount = bet > maxBet ? maxBet : bet;
        const selectedBetAmountLabel = this.selectedBetAmountLabels[choice];
        selectedBetAmountLabel.string = numberWithCommas(betAmount);
    }

    onCancelBet(info: BetInfo) {
        const { choice } = info;
        this.resetSelectedBetAmountLabel(choice);
        this.setSelectedBetAmountSpriteFrame(choice, false);
    }

    resetSelectedBetAmountLabel(choice: string) {
        const selectedBetAmountLabel = this.selectedBetAmountLabels[choice];
        selectedBetAmountLabel.string = i18n.t(`ui.input_bet`).toUpperCase();
    }

    setSelectedBetAmountSpriteFrame(choice: string, isClicked: boolean) {
        const selectedBetAmountSprite = this.selectedBetAmountSprites[choice];
        selectedBetAmountSprite.spriteFrame = isClicked
            ? this.selectedBetAmountClickedImages[choice]
            : this.selectedBetAmountUnClickedImages[choice];
    }

    validateBet() {
        if (!this.isReadyBet()) {
            return false;
        }

        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
            return false;
        } else {
            this.lockBet();
            return true;
        }
    }

    sendBetRequest(choice: string, amount: number) {
        const betData = {
            amount: amount,
            betChoice: choice
        };
        this.socket && this.socket.connected && this.socket.emit("bet", betData);
    }

    openPresetBetDialog() {
        cc.GameManager.playClick();
        this.presetBet.toggle();
    }

    showBetPercentage(choice: string, percent: number) {
        const label = this.betPercentages[choice];
        label.string = `${percent}%`;
    }

    resetDataAndUI() {
        super.resetDataAndUI();

        _.values(this.betPercentages).forEach((label) => {
            label.string = "0%";
        });
        this.hideBalanceBetNotice();
    }

    balanceBet() {
        this.disableHistoryButton();
        const totalBets = _.values(this.totalBets);
        const balancedBetAmount = Math.min(...[totalBets[0] ?? 0, totalBets[1] ?? 0]);
        this.betItems.forEach((item) => (item as BalancedBettingPoolBetItem).balanceBet(balancedBetAmount));
    }

    showBalanceBetNotice() {
        const balanceBetNotice = cc.instantiate(this.balanceBetNoticePrefab);
        this.balanceBetNoticeContainer.addChild(balanceBetNotice);
        this.disableHistoryButton();
        this.balanceBet();
    }

    hideBalanceBetNotice() {
        this.balanceBetNoticeContainer.destroyAllChildren();
    }

    closeGame() {
        super.closeGame();
        this.betBoard && this.betBoard.close();
        this.presetBet && this.presetBet.forceClose();
    }

    enableHistoryButton() {
        this.historyButton.opacity = 255;
        const button = this.historyButton.getComponent(cc.Button);
        button.interactable = true;
    }

    disableHistoryButton() {
        this.historyButton.opacity = 130;
        const button = this.historyButton.getComponent(cc.Button);
        button.interactable = false;
    }
}
