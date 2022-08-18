import Baccarat from "../../view-models/Baccarat";
import BaccaratBetItem from "./BaccaratBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratBetOptions extends cc.Component {
    @property({ type: BaccaratBetItem })
    betItems: BaccaratBetItem[] = [];

    main: Baccarat;

    initBetOptions(main: Baccarat) {
        this.main = main;
        main.betItems = this.betItems;
    }

    onBetClick(event) {
        this.main.onBetItemClick(event);
    }
}
