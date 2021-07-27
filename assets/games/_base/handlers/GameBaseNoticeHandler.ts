import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameUtils from "../../../common/utils/GameUtils";
import NoticeUtil from "../../../common/utils/NoticeUtil";
import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseNoticeHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any): boolean {
        if (!data.notice) {
            return false;
        }

        const notice = data.notice;
        const errorCode = data.notice.errorCode;
        const gameName = GameUtils.getGameNameString(notice.gameTypeId);
        const { minBet, maxBet, gameRoundId } = notice;

        if (!gameRoundId || gameRoundId === this.main.roundId) {
            const opt = { gameName, gameRoundId, errorCode, minBet: numberWithCommas(minBet), maxBet: numberWithCommas(maxBet) };
            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, opt);
            if (text) {
                this.main.showMiniWarning(text);
            }
        }

        return true;
    }
}
