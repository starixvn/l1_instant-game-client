const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomWebView extends cc.WebView {
    _impl: any;

    setOpacity(opacity: number) {
        this.node.opacity = opacity;
        if (this._impl) {
            this._impl._setOpacity(opacity);
        }
    }
}
