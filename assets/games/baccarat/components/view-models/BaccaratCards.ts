import AudioManager from "../../../../common/audio/AudioManager";
import { CardAnimation } from "./../../../../common/control/new-card/view-models/NewCard";
import BaccaratCard from "./BaccaratCard";

const { ccclass, property } = cc._decorator;

export enum OrderCard {
    card1 = 0,
    card2,
    card3
}

export type CardModel = { rank: string; suit: number };

export type CardData = {
    card: number;
    type: number;
};

export const playFlyCardAudio = (card: cc.Node, source: cc.AudioClip) => {
    if (AudioManager.getInstance().sfxEnabled) {
        card.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.callFunc(() => AudioManager.getInstance().playSFX(source))
            )
        );
    }
};

@ccclass
export default class BaccaratCards extends cc.Component {
    @property(cc.Node)
    cards: cc.Node[] = [];

    @property(cc.Label)
    point: cc.Label = null;

    @property(cc.Node)
    cardsBox: cc.Node = null;

    @property(cc.AudioSource)
    cardAudioSource: cc.AudioSource = null;

    @property
    offset: number = -50;

    protected readonly setPointSecond = 0.2;
    readonly durationFlyCard = 0.4;
    readonly durationFlyReserveCard = 0.2;
    private readonly durationAnimFaceUp = 0.5;
    private readonly durationAwaitAnimFaceUp = 0.8;
    private readonly durationStackCard = 0.3;

    onLoad() {
        this.cards.forEach((card: cc.Node) => {
            card?.getComponent(BaccaratCard).faceDown();
        });
    }

    resetCards(isResetPoint = true) {
        isResetPoint && this.resetPoint();
        this.cards.forEach((card: cc.Node) => {
            this.resetCard(card);
        });
    }

    showCardsJoinGame() {
        this.cards.forEach((card: cc.Node, index: number) => {
            index < 2 && (card.opacity = 255);
        });
    }

    private resetPoint() {
        if (this.point) {
            this.point.node.parent.active = false;
            this.point.string = "0";
        }
    }

    showHighlightCards() {
        this.cards.forEach((card: cc.Node) => {
            card.getComponent(BaccaratCard).setHighlight();
        });
    }

    showCardsWithoutAnimation(cardData: CardData[]) {
        let point = 0;
        const countData = cardData.length;
        cardData.forEach((data, index) => {
            const value = +data.card + 1;
            point += value > 10 || !value ? 0 : value;
            const cardNode = this.cards[index]?.getComponent(BaccaratCard);
            cardNode.setStatusInfoIndex(false);
            cardNode?.setCardOldStyle({
                rank: data.card.toString(),
                suit: data.type
            });

            cardNode?.setFaceUp(true);
            if (index === 1 && countData === 3) {
                cardNode.node.position = cc.v3(this.offset, 0, 0);
            }
            cardNode.node.opacity = 255;
        });
        this.point.node.active = true;
        this.point.node.parent.active = true;
        this.point.string = (point % 10).toString();
    }

    flyCard({
        card,
        delay,
        numberTag = 0,
        start = this.cardsBox,
        isReserve = false
    }: {
        card: cc.Node;
        delay: number;
        numberTag?: number;
        start?: cc.Node;
        isReserve?: boolean;
    }): Promise<void> {
        return new Promise((resolve) => {
            const cardComponent = card?.getComponent(BaccaratCard);
            cc.tween(card)
                .call(() => {
                    this.setInfoCardFly(cardComponent, numberTag, isReserve);
                    this.actionCardFly({
                        card,
                        start,
                        isReserve
                    });
                    playFlyCardAudio(card, this.cardAudioSource?.clip);
                })
                .delay(delay)
                .call(() => resolve())
                .start();
        });
    }

    stackCard(card = this.cards[OrderCard.card2], delay = this.durationStackCard): Promise<void> {
        return new Promise((resolve) => {
            cc.tween(card)
                .to(0.2, { position: cc.v2(this.offset, 0), easing: "easeInOut" })
                .delay(delay)
                .call(() => resolve())
                .start();
        });
    }

    private setInfoCardFly(cardComponent: BaccaratCard, numberTag: number, isReserve = false) {
        isReserve && cardComponent?.setNumberTag(numberTag.toString());
        cardComponent?.setStatusInfoIndex(true);
    }

    private actionCardFly({ card, start, isReserve }: any) {
        const convertCardBox: cc.Vec3 = cc.v3(card.parent.convertToNodeSpaceAR(start.convertToWorldSpaceAR(cc.v2(0, 0))));
        const cardPosition = card.position;
        card.position = convertCardBox;
        card.opacity = 255;
        if (isReserve) {
            start.opacity = 0;
            card.scale = 0.6;
            card.rotation = 0;
        }
        const t = cc.tween;
        t(card)
            .parallel(
                t().to(this.durationFlyCard, { scale: 1, easing: "easeInOut" }),
                t().to(this.durationFlyCard, { position: cc.v2(cardPosition.x, cardPosition.y), easing: "easeInOut" })
            )
            .start();
    }

    resetCard(card: cc.Node) {
        const cardNode = card?.getComponent(BaccaratCard);
        if (cardNode) {
            cardNode.faceDown();
            cardNode.resetHighlight();
            card.opacity = 0;
            card.x = 0;
            cardNode.animation.clear();
        }
    }

    faceUpCard(card: cc.Node, cardInfo: CardData): Promise<void> {
        return new Promise((resolve) => {
            cc.tween(card)
                .call(() => {
                    const cardComponent = card?.getComponent(BaccaratCard);
                    cardComponent?.setCardOldStyle({
                        rank: cardInfo.card.toString(),
                        suit: cardInfo.type
                    });

                    cardComponent?.playAnimation(CardAnimation.DealerOpenCard, this.durationAnimFaceUp);
                    cardComponent?.animation.on("finished", () => {
                        if (cardComponent.animation.currentClip.name === CardAnimation.DealerOpenCard) {
                            this.handleSetPoint(cardInfo);
                        }
                    });
                })
                .delay(this.durationAwaitAnimFaceUp)
                .call(() => resolve())
                .start();
        });
    }

    private handleSetPoint(data: CardData) {
        const pointValue: number = +data.card + 1;
        this.setPoint(pointValue >= 10 ? 0 : pointValue);
    }

    private setPoint(point: number) {
        this.point.node.active = true;
        this.point.node.parent.active = true;

        const currentPoint = parseInt(this.point.string);
        this.point.node.parent.runAction(cc.sequence(cc.scaleTo(this.setPointSecond, 1.1, 1.1), cc.scaleTo(this.setPointSecond, 1, 1)));

        this.point.string = ((currentPoint + point) % 10).toString();
    }
}
