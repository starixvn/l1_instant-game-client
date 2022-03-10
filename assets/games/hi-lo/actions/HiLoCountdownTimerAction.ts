import { numberPad } from "../../../common/helper/NumberHelper";
import HiLo from "../view-models/HiLo";

export const updateClockTime =
    (mainGame: HiLo) =>
    ({ remaining }) => {
        const clock = mainGame.animatedTime;
        if (!clock.node.active) {
            clock.node.active = true;
        }

        if (remaining <= mainGame.config.betTime) {
            clock.setTime(numberPad(remaining, 2));
        }
    };
