import { FeatureConfig } from '../config/FeatureConfig';
import { validateProbability } from './RandomUtils';
import type { BonusFeatureLifecycle } from './BonusFeatureLifecycle';
import { Money } from './Money';
import type { MoneyCredits } from './Money';
export type WheelSlice =
    | { readonly id: string; readonly label: string; readonly type: 'payout' | 'multiply'; readonly multiplier: number; readonly weight: number }
    | { readonly id: string; readonly label: string; readonly type: 'pass' | 'loseAll'; readonly weight: number }
    | { readonly id: string; readonly label: string; readonly type: 'extraSpins'; readonly spins: number; readonly weight: number };

export interface WheelBonusSettings {
    readonly enabled: boolean;
    readonly activationChance: number;
    readonly initialSpins: number;
    readonly spinDuration: number;
    readonly finalDisplayDuration: number;
    readonly slices: readonly WheelSlice[];
}

export interface WheelBonusFeatureOptions {
    settings?: WheelBonusSettings;
    random?: () => number;
}

export interface WheelBonusRound {
    basePayout: MoneyCredits;
    accumulatedPayout: MoneyCredits;
    remainingSpins: number;
    status: 'ready' | 'completed';
    lastSlice?: WheelSlice;
}

/** Regras puras da roleta bônus, incluindo acúmulo e rodadas extras. */
export class WheelBonusFeature implements BonusFeatureLifecycle {
    private readonly settings: WheelBonusSettings;

    private readonly random: () => number;

    private currentRound?: WheelBonusRound;

    public constructor(options: WheelBonusFeatureOptions = {}) {
        this.settings = options.settings ?? FeatureConfig.wheelBonus;
        this.random = options.random ?? Math.random;
    }

    public tryStart(): boolean {
        return this.settings.enabled &&
            !this.currentRound &&
            this.random() < validateProbability(this.settings.activationChance);
    }

    public start(basePayout: MoneyCredits): WheelBonusRound {
        if (!Number.isSafeInteger(basePayout) || basePayout <= 0) {
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
            case 'payout': round.accumulatedPayout += Money.multiply(round.basePayout, slice.multiplier); break;
            case 'multiply': round.accumulatedPayout = Money.multiply(round.accumulatedPayout, slice.multiplier); break;
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

}
