import axios from "axios";
import { Base64 } from "base64-string";
import * as i18n from "i18n/runtime-scripts/LanguageData";
import { FeatureConfig } from "../../configs/FeatureConfigs";
import MicrositeGameBase from "../../games/_base/MicrositeGameBase";
import GameManager from "../../manager/GameManager";
import MiniPanel from "../control/mini-panel/MiniPanel";
import { numberWithCommas } from "../helper/NumberHelper";
import { buildMicrositeGameUrl } from "../helper/UrlHelper";

export default class GameUtils {
    static base64: Base64;

    public static base64Decode(data: string): string {
        if (!this.base64) {
            this.base64 = new Base64();
        }
        return this.base64.decode(data);
    }

    public static base64Encode(data: string): string {
        if (!this.base64) {
            this.base64 = new Base64();
        }
        return this.base64.encode(data);
    }
    static remoteLocalization = {};

    public static async loadRemoteLocalization(gameId: number) {
        if (!this.remoteLocalization[gameId]) {
            const localization = await this.loadRemoteGameResource<cc.JsonAsset>(gameId, "localization.json");
            this.remoteLocalization[gameId] = localization.json;
        }
    }

    public static loadRemoteGameResource<T>(gameId: number, pathResource: string) {
        return this.loadRemote<T>(this.remoteGameResourceUrl(gameId, pathResource));
    }

    public static remoteGameResourceUrl(gameId: number, pathResource: string) {
        const url = buildMicrositeGameUrl(gameId);
        return `${url}/remote/${pathResource}`;
    }

