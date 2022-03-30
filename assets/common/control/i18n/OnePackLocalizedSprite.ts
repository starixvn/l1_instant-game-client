const SpriteFrameSet = require("SpriteFrameSet");
const LocalizedSprite = require("LocalizedSprite");

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

@ccclass
@executeInEditMode
@menu("i18n/OnePackLocalizedSprite")
export default class OnePackLocalizedSprite extends LocalizedSprite {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property()
    prefix = "";

    @property({ type: SpriteFrameSet, visible: false, override: true })
    spriteFrameSet: SpriteFrameSet[] = [];

    protected sprite: cc.Sprite;

    onLoad() {
        this.fetchRender();
    }

    fetchRender() {
        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            this.sprite = sprite;
            this.updateSprite(window.i18n.curLang);
        }
    }

    getSpriteFrameByLang(lang: string) {
        const spriteName = `${this.prefix}_${lang}`;
        return this.atlas.getSpriteFrame(spriteName);
    }

    getDefaultSprite() {
        return this.atlas.getSpriteFrame(this.prefix);
    }

    updateSprite(language) {
        if (!this.sprite && this.node.active) {
            cc.error("Failed to update localized sprite, sprite component is invalid!");
            return;
        }

        let spriteFrame = this.getSpriteFrameByLang(language);
        if (!spriteFrame) {
            spriteFrame = this.getDefaultSprite();
        }

        this.sprite.spriteFrame = spriteFrame;
    }
}
