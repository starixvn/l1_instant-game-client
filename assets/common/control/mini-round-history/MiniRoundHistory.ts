import * as _ from "lodash";

import BlinkNode from "../BlinkNode";
import MiniRoundHistoryItem from "./MiniRoundHistoryItem";
import MiniRoundHistoryTip from "./MiniRoundHistoryTip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRoundHistory extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(MiniRoundHistoryTip)
    tip: MiniRoundHistoryTip = null;

    @property(cc.Node)
    nodeNext: cc.Node = null;

    protected items: MiniRoundHistoryItem[] = [];
    protected selectedNode: cc.Node = null;
    private listener = {
        onEnter: (node: cc.Node) => {
            this.selectedNode = node;
            this.tip.node.position = cc.v3(node.x, this.tip.node.y);
            const data = node.getComponent(MiniRoundHistoryItem).data;
            this.tip.setData(data);
            this.tip.show();
        },
        onLeave: (node: cc.Node) => {
            this.selectedNode = null;
            this.tip.show(false);
        }
    };

    protected checkShowNext = () => false;
    protected dataLogs: any[] = [];
    private cachedDataLog: any[] = [];

    onLoad() {
        this.items = this.content.children.map((child) => child.getComponent(MiniRoundHistoryItem));
        this.items.forEach((item) => {
            item.node.active = false;
            item.listener = this.listener;
        });

        this.initNextDot();
        this.schedule(this.updateDisplayNextItem, 1);
    }

    onDestroy() {
        this.unschedule(this.updateDisplayNextItem);
    }

    init(condition: () => boolean) {
        this.checkShowNext = condition;
    }

    protected onUpdate(node: cc.Node) {
        const data = node.getComponent(MiniRoundHistoryItem).data;
        this.tip.node.active && this.tip.setData(data);
    }

    public setData(data: any[]) {
        const updateNow = !this.dataLogs || this.dataLogs.length !== data.length;
        this.dataLogs = _.cloneDeep(data);

        if (updateNow) {
            this.updateDisplayNextItem(0);
        }
    }

    protected hideAllDots() {
        this.items.forEach((item) => {
            item.node.active = false;
        });
    }

    protected updateOrderNode(data: any[], showNext: boolean) {
        this.hideAllDots();
        const startIndex = showNext ? 1 : 0;
        data.forEach((log, index) => {
            const calculatedIndex = startIndex + index;
            if (calculatedIndex >= this.items.length) {
                return;
            }
            const item = this.items[calculatedIndex];
            item.setData(log);
            item.node.active = true;
        });
        this.selectedNode && this.onUpdate(this.selectedNode);
    }

    protected initNextDot() {
        if (this.nodeNext) {
            this.nodeNext.addComponent(BlinkNode).interval = 0.5;
            this.nodeNext.active = false;
        }
    }

    updateDisplayNextItem(dt: number) {
        if (this.dataLogs.length === 0 || this.items.length === 0) {
            return;
        }
        if (this.nodeNext) {
            const lastVisible = this.nodeNext.active;
            this.nodeNext.active = this.checkShowNext();
            const needUpdate = this.cachedDataLog.length === 0 || lastVisible !== this.nodeNext.active;
            let data;
            if (needUpdate) {
                data = this.dataLogs;
                this.cachedDataLog = [...this.dataLogs];
            } else {
                data = this.cachedDataLog;
            }
            this.updateOrderNode(data, this.nodeNext.active);
            this.items[0].node.active = !this.nodeNext.active;
            if (this.nodeNext.active) {
                this.tip.show(false);
            }
        } else {
            this.updateOrderNode(this.dataLogs, false);
            this.items[0].node.active = true;
        }
    }
}
