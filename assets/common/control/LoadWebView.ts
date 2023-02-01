import { guideDomain } from "./../../configs/Configs";
import CustomWebView from "./CustomWebView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadWebView extends cc.Component {
    @property(CustomWebView)
    webView: CustomWebView = null;

    @property(cc.Node)
    loading: cc.Node = null;

    protected url: string;
    public needDisableDivScroll = false;

    protected onWebViewLoaded = () => {};

    onLoad() {
        this.webView.node.on(
            "loaded",
            () => {
                const paddingTime = 0.3;
                cc.tween(this.node)
                    .delay(paddingTime)
                    .call(() => {
                        this.hideLoading();
                    })
                    .start();

                if (this.needDisableDivScroll) {
                    this.webView.disableDivScroll();
                }
                this.showWebView();
            },
            this
        );
    }

    showWebView() {
        this.webView._impl.setVisible(true);
        this.onWebViewLoaded();
    }

    hideWebView() {
        this.webView._impl.setVisible(false);
    }

    destroyDivIframe() {
        this.webView._impl.destroy();
    }

    showLoading() {
        this.loading.active = true;
    }

    hideLoading() {
        this.loading.active = false;
    }

    loadWebView() {
        if (this.url) {
            this.showLoading();

            this.webView.url = this.url;
        }
    }

    sendDataToIframe(configs: any) {
        this.onWebViewLoaded = () => {
            this.webView._impl._iframe.contentWindow.postMessage(JSON.stringify(configs), "*");
        };
    }
}
