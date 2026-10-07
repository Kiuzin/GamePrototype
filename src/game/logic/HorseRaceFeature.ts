import { FeatureConfig } from '../config/FeatureConfig';
import { validateProbability } from './RandomUtils';
import type { BonusFeatureLifecycle } from './BonusFeatureLifecycle';
import { Money } from './Money';
import type { FeatureSettings } from './FeatureSettings';

export type HorseRaceSettings = FeatureSettings<typeof FeatureConfig.horseRace>;
export type HorseRaceRunner = HorseRaceSettings['runners'][number];

export interface HorseRaceFeatureOptions {
    settings?: HorseRaceSettings;
    random?: () => number;
}

export type HorseRaceResultRunner = HorseRaceRunner & {
    speeds: number[];
    totalSpeed: number;
    rank: number;
};

export interface HorseRaceResult {
    runners: HorseRaceResultRunner[];
    selectedRunnerId: string;
    selectedRank: number;
    winningTotal: number;
    segmentCount: number;
}

type HorseRaceStatus = 'inactive' | 'selecting' | 'finished';

/** Simulação pura e testável da Corrida de Tratores. */
export class HorseRaceFeature implements BonusFeatureLifecycle {
    private readonly settings: HorseRaceSettings;

    private readonly random: () => number;

    private status: HorseRaceStatus = 'inactive';

    constructor(options: HorseRaceFeatureOptions = {}) {
        this.settings = options.settings ?? FeatureConfig.horseRace;
        this.random = options.random ?? Math.random;
    }

    public tryStart(): boolean {
        if (
            !this.settings.enabled ||
            this.status !== 'inactive' ||
            this.random() >= validateProbability(this.settings.activationChance)
        ) {
            return false;
        }

        return true;
    }

    /** Inicia a ativação após a cena confirmar que a feature foi sorteada. */
    public start(): void {
        if (this.status !== 'inactive') {
            throw new Error('A Corrida de Tratores já está ativa.');
        }

        this.status = 'selecting';
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

        const result = {
            runners,
            selectedRunnerId,
            selectedRank: selectedRunner.rank,
            winningTotal: rankedRunners[0].totalSpeed,
            segmentCount: this.settings.segmentCount,
        };

        // A corrida é definida uma única vez por ativação. O resultado
        // permanece disponível para a apresentação até finish() encerrar o bônus.
        this.status = 'finished';

        return result;
    }

    /** Aplica o multiplicador da colocação sobre o ganho da rodada base. */
    public getPayout(basePayout: number, rank: number): number {
        const multiplier = this.settings.payouts[rank as 1 | 2 | 3] ?? 0;
        return Money.multiply(basePayout, multiplier);
    }

    public finish(): void {
        this.status = 'inactive';
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
        if (this.status === 'inactive') {
            throw new Error('A Corrida de Tratores não está ativa.');
        }

        if (this.status === 'finished') {
            throw new Error('A Corrida de Tratores já foi realizada nesta ativação.');
        }

        if (!this.settings.runners.some(runner => runner.id === selectedRunnerId)) {
            throw new Error('O trator selecionado não pertence à corrida.');
        }
    }

}
