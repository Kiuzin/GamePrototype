import { FeatureConfig } from '../config/FeatureConfig';

export type HorseRaceRunner = typeof FeatureConfig.horseRace.runners[number];

export interface HorseRaceResultRunner extends HorseRaceRunner {
    speeds: number[];
    totalSpeed: number;
    rank: number;
}

export interface HorseRaceResult {
    runners: HorseRaceResultRunner[];
    selectedRunnerId: string;
    selectedRank: number;
}

/** Regras puras da Corrida de Tratores. */
export class HorseRaceFeature {
    private readonly settings = FeatureConfig.horseRace;

    private isRunning = false;

    private readonly random: () => number;

    constructor(random: () => number = Math.random) {
        this.random = random;
    }

    public tryStart(): boolean {
        if (
            !this.settings.enabled ||
            this.isRunning ||
            this.random() >= this.normalizeChance(
                this.settings.activationChance
            )
        ) {
            return false;
        }

        this.isRunning = true;
        return true;
    }

    public getRunners(): readonly HorseRaceRunner[] {
        return this.settings.runners;
    }

    public run(selectedRunnerId: string): HorseRaceResult {
        if (!this.isRunning) {
            throw new Error('A Corrida de Tratores não está ativa.');
        }

        if (!this.settings.runners.some(runner => runner.id === selectedRunnerId)) {
            throw new Error('O trator selecionado não pertence à corrida.');
        }

        const runners = this.settings.runners.map(runner => {
            const speeds = Array.from({ length: this.settings.segmentCount }, () =>
                this.settings.minimumSpeed + this.random() *
                (this.settings.maximumSpeed - this.settings.minimumSpeed)
            );

            return { ...runner, speeds, totalSpeed: speeds.reduce((sum, speed) => sum + speed, 0), rank: 0 };
        }).sort((first, second) => second.totalSpeed - first.totalSpeed)
            .map((runner, index) => ({ ...runner, rank: index + 1 }));

        return {
            runners,
            selectedRunnerId,
            selectedRank: runners.find(runner => runner.id === selectedRunnerId)!.rank,
        };
    }

    public getPayout(bet: number, rank: number): number {
        const multiplier = this.settings.payouts[rank as 1 | 2 | 3] ?? 0;
        return bet * multiplier;
    }

    public finish(): void {
        this.isRunning = false;
    }

    private normalizeChance(value: number): number {
        return Math.min(1, Math.max(0, value > 1 ? value / 100 : value));
    }
}
