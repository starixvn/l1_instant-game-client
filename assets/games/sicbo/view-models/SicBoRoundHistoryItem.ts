import NoticeUtil from "../../../common/utils/NoticeUtil";
import { SicBoBetType } from "./SicBoCommon";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class SicBoRoundHistoryItem extends cc.Component {
    @property(cc.Sprite)
    dice1: cc.Sprite = null;

    @property(cc.Sprite)
    dice2: cc.Sprite = null;

    @property(cc.Sprite)
    dice3: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    total: cc.Sprite = null;

    @property(cc.Sprite)
    result: cc.Sprite = null;

    @property(cc.Sprite)
    highlight: cc.Sprite = null;

    onLoad() {
        cc.tween(this.highlight.node)
            .repeatForever(
                cc.tween().to(0.4, { opacity: 150 }, { easing: "cubicIn" }).delay(0.4).to(0.4, { opacity: 255 }, { easing: "cubicOut" })
            )
            .start();
    }
    updateLabels(data: any) {
        const { settlementResult, result } = data;

        this.total.spriteFrame = this.atlas.getSpriteFrame(`stats_${result.dice1 + result.dice2 + result.dice3}`);

        const suffix = NoticeUtil.getSuffixSpriteName();
        if (settlementResult[SicBoBetType.anyTriple]) {
            this.result.spriteFrame = this.atlas.getSpriteFrame(`stats_B${suffix}`);
        } else {
            if (settlementResult[SicBoBetType.big]) {
                this.result.spriteFrame = this.atlas.getSpriteFrame(`stats_T${suffix}`);
            } else {
                this.result.spriteFrame = this.atlas.getSpriteFrame(`stats_X${suffix}`);
            }
        }
    }
}
