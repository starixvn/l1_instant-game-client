import BaseComponent from "../BaseComponent";
import MiniPanel from "../mini-panel/MiniPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameIconMenu extends BaseComponent {
    @property(cc.Node)
    content: cc.Node = null;

    public miniPanel: MiniPanel;

    onLoad() {
        if (this.content) {
            this.content.destroyAllChildren();
            this.initItems();
        }
    }

    getList() {
        return null;
    }

    async initItems() {
        const list = this.getList();
        for (const id of list) {
            const node = await this.addItem(id);
            if (node) {
                node.on("click", this.itemPressed.bind(this, id));
            }
        }

        if (!this.isAlive()) {
            return;
        }
        this.onInitialized();
    }

    onInitialized() {}

    async addItem(id: number): Promise<cc.Node> {
        return null;
    }

    itemPressed(id: number) {
        cc.GameManager.playClick();
        cc.sys.localStorage.setItem(`UserSetting_game_${id}`, "");
    }
}
