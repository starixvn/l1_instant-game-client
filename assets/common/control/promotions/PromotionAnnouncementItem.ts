import NoticeUtil from "../../utils/NoticeUtil";

const { ccclass, property } = cc._decorator;

export const PromotionAnnouncementItemEvent = {
    JOIN_GAME: "JOIN_GAME"
};

@ccclass
export default class PromotionAnnouncementItem extends cc.Component {
    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    message: cc.Label = null;

    @property(cc.Button)
    joinButton: cc.Button = null;

    @property(cc.Node)
    bgDisable: cc.Node = null;    

    public setData(data: any) {
        this.title.string = NoticeUtil.getMessageByLocale(data.title);
        this.title.node.getComponent(cc.LabelShadow).enabled = true;
        this.message.string = NoticeUtil.getMessageByLocale(data.messages);
        this.joinButton.interactable = data.isActive;
        this.bgDisable.active = data.isActive ? false : true;
        const text = this.joinButton.node.getChildByName("text");
        text.color = data.isActive ? cc.color(209, 42, 33) : cc.color(83, 78, 78);
        this.joinButton.node.on("click", this.onClickJoinGame.bind(this, data.gameId));
    }

    onClickJoinGame(gameId: number) {
        this.node.emit(PromotionAnnouncementItemEvent.JOIN_GAME, gameId);
    }
}
