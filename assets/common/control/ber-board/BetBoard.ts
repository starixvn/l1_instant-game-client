import { lazyInject } from "../../../manager/Application";
import { nFormatter } from "../../helper/NumberHelper";
import BetBoardConfig from "./BetBoardConfig";

const { ccclass, property } = cc._decorator;

export interface BetInfo {
    choice: string;
    bet: number;
    betItem: cc.Node;
    maxBet: number;
}

@ccclass
export default class BetBoard extends cc.Component {
    @property(cc.Button)
    okButton: cc.Button = null;

    @property(cc.Node)
    itemContainer: cc.Node = null;

    @lazyInject(BetBoardConfig)
    private readonly config: BetBoardConfig;

    public info: any = null;

    public callback = {
        acceptedBet: (info: any) => {},
        changedBet: (info: any) => {},
        cancel: (info: any) => {},
        getPreset: () => 0
    };

    onLoad(): void {
        this.updateItems();
    }

    updateItems() {
        const listItem = this.config.items;
        this.itemContainer.children.forEach((child, index) => {
            const value = listItem[index];
            child.name = value;

            let valueString = "";
            if (!this.config.shortenValue || value === "MAX") {
                valueString = value;
            } else {
                valueString = `${nFormatter(value)}`;
            }

            if (value !== "MAX") {
                valueString = `+${valueString}`;
            }

            child.children[0].getComponent(cc.Label).string = valueString;
        });
    }

    public onAcceptBet() {
        cc.RedT.audio.playClick();
        if (this.checkBetLimit()) {
            this.callback.acceptedBet(this.info);
            this.closeBoard();
        }
    }

    protected checkBetLimit(): boolean {
        return true;
    }

    protected closeBoard() {
        this.node.active = false;
        this.info = null;
    }

    public onCloseClick() {
        cc.RedT.audio.playClick();
        this.close();
    }

    public onClearClick() {
        cc.RedT.audio.playClick();
        this.info.bet = 0;
        this.betChanged();
    }

    public close() {
        this.info && this.callback.cancel(this.info);
        this.closeBoard();
    }

    public show(info: any) {
        if (this.info) {
            if (info.choice === this.info.choice) {
                return;
            }
            this.callback.cancel(this.info);
        }

        this.info = info;
        this.info.bet = info.bet || this.callback.getPreset();
        this.info.bet = Math.min(this.info.bet, this.info.maxBet);
        this.node.active = true;
        this.betChanged();
    }

    public onItemBetClicked(e) {
        cc.RedT.audio.playClick();
        const amount = parseInt(e.target.name) || this.info.maxBet;
        this.info.bet += amount;
        this.info.bet = Math.min(this.info.bet, this.info.maxBet);
        this.betChanged();
    }

    protected betChanged() {
        this.callback.changedBet(this.info);
        this.okButton.interactable = this.info.bet > 0;
    }
}
