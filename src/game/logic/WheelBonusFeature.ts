import { FeatureConfig } from '../config/FeatureConfig';

export type WheelSlice = typeof FeatureConfig.wheelBonus.slices[number];

export interface WheelBonusRound {
    basePayout: number;
    accumulatedPayout: number;
    remainingSpins: number;
    status: 'ready' | 'completed';
    lastSlice?: WheelSlice;
}

/** Regras puras da roleta bônus, incluindo acúmulo e rodadas extras. */
export class WheelBonusFeature {
    private readonly settings = FeatureConfig.wheelBonus;

    private readonly random: () => number;

    private currentRound?: WheelBonusRound;

    public constructor(random: () => number = Math.random) {
        this.random = random;
    }

    public tryStart(): boolean {
        return this.settings.enabled && !this.currentRound && this.random() < this.normalizeChance(this.settings.activationChance);
    }

    public start(basePayout: number): WheelBonusRound {
        if (!Number.isFinite(basePayout) || basePayout <= 0) {
            throw new Error('A roleta requer um prêmio-base positivo.');
        }

        this.validateSettings();
        this.currentRound = { basePayout, accumulatedPayout: basePayout, remainingSpins: this.settings.initialSpins, status: 'ready' };
        return this.getRound();
    }

    public spin(): WheelBonusRound {
        const round = this.requireActiveRound();
        const slice = this.pickSlice();
        round.remainingSpins--;
        round.lastSlice = slice;

        switch (slice.type) {
            case 'payout': round.accumulatedPayout += round.basePayout * slice.multiplier; break;
            case 'multiply': round.accumulatedPayout *= slice.multiplier; break;
            case 'extraSpins': round.remainingSpins += slice.spins; break;
            case 'loseAll': round.accumulatedPayout = 0; round.remainingSpins = 0; break;
            case 'pass': break;
        }

        if (round.remainingSpins <= 0) {
            round.status = 'completed';
        }
        return this.getRound();
    }

    public skip(): WheelBonusRound {
        const round = this.requireActiveRound();
        round.status = 'completed';
        round.remainingSpins = 0;
        return this.getRound();
    }

    public getExtraPayout(): number {
        const round = this.requireRound();
        return round.accumulatedPayout - round.basePayout;
    }

    public finish(): void { this.currentRound = undefined; }

    private pickSlice(): WheelSlice {
        const totalWeight = this.settings.slices.reduce((total, slice) => total + slice.weight, 0);
        let target = this.random() * totalWeight;
        for (const slice of this.settings.slices) {
            target -= slice.weight;
            if (target < 0) return slice;
        }
        return this.settings.slices[this.settings.slices.length - 1];
    }

    private getRound(): WheelBonusRound {
        const round = this.requireRound();
        return { ...round, lastSlice: round.lastSlice && { ...round.lastSlice } };
    }

    private requireActiveRound(): WheelBonusRound {
        const round = this.requireRound();
        if (round.status !== 'ready') throw new Error('A roleta já foi encerrada.');
        return round;
    }

    private requireRound(): WheelBonusRound {
        if (!this.currentRound) throw new Error('A roleta não está ativa.');
        return this.currentRound;
    }

    private validateSettings(): void {
        if (this.settings.initialSpins < 1 || this.settings.slices.length < 2 || this.settings.slices.some(slice => slice.weight <= 0)) {
            throw new Error('A roleta precisa de ao menos duas fatias com pesos positivos e um giro inicial.');
        }
    }

    private normalizeChance(value: number): number {
        return Math.min(1, Math.max(0, value > 1 ? value / 100 : value));
    }
}
