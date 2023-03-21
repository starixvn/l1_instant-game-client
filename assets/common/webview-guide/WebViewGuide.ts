import CommonDialog from "../control/CommonDialog";
import LoadWebView from "../control/LoadWebView";
import { buildGameGuideUrl } from "../helper/UrlHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WebViewGuide extends LoadWebView {
    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    @property()
    themeName = "blue";

    onLoad() {
        super.onLoad();
        if (this.commonDialog) {
            this.commonDialog.addOnDidHide(() => {
                this.node.destroy();
            });
        }
    }

    initURL(
        gameId: number,
        language: string,
        configStake: { minBet: number; maxBet: number; used: boolean },
        isInPromotionTime: boolean,
        fractionalOddsFormat: boolean | undefined = false,
        specialDirection = ""
    ) {
        const guideUrl = buildGameGuideUrl();
        let url = `${guideUrl}/${language}?gId=${gameId}&t=${
            this.themeName
        }&p=${isInPromotionTime}&f=si&v=${Date.now()}&fof=${fractionalOddsFormat}`;
        url += `&minBet=${configStake.minBet}&maxBet=${configStake.maxBet}${specialDirection}`;
        this.url = url;
    }

    setURL(url: string) {
        const domain = buildGameGuideUrl();
        this.url = `${domain}${url}`;
    }

    loadWebView() {
        if (this.url) {
            this.showLoading();
            this.hideWebView();

            this.webView.url = this.url;
        }
    }
}