    public static loadRemote<T>(url: string): Promise<T> {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadRemote(url, (err, asset: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset);
            });
        });
    }

    private static getRemoteTranslation(gameId: number, key: string, language: string) {
        return this.remoteLocalization[gameId]?.[key]?.[language];
    }

    public static async getRemoteDisplayGameName(gameId, breakline = false) {
        await this.loadRemoteLocalization(gameId);
        const list = ["generalGameNames", "gameNames"];
        breakline && list.unshift("lobbyNames");

        const currentLanguage = window.i18n?.curLang;
        const key = list.find((key) => this.getRemoteTranslation(gameId, key, currentLanguage));
        if (!key) {
            this.getRemoteTranslation(gameId, "gameNames", "en");
        }
        return this.getRemoteTranslation(gameId, key, currentLanguage);
    }

    public static async healthCheckMicrositeGame(gameId: number) {
        const url = `${buildMicrositeGameUrl(gameId)}/health`;
        try {
            const response = await axios.get(url);
            if (response.data?.toString().trim() === "healthy") {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    public static async openMicrositeGame(gameId: number, miniPanel: MiniPanel) {
        miniPanel?.showLoading(true);
        miniPanel?.loading?.setDefaultPercent();
        const available = await this.healthCheckMicrositeGame(gameId);
        if (available) {
            window.micrositeGameId = gameId;
            const prefix = FeatureConfig.PortraitMode ? "portrait-mode/" : "";
            const prefabName = "MicrositeGame";
            const prefabPath = `games/${prefix}${prefabName}`;
            cc.loader.loadRes(
                prefabPath,
                (completedCount, total, item) => {
                    miniPanel?.loading?.onProgress(completedCount, total, item);
                },
                (error, prefab) => {
                    this.handleCompleteLoadMicrositePrefab({ gameId, prefab, error }, miniPanel);
                }
            );
        } else {
            const gameName = await this.getRemoteDisplayGameName(gameId);
            miniPanel?.onConnectSocketFailed(gameName);
        }
    }

    private static handleCompleteLoadMicrositePrefab({ gameId, prefab, error }, miniPanel: MiniPanel) {
        if (!miniPanel?.isAlive()) {
            return;
        }
        if (error || prefab === null) {
            miniPanel?.onForceReload();
            return;
        }

        if (miniPanel.currentGameId === gameId) {
            const node = cc.instantiate<cc.Node>(prefab);
            const microsite = node.getComponent(MicrositeGameBase);
            microsite.miniPanel = miniPanel;
            miniPanel.addMicrositeGame(microsite, gameId);
        }
    }

    public static addFlyingText(parent: cc.Node, win: boolean, value: number, duration = 1, startY = 0, destY = 100) {
        const temp = new cc.Node().addComponent(cc.Label);
        temp.string = (win ? "+" : "-") + numberWithCommas(value, 2);
        temp.font = win ? cc.GameManager.winBetFont : cc.GameManager.acceptedBetfont;
        temp.lineHeight = 130;
        temp.fontSize = 40;
        temp.node.position = cc.v3(0, startY, 0);
        parent.addChild(temp.node);
        temp.node.runAction(
            cc.sequence(
                cc.moveTo(duration, cc.v2(0, startY + destY)),
                cc.callFunc(function () {
                    this.node.destroy();
                }, temp)
            )
        );
        return temp.node;
    }

    public static getBetChoiceString(choice: string): string {
        return i18n.t(`ui.choice_${choice}`);
    }

    public static capitalizeWords(str: string) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
        });
    }

    public static loadResource(path: string): Promise<cc.Prefab> {
        return new Promise((resolve) => {
            cc.loader.loadRes(path, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    public static getValueByCurrency(value: number, otherRate?: number): number {
        if (otherRate === undefined) {
            otherRate = 1;
        }
        return (value * otherRate) / GameManager.Instance.user.rate;
    }

    public static getChipQuantity(bet: number, options: number[]): any {
        const list = [...options].reverse();
        const chipValue = this.calcChipValue(list, bet);
        const values = chipValue.values;

        if (chipValue.chipTotal > 0) {
            values[0] = 1;
        }
        return values;
    }

    public static getChipValues(bet: number, options: number[]): any {
        const chipValue = this.calcChipValue(options, bet);
        return chipValue.values;
    }

    private static calcChipValue(list, total) {
        const values = {};
        let chipTotal = total;
        list.forEach((value) => {
            const count = Math.floor(chipTotal / value);
            values[value] = count;
            chipTotal = chipTotal % value;
        });

        return { values, chipTotal };
    }

    public static roundFixed(num: number, fixedNumber: number): number {
        const numToFixedDp = Number(num).toFixed(fixedNumber);
        return Number(numToFixedDp);
    }

    public static moveToOtherNode(node: cc.Node, destNode: cc.Node) {
        const position = destNode.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0, 0)));
        node.parent = destNode;
        node.position = cc.v3(position);
    }

    public static floatToNumber(label: cc.Label, end: number, duration: number, start?: number, noZeroSuffix = true) {
        start = start || parseFloat(label.string.replace(/,/g, "")) || 0;
        const range = Math.abs(end - start);
        if (!range) {
            return;
        }
        const stepTime = Math.max(duration / range, 0.05);
        const repeatCount = Math.floor(duration / stepTime);
        const stepValue = Math.floor(range / repeatCount);
        let value = start;
        label.node.stopAllActions();
        cc.tween(label)
            .repeat(
                repeatCount,
                cc
                    .tween(label)
                    .call(() => {
                        label.string = numberWithCommas(value, 1, noZeroSuffix);
                        value += stepValue;
                    })
                    .delay(stepTime)
            )
            .call(() => {
                label.string = numberWithCommas(end, 1, noZeroSuffix);
            })
            .start();
    }

    public static getAvatarSprite(avatarId: number): Promise<cc.SpriteFrame> {
        return new Promise((resolve) => {
            cc.loader.loadRes("profile-picture", cc.SpriteAtlas, (err, atlas) => {
                const frame = atlas.getSpriteFrame(avatarId ? avatarId : 1);
                resolve(frame);
            });
        });
    }

    public static getGameNameString(gameId): string {
        if (!gameId) {
            return "";
        }
        return i18n.t(`gameNames.${gameId}`);
    }

    public static getFilterValuesByStakeLevel(values: number[], gameConfigs: any) {
        let minBet = gameConfigs.minBet;
        let maxBet = gameConfigs.maxBet;

        if (cc.GameManager.userStakeLevel) {
            const minStake = cc.GameManager.userStakeLevel.minBet;
            const maxStake = cc.GameManager.userStakeLevel.maxBet;

            minBet = Math.max(minStake, minBet);
            maxBet = Math.min(maxStake, maxBet);
        }

        return values.map((a) => +a).filter((value) => value >= minBet && value <= maxBet);
    }

    public static createNodeFromPrefab(prefab: cc.Prefab) {
        return cc.instantiate(prefab);
    }

    public static hideNode(node: cc.Node, transitionTime = 0.3, onHidden?: () => void) {
        cc.tween(node)
            .to(transitionTime, { opacity: 0 })
            .call(() => {
                onHidden && onHidden();
            })
            .start();
    }

    public static showNode(node: cc.Node, transitionTime = 0.3) {
        cc.tween(node).to(transitionTime, { opacity: 255 }).start();
    }

    public static isIpad(): boolean {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /ipad/.test(userAgent);
    }

    public static getText(key: string, opt: any = {}) {
        return i18n.t(key, opt);
    }
}
