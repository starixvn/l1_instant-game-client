const { ccclass, property } = cc._decorator;

@ccclass
export default class DraggableItem extends cc.Component {
    private startPosition = cc.v2(0, 0);
    private startTouchLocation = cc.v2(0, 0);

    private isTouchStarted = false;

    public touchCallback = {
        start: (node: cc.Node) => {},
        move: (touchPosition: cc.Vec2) => {},
        end: (isClicked: boolean) => {}
    };

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onTouchStart(e) {
        this.isTouchStarted = true;
        this.touchCallback.start(this.node);
        this.startPosition = this.node.position;
        this.startTouchLocation = e.touch.getLocation();
    }

    onTouchMove(e) {
        if (!this.isTouchStarted) {
            return;
        }
        this.node.position = e.touch.getLocation().sub(this.startTouchLocation).add(this.startPosition);
        this.touchCallback.move(e.touch.getLocation());
    }

    onTouchEnd(e) {
        if (!this.isTouchStarted) {
            return;
        }
        this.isTouchStarted = false;
        this.touchCallback.end(this.isClicked(e));
    }

    isClicked(e): boolean {
        const delta = e.touch.getLocation().sub(this.startTouchLocation);
        return Math.abs(delta.x) + Math.abs(delta.y) < 10;
    }

    onTouchCancel(e) {
        if (!this.isTouchStarted) {
            return;
        }
        this.isTouchStarted = false;
        this.touchCallback.end(false);
    }
}
