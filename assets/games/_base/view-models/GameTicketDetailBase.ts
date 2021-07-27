const { ccclass, property } = cc._decorator;

@ccclass
export default class GameTicketDetailBase extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    mainFrame: cc.Node = null;

    betLogDetails = null;
    settlementResult = null;

    onLoad() {
        this.content.children.forEach((child) => child.destroy());

        const commonDialog = this.mainFrame.getComponent("CommonDialog");
        commonDialog.onDidHide = () => {
            this.node.destroy();
        };
    }

    public setData(betLogDetails: any, settlementResult: any) {
        this.betLogDetails = betLogDetails;
        this.settlementResult = settlementResult;
    }
}
