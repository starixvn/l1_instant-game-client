import BaccaratCard from "./BaccaratCard";
import BaccaratCards, { OrderCardIndex, OrderNameCard } from "./BaccaratCards";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratCardsUI extends cc.Component {
    @property(BaccaratCards)
    playerCards: BaccaratCards = null;

    @property(BaccaratCards)
    bankerCards: BaccaratCards = null;

    @property(BaccaratCards)
    reserveCards: BaccaratCards = null;

    @property(cc.Label)
    winningText: cc.Label = null;

    initCardPlayer(node: cc.Node) {
        this.handleCard(node, this.playerCards, 1);
    }

    initCardBanker(node: cc.Node) {
        this.handleCard(node, this.bankerCards, 2);
    }

    initReserveCards(node: cc.Node) {
        this.handleCard(node, this.reserveCards, 5, true);
    }

    handleCard(node: cc.Node, containerCard: BaccaratCards, index: number, isReserve = false) {
        const component = node.getComponent(BaccaratCard);
        component.faceDown();
        node.opacity = 0;
        if (isReserve) {
            component.index.node.parent.scale = 1.3;
        }

        switch (node.parent.name) {
            case OrderNameCard.card1:
                component.setNumberTag(index.toString());
                containerCard.cards[OrderCardIndex.card1] = node;
                break;
            case OrderNameCard.card2:
                component.setNumberTag((index + (isReserve ? 1 : 2)).toString());
                containerCard.cards[OrderCardIndex.card2] = node;
                break;

            default:
                component.setNumberTag("0");
                containerCard.cards[OrderCardIndex.card3] = node;
                break;
        }
    }

    resetUI() {
        this.playerCards.handleJoinGame();
        this.bankerCards.handleJoinGame();
        this.reserveCards.handleJoinGame();
    }

    resetCards() {
        this.bankerCards.resetCards();
        this.playerCards.resetCards();
        this.reserveCards.resetCards();
    }

    async handleFlyCards() {
        await this.playerCards.flyCard({
            card: this.playerCards.cards[OrderCardIndex.card1],
            delay: this.playerCards.durationFlyCard
        });

        await this.bankerCards.flyCard({
            card: this.bankerCards.cards[OrderCardIndex.card1],
            delay: this.playerCards.durationFlyCard
        });

        await this.playerCards.flyCard({
            card: this.playerCards.cards[OrderCardIndex.card2],
            delay: this.playerCards.durationFlyCard
        });
        await this.bankerCards.flyCard({
            card: this.bankerCards.cards[OrderCardIndex.card2],
            delay: this.bankerCards.durationFlyReserveCard
        });

        await this.playerCards.flyCard({
            card: this.reserveCards.cards[OrderCardIndex.card1],
            delay: this.bankerCards.durationFlyReserveCard
        });
        await this.bankerCards.flyCard({
            card: this.reserveCards.cards[OrderCardIndex.card2],
            delay: this.bankerCards.durationFlyReserveCard
        });
    }
}
