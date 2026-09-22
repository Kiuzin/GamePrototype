import { FeatureConfig } from '../config/FeatureConfig';

export type CardGuess = 'lower' | 'higher';

export type CardDoubleStatus =
    | 'awaitingGuess'
    | 'won'
    | 'tie'
    | 'lost';

export interface CardDoubleCard {
    rank: string;
    value: number;
    suit: string;
    color: 'red' | 'black';
}

export interface CardDoubleRound {
    currentPayout: number;
    remainingCardCount: number;
    status: CardDoubleStatus;
    revealedCard?: CardDoubleCard;
}

/**
 * Regras do bônus Dobra de Cartas. O baralho permanece entre ativações,
 * permitindo que o jogador acompanhe as cartas que já saíram.
 */
export class CardDoubleFeature {
    private readonly settings = FeatureConfig.cardDouble;

    private readonly random: () => number;

    private deck: CardDoubleCard[] = [];

    private currentPayout = 0;

    private status?: CardDoubleStatus;

    private revealedCard?: CardDoubleCard;

    public constructor(random: () => number = Math.random) {
        this.random = random;
    }

    public tryStart(): boolean {
        return this.settings.enabled &&
            !this.isActive() &&
            this.random() < this.normalizeChance(this.settings.activationChance);
    }

    public start(basePayout: number): CardDoubleRound {
        if (!Number.isFinite(basePayout) || basePayout <= 0) {
            throw new Error('A Dobra de Cartas requer um prêmio positivo.');
        }

        this.currentPayout = basePayout;
        this.status = 'awaitingGuess';
        this.revealedCard = undefined;
        this.ensureDeck();

        return this.getRound();
    }

    public guess(guess: CardGuess): CardDoubleRound {
        if (this.status !== 'awaitingGuess') {
            throw new Error('Escolha uma nova carta antes de tentar dobrar.');
        }

        const card = this.drawCard();
        this.revealedCard = card;

        if (card.value === this.settings.thresholdRank) {
            this.status = 'tie';
            return this.getRound();
        }

        const isCorrect = guess === 'higher'
            ? card.value > this.settings.thresholdRank
            : card.value < this.settings.thresholdRank;

        if (!isCorrect) {
            this.currentPayout = 0;
            this.status = 'lost';
            return this.getRound();
        }

        this.currentPayout *= 2;
        this.status = 'won';
        return this.getRound();
    }

    public continue(): CardDoubleRound {
        if (this.status !== 'won' && this.status !== 'tie') {
            throw new Error('A rodada atual não pode continuar.');
        }

        this.status = 'awaitingGuess';
        this.revealedCard = undefined;
        this.ensureDeck();

        return this.getRound();
    }

    public getCurrentPayout(): number {
        return this.currentPayout;
    }

    public finish(): void {
        this.currentPayout = 0;
        this.status = undefined;
        this.revealedCard = undefined;
    }

    private isActive(): boolean {
        return this.status !== undefined;
    }

    private getRound(): CardDoubleRound {
        if (!this.status) {
            throw new Error('A Dobra de Cartas não está ativa.');
        }

        return {
            currentPayout: this.currentPayout,
            remainingCardCount: this.deck.length,
            status: this.status,
            revealedCard: this.revealedCard && { ...this.revealedCard },
        };
    }

    private ensureDeck(): void {
        if (this.deck.length > 0) {
            return;
        }

        const ranks = [
            { rank: 'A', value: 1 },
            { rank: '2', value: 2 },
            { rank: '3', value: 3 },
            { rank: '4', value: 4 },
            { rank: '5', value: 5 },
            { rank: '6', value: 6 },
            { rank: '7', value: 7 },
            { rank: '8', value: 8 },
            { rank: '9', value: 9 },
            { rank: '10', value: 10 },
            { rank: 'J', value: 11 },
            { rank: 'Q', value: 12 },
            { rank: 'K', value: 13 },
        ];

        this.deck = this.shuffle(
            this.settings.suits.flatMap(suit =>
                ranks.map(rank => ({
                    ...rank,
                    suit: suit.symbol,
                    color: suit.color,
                }))
            )
        );
    }

    private drawCard(): CardDoubleCard {
        this.ensureDeck();
        const card = this.deck.pop();

        if (!card) {
            throw new Error('Não foi possível retirar uma carta do baralho.');
        }

        return card;
    }

    private shuffle<T>(items: readonly T[]): T[] {
        const shuffled = [...items];

        for (let index = shuffled.length - 1; index > 0; index--) {
            const targetIndex = Math.floor(this.random() * (index + 1));
            [shuffled[index], shuffled[targetIndex]] = [
                shuffled[targetIndex],
                shuffled[index],
            ];
        }

        return shuffled;
    }

    private normalizeChance(value: number): number {
        const chance = value > 1 ? value / 100 : value;
        return Math.min(1, Math.max(0, chance));
    }
}
