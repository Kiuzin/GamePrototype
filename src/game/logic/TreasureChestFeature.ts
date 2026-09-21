import { FeatureConfig } from '../config/FeatureConfig';

export type TreasureChestContent =
    | { type: 'reward'; multiplier: number }
    | { type: 'ending' };

export interface TreasureChestState {
    id: string;
    content: TreasureChestContent;
    isRevealed: boolean;
    isCollected: boolean;
}

export interface TreasureChestRound {
    chests: readonly TreasureChestState[];
    accumulatedMultiplier: number;
    isFinished: boolean;
}

/** Regras isoladas do bônus de baús, sem dependência de interface Phaser. */
export class TreasureChestFeature {
    private readonly settings = FeatureConfig.treasureChest;

    private readonly random: () => number;

    private currentRound?: TreasureChestRound;

    public constructor(random: () => number = Math.random) {
        this.random = random;
    }

    public tryStart(): boolean {
        return this.settings.enabled &&
            !this.currentRound &&
            this.random() < this.normalizeChance(this.settings.activationChance);
    }

    public start(): TreasureChestRound {
        this.validateSettings();

        const contents = this.shuffle([
            ...this.settings.rewardMultipliers.map(multiplier => ({ type: 'reward' as const, multiplier })),
            ...Array.from({ length: this.settings.endingChestCount }, () => ({ type: 'ending' as const })),
        ]);

        this.currentRound = {
            chests: contents.map((content, index) => ({
                id: `chest-${index + 1}`,
                content,
                isRevealed: false,
                isCollected: false,
            })),
            accumulatedMultiplier: 0,
            isFinished: false,
        };

        return this.getRound();
    }

    public select(chestId: string): TreasureChestRound {
        const round = this.requireRound();
        const chest = round.chests.find(item => item.id === chestId);

        if (!chest || chest.isRevealed || round.isFinished) {
            throw new Error('O baú selecionado não está disponível.');
        }

        chest.isRevealed = true;

        if (chest.content.type === 'ending') {
            round.isFinished = true;
            round.chests.forEach(item => {
                item.isRevealed = true;
            });
        } else {
            chest.isCollected = true;
            round.accumulatedMultiplier += chest.content.multiplier;
        }

        return this.getRound();
    }

    public getExtraPayout(basePayout: number): number {
        return Math.max(0, basePayout) * this.requireRound().accumulatedMultiplier;
    }

    public finish(): void {
        this.currentRound = undefined;
    }

    private getRound(): TreasureChestRound {
        const round = this.requireRound();
        return {
            ...round,
            chests: round.chests.map(chest => ({ ...chest, content: { ...chest.content } })),
        };
    }

    private requireRound(): TreasureChestRound {
        if (!this.currentRound) {
            throw new Error('O bônus dos baús não está ativo.');
        }

        return this.currentRound;
    }

    private validateSettings(): void {
        const expectedChestCount = this.settings.rewardMultipliers.length + this.settings.endingChestCount;
        if (this.settings.chestCount !== expectedChestCount || this.settings.endingChestCount < 1) {
            throw new Error('A configuração dos baús deve conter ao menos um encerramento e corresponder ao número total de baús.');
        }
    }

    private shuffle<T>(items: readonly T[]): T[] {
        const shuffled = [...items];
        for (let index = shuffled.length - 1; index > 0; index--) {
            const targetIndex = Math.floor(this.random() * (index + 1));
            [shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[index]];
        }
        return shuffled;
    }

    private normalizeChance(value: number): number {
        const chance = value > 1 ? value / 100 : value;
        return Math.min(1, Math.max(0, chance));
    }
}
