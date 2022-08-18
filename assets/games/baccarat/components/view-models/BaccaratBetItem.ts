import MiniSedieBetItem from "../../../sedie-mini/MiniSedieBetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class BaccaratBetItem extends MiniSedieBetItem {
    public setHighlight(highlight: boolean, isAnimated = true) {
        super.setHighlight(highlight, isAnimated);

        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
    }

    public resetHighlight() {
        this.highlight.active = false;
    }
}
