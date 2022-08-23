import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import * as MsgpackParser from "socket.io-msgpack-parser";
import { buildUrl, getEnvironment } from "../../common/helper/UrlHelper";
import { sentryLogger } from "../../common/logger";
import { enableMsgpackParserOnNotification } from "../../configs/Configs";

export default class NotificationService {
    public static getInstance(): NotificationService {
        if (!this.instance) {
            this.instance = new NotificationService();
        }

        return this.instance;
    }

    private static instance: NotificationService;
    private socket: Socket;
    private dataObservers = {};
    private reConnectTimeOut;
    private isForceKickedOut = false;

    connect() {
        if (this.socket || this.isForceKickedOut) {
            return;
        }
        const socketOptions: Partial<ManagerOptions & SocketOptions> = {
            forceNew: false,
            transports: ["websocket"],
            upgrade: false,
            path: `/${getEnvironment()}notification/socket.io`,
            auth: {
                ss: window.authData?.ss,
                username: window.authData?.username
            }
        };
        
        if (enableMsgpackParserOnNotification) {
            socketOptions.parser = MsgpackParser;
        }

        this.socket = io(buildUrl(), socketOptions);

        this.socket.on("connect_error", (error) => {
            sentryLogger.logError(error);
            this.socket && this.socket.disconnect();
            this.reconnect();
        });

        this.socket.on("disconnect", (reason, detail: { description }) => {
            sentryLogger.log(`socket disconnect - NotificationService - ${reason}:   ${detail?.description}`);
            this.socket && this.socket.disconnect();
            this.reconnect();
        });

        const messageList = [
            "gameNotification",
            "marquee",
            "jackpotPools",
            "getWinners",
            "jackpotWinner",
            "jackpotWinners",
            "kickedOut",
            "reload",
            "auth",
            "promotions",
            "promotionNotifications"
        ];

        messageList.forEach((message) => {
            this.socket.on(message, (data) => {
                this.onData(data, message);
            });
        });
    }

    reconnect() {
        this.socket = null;

        this.reConnectTimeOut && clearTimeout(this.reConnectTimeOut);
        this.reConnectTimeOut = setTimeout(() => {
            this.connect();
        }, 5000);
    }

    forceKickedOut() {
        this.isForceKickedOut = true;
        this.socket && this.socket.disconnect();
    }

    emitEvent(eventName, data) {
        try {
            this.socket.emit(eventName, data);
        } catch (err) {
            sentryLogger.logError(err);
        }
    }

    onData(data, dataType: string) {
        Object.keys(this.dataObservers).forEach((type) => {
            if (type === dataType) {
                Object.keys(this.dataObservers[type]).forEach((key) => {
                    const observer = this.dataObservers[type][key];
                    observer && observer(data);
                });
            }
        });
    }

    addDataObserver(dataType: string, dataKey: string, observer) {
        if (!this.dataObservers[dataType]) {
            this.dataObservers[dataType] = {};
        }
        this.dataObservers[dataType][dataKey] = observer;
    }

    removeDataObserver(dataType: string, dataKey: string) {
        delete this.dataObservers[dataType][dataKey];
    }
}
