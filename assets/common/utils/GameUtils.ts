import * as i18n from "i18n/runtime-scripts/LanguageData";

import GameManager from "../../manager/GameManager";
import { numberWithCommas } from "../helper/NumberHelper";

export default class GameUtils {
    public static addFlyingText(parent: cc.Node, win: boolean, value: number, duration = 1, startY = 0, destY = 100) {
        const temp = new cc.Node().addComponent(cc.Label);
        temp.string = (win ? "+" : "-") + numberWithCommas(value);
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
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
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
        let total = bet;
        const values = {};
        list.forEach((value) => {
            const count = Math.floor(total / value);
            values[value] = count;
            total = total % value;
        });

        if (total > 0) {
            values[0] = 1;
        }
        return values;
    }

    public static getChipValues(bet: number, options: number[]): any {
        let total = bet;
        const values = {};
        options.forEach((value) => {
            const count = Math.floor(total / value);
            values[value] = count;
            total = total % value;
        });
        return values;
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
}
