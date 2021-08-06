const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieRoundHistoryItem extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property
    prefix = "";

    public setValue(value: number) {
        if (!this.sprite || !this.atlas) {
            return;
        }

        let spriteName = `${this.prefix}_white`;
        if (value % 2) {
            spriteName = `${this.prefix}_red`;
        }

        this.sprite.spriteFrame = this.atlas.getSpriteFrame(spriteName);
    }
}
