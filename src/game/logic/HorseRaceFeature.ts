import { FeatureConfig } from '../config/FeatureConfig';

export type HorseRaceRunner =
    typeof FeatureConfig.horseRace.runners[number];

export interface HorseRaceResultRunner extends HorseRaceRunner {
    speeds: number[];
    totalSpeed: number;
    rank: number;
}

export interface HorseRaceResult {
    runners: HorseRaceResultRunner[];
    selectedRunnerId: string;
    selectedRank: number;
    winningTotal: number;
    segmentCount: number;
}

/** Simulação pura e testável da Corrida de Tratores. */
export class HorseRaceFeature {
    private readonly settings = FeatureConfig.horseRace;

    private readonly random: () => number;

    private isRunning = false;

    constructor(random: () => number = Math.random) {
        this.random = random;
    }

    public tryStart(): boolean {
        if (!this.settings.enabled || this.isRunning || this.random() >= this.normalizeChance(this.settings.activationChance)) {
            return false;
        }

        this.isRunning = true;
        return true;
    }

    public getRunners(): readonly HorseRaceRunner[] {
        return this.settings.runners;
    }

    public run(selectedRunnerId: string): HorseRaceResult {
        this.validateSelectedRunner(selectedRunnerId);

        // A ordem original representa as pistas e nunca deve ser alterada
        // pelo resultado. A classificação é calculada em uma cópia.
        const laneRunners = this.settings.runners.map(
            runner => this.createRunnerResult(runner)
        );

        const rankedRunners = [...laneRunners]
            .sort((first, second) => second.totalSpeed - first.totalSpeed)
            .map((runner, index) => ({ ...runner, rank: index + 1 }));

        const rankByRunnerId = new Map(
            rankedRunners.map(runner => [
                runner.id,
                runner.rank,
            ])
        );

        const runners = laneRunners.map(runner => ({
            ...runner,
            rank: rankByRunnerId.get(runner.id) ?? 0,
        }));

        const selectedRunner = runners.find(
            runner => runner.id === selectedRunnerId
        );

        if (!selectedRunner) {
            throw new Error('Não foi possível classificar o trator selecionado.');
        }

        return {
            runners,
            selectedRunnerId,
            selectedRank: selectedRunner.rank,
            winningTotal: rankedRunners[0].totalSpeed,
            segmentCount: this.settings.segmentCount,
        };
    }

    /** Aplica o multiplicador da colocação sobre o ganho da rodada base. */
    public getPayout(basePayout: number, rank: number): number {
        const multiplier = this.settings.payouts[rank as 1 | 2 | 3] ?? 0;
        return basePayout * multiplier;
    }

    public finish(): void {
        this.isRunning = false;
    }

    private createRunnerResult(runner: HorseRaceRunner): HorseRaceResultRunner {
        const speeds = Array.from({ length: this.settings.segmentCount }, () =>
            this.settings.minimumSpeed + this.random() *
            (this.settings.maximumSpeed - this.settings.minimumSpeed)
        );

        return {
            ...runner,
            speeds,
            totalSpeed: speeds.reduce((total, speed) => total + speed, 0),
            rank: 0,
        };
    }

    private validateSelectedRunner(selectedRunnerId: string): void {
        if (!this.isRunning) {
            throw new Error('A Corrida de Tratores não está ativa.');
        }

        if (!this.settings.runners.some(runner => runner.id === selectedRunnerId)) {
            throw new Error('O trator selecionado não pertence à corrida.');
        }
    }

    private normalizeChance(value: number): number {
        const chance = value > 1 ? value / 100 : value;
        return Math.min(1, Math.max(0, chance));
    }
}
