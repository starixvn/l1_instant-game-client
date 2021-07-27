import { numberWithCommas } from "../../../common/helper/NumberHelper";
import { ComponentSystem, ICashSystem, ICreditSystem } from "../../../manager/System";

const { ccclass, property } = cc._decorator;

export interface PlayerData {
    id: string;
    red: any;
    name: string;
    avatarId: string;
    type: boolean;
    idleCount: number;
}

@ccclass
export default class RoomPlayer extends ComponentSystem implements ICreditSystem, ICashSystem {
    @property(cc.Label)
    nickname: cc.Label = null;

    @property(cc.Label)
    balance: cc.Label = null;

    @property(cc.Sprite)
    avatar: cc.Sprite = null;

    data: PlayerData;

    static readonly MAX_IDLE_COUNT: number = 2;
    MAX_BALANCE_DISPLAY: number;

    customizeCredit(): void {
        this.MAX_BALANCE_DISPLAY = 9999;
    }

    customizeCash(): void {
        this.MAX_BALANCE_DISPLAY = 99999;
    }

    get isIdle() {
        return this.data.idleCount > RoomPlayer.MAX_IDLE_COUNT;
    }

    setInfo(data) {
        this.node.active = true;
        this.node.opacity = 0;

        if (data) {
            this.data = data;
            this.node.runAction(cc.fadeTo(1, 255));
            this.setBalance(data.red);
            this.setAvatar(data.avatarId);

            if (data.name) {
                this.nickname.string = data.name.length > 8 ? `${data.name.substring(0, 7)}...` : data.name;
            }
        } else {
            this.data = null;
            this.node.runAction(cc.fadeTo(1, 0));
        }
    }

    setBalance(balance: number) {
        this.data.red = balance ? balance : 0;
        this.displayBalance(this.data.red);
    }

    increaseBalance(money: number) {
        if (money) {
            this.data.red += money;
            this.displayBalance(this.data.red);
        }
    }

    displayBalance(balance: number) {
        this.balance.string =
            balance > this.MAX_BALANCE_DISPLAY ? `${numberWithCommas(this.MAX_BALANCE_DISPLAY)}+` : numberWithCommas(balance);
    }

    setAvatar(avatarId) {
        cc.loader.loadRes("profile-picture", cc.SpriteAtlas, (err, atlas) => {
            const frame = atlas.getSpriteFrame(avatarId ? avatarId : 1);

            if (this.avatar) {
                this.avatar.spriteFrame = frame;
            }
        });
    }

    static storePlayerToCache(playerData: PlayerData, gameName: string) {
        if (playerData.type) {
            return;
        }

        let players = JSON.parse(cc.sys.localStorage.getItem(this.playersCacheKey(gameName)));

        if (!players) {
            players = {};
        }

        players[playerData.id] = playerData;
        cc.sys.localStorage.setItem(this.playersCacheKey(gameName), JSON.stringify(players));
    }

    static getPlayerFromCache(playerId: string, gameName: string) {
        const players = JSON.parse(cc.sys.localStorage.getItem(this.playersCacheKey(gameName)));

        return players ? players[playerId] : null;
    }

    private static playersCacheKey(gameName: string) {
        return `PLAYERS_${gameName}`;
    }
}
