import CategoryItem from "./CategoryItem";

const { ccclass, property } = cc._decorator;

interface CategoryItemData {
    itemId: number;
}

@ccclass
export default class CategoryList extends cc.Component {
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    protected items: CategoryItem[] = [];

    itemClickCallback = (itemId: number) => {};

    protected onItemClick(itemId: number) {}

    setItems(items: CategoryItemData[]): void {
        items.forEach((item, index) => {
            const categoryItem = this.addItem(item);
            if (index > 0) {
                categoryItem.showLeftSeperator();
            }
            this.items.push(categoryItem);
        });
    }

    addItem(data: CategoryItemData): CategoryItem {
        const node = cc.instantiate(this.itemPrefab);
        this.content.addChild(node);
        const item = node.getComponent(CategoryItem);
        item.itemId = data.itemId;
        item.onCategoryClickCallback = () => {
            this.itemClickCallback(data.itemId);
            this.onItemClick(data.itemId);
        };
        return item;
    }

    updateVisibleItems(items: number[]) {
        this.items.forEach((item) => {
            item.node.active = items.includes(item.itemId);
        });
    }
}
