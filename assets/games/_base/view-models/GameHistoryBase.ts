import PaginationCommon from "../../../common/control/pagination/PaginationCommon";
import { numberWithCommas } from "../../../common/helper/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameHistoryBase extends cc.Component {
    @property(PaginationCommon)
    pages: PaginationCommon = null;

    @property(cc.Node)
    content: cc.Node = null;

    protected gameName: string;

    init(gameName) {
        this.gameName = gameName;
    }

    onLoad() {
        this.pages.init(this);
    }

    onEnable() {
        this.addDataObserver(this.gameName);
        this.get_data();
    }

    addDataObserver(gameName: string) {
        cc.GameManager.addDataObserver(`${gameName}History`, this.receivedData.bind(this));
    }

    onDisable() {
        this.removeDataObserver(this.gameName);
        this.content.destroyAllChildren();
        this.node.destroy();
    }

    removeDataObserver(gameName: string) {
        cc.GameManager.removeDataObserver(`${gameName}History`);
    }

    receivedData(data) {
        if (data[this.gameName] && data[this.gameName].history) {
            this.onData(data[this.gameName].history);
        }
    }

    get_data(page = 1) {
        cc.GameManager.sendToMainSocket({ g: { [this.gameName]: { getHistory: { page: page } } } });
    }

    onData(data) {}

    static handleSomeItemRowData(context: any, item: any, log: any) {
        item.amountLabel.string = numberWithCommas(log.totalAmount);
        item.winLabel.string = numberWithCommas(log.betwin);
        item.winLabel.node.color = log.betwin <= 0 ? cc.Color.WHITE : cc.Color.YELLOW;

        item.time = "";
        item.round = log.phien;
        item.result = log.result;
        item.betLogDetails = log.betLogDetails;
        item.settlementResult = log.settlementResult;

        item.showTicketDetail = (round, time, result, betLogDetails, settlementResult) => {
            context.showTicketDetail(round, time, result, betLogDetails, settlementResult);
        };
    }
}
