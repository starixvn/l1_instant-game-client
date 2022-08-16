import MiniPanel from "../../../common/control/mini-panel/MiniPanel";
import MiniRoundHistory from "../../../common/control/mini-round-history/MiniRoundHistory";
import GameUtils from "../../../common/utils/GameUtils";
import { GameIds } from "../../../configs/SabaConfigs";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import BaccaratBetOptions from "../components/view-models/BaccaratBetOptions";
import BaccaratConfigs from "./BaccaratConfigs";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Baccarat extends SocketIOMiniGameBase {
    @property(cc.Animation)
    animation: cc.Animation = null;

    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    @property(cc.Node)
    tipContainer: cc.Node = null;

    public resultAnimating = false;
    public originalDishPosition = cc.v2(0, 6);
    public betOptionsUI: BaccaratBetOptions = null;

    onLoad() {
        super.onLoad();
        this.relocationChipNode();
        const mini = cc.instantiate(this.miniRoundHistoryPrefab);

        this.miniRoundHistoryContainer.addChild(mini);
    }

    relocationChipNode() {
        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = GameIds.Baccarat;
        this.setConfig(new BaccaratConfigs());
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        // this.animation.node.active = false;
    }

    onDestroy() {
        super.onDestroy();
        this.miniRoundHistoryContainer.isValid && this.miniRoundHistoryContainer.destroyAllChildren();
    }

    initHandlers() {
        super.initHandlers();
    }

    private initBetOptions(node: cc.Node) {
        this.betOptionsUI = node.getComponent(BaccaratBetOptions);
        this.betOptionsUI.initBetOptions(this);
    }
}
