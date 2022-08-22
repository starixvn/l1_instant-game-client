import AudioManager from "../../../../common/audio/AudioManager";
import { CardAnimation } from "./../../../../common/control/new-card/view-models/NewCard";
import BaccaratCard from "./BaccaratCard";

const { ccclass, property } = cc._decorator;

export enum OrderCardIndex {
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

    @property(cc.Node)
    card2Stack: cc.Node = null;

    @property(cc.Label)
    point: cc.Label = null;

    @property
    isBanker = false;

    @property(cc.Node)
    cardsBox: cc.Node = null;

    @property(cc.AudioSource)
    cardAudioSource: cc.AudioSource = null;

    protected playGetCardAudio = () => {
        // handle
    };
    protected readonly flyCardSecond = 0.8;
    protected readonly openCardSecond = 0.3;
    protected readonly openSecondCardSecond = 1.6;
    protected readonly setPointSecond = 0.2;
    protected isMainPage = false;

    private readonly SHOW_CARD = 1;
    private readonly SHOW_FINISH_CARD = 2;
    protected SET_POINT = 3;

    readonly durationFlyCard = 0.6;
    private readonly durationAnimFaceUp = 0.5;
    private readonly durationAwaitAnimFaceUp = 0.8;
    private readonly durationStackCard = 0.3;

    onLoad() {
        this.cards.forEach((card: cc.Node) => {
            card?.getComponent(BaccaratCard).faceDown();
        });
    }

    init(playAudio, isMainPage = true) {
        if (playAudio) {
            this.playGetCardAudio = playAudio;
        }
    }

    resetCards() {
        this.resetPoint();
        this.cards.forEach((card: cc.Node) => {
            this.resetCard(card);
        });
    }

    private resetPoint() {
        if (this.point) {
            this.point.node.parent.active = false;
            this.point.string = "0";
        }
    }

    showHighlightCards(highlight = true) {
        for (let i = 1; i <= 3; i++) {
            // const card = this[`card${i}`];
            // const baccaratCard = card.getComponent(BaccaratCard);
            // highlight ? baccaratCard.setHighlight() : baccaratCard.resetHighlight();
        }
    }

    showCardsWithoutAnimation(cards: any[]) {
        //showCardsWithoutAnimation
    }

    async showCards(cardData: CardData, onFinishShowCards: () => void, playerHasCard3 = false) {
        //showCards
    }

    async flyCards(card: cc.Node, delay: number, start?: cc.Node) {
        await this.flyCard({ card, delay, start });
    }

    async flyCardReserves(card: cc.Node, delay: number, start?: cc.Node, numberTag?: number) {
        await this.flyCard({ card, delay, start, isReserve: true, numberTag });
    }

    private flyCard({
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
                    this.setInfoCardFly(cardComponent, numberTag);
                    card &&
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
            // cardTween && this.cardsFlyTween.push(cardTween);
        });
    }

    stackCard(card = this.cards[OrderCardIndex.card2], delay = this.durationStackCard): Promise<void> {
        return new Promise((resolve) => {
            cc.tween(card)
                .call(() => {
                    card.runAction(cc.moveTo(0.2, cc.v2(-50, 0)).easing(cc.easeInOut(2)));
                })
                .delay(delay)
                .call(() => resolve())
                .start();
        });
    }

    setInfoCardFly(cardComponent: BaccaratCard, numberTag: number, isCardThree = false) {
        numberTag > 0 && !isCardThree && cardComponent?.setNumberTag(numberTag.toString());
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
            card.runAction(
                cc.spawn(
                    cc.scaleTo(this.durationFlyCard, 1).easing(cc.easeInOut(2)),
                    cc.moveTo(this.durationFlyCard, cc.v2(cardPosition.x, cardPosition.y)).easing(cc.easeInOut(2))
                )
            );
        } else {
            card.runAction(
                cc.spawn(
                    cc.scaleTo(this.durationFlyCard, 1).easing(cc.easeInOut(2)),
                    cc.moveTo(this.durationFlyCard, cc.v2(cardPosition.x, cardPosition.y)).easing(cc.easeInOut(2))
                )
            );
        }
    }

    resetCard(card: cc.Node) {
        const cardNode = card?.getComponent(BaccaratCard);
        if (cardNode) {
            cardNode.faceDown();
            // cardNode.resetHighlight();
            card.opacity = 0;
            card.x = 0;
            // card.scale = 0.5;
            // card.angle = -135;
            cardNode.animation.clear();
        }
    }

    async openCard(card: cc.Node, cardData: CardData, index: number) {
        await this.faceUpCard(cardData, card);
    }

    faceUpCard(cardInfo: CardData, card: cc.Node): Promise<void> {
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

    setActionCardThree(currentCard: cc.Node, delayTime: number) {
        currentCard.runAction(cc.sequence(cc.delayTime(delayTime), cc.rotateBy(0.5, this.isBanker ? 270 : -270).easing(cc.easeSineOut())));
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
