export type RoundState = 'idle' | 'spinning' | 'bonus' | 'settled';

/** Controla as transições válidas da rodada e bloqueia ações fora de ordem. */
export class RoundStateMachine {
    private state: RoundState = 'idle';

    public canStart(): boolean {
        return this.state === 'idle' || this.state === 'settled';
    }

    public start(): void {
        if (!this.canStart()) {
            throw new Error(`Não é possível iniciar uma rodada em ${this.state}.`);
        }

        this.state = 'spinning';
    }

    public enterBonus(): void {
        if (this.state !== 'spinning') {
            throw new Error(`Não é possível iniciar um bônus em ${this.state}.`);
        }

        this.state = 'bonus';
    }

    public settle(): void {
        if (this.state !== 'spinning' && this.state !== 'bonus') {
            throw new Error(`Não é possível concluir uma rodada em ${this.state}.`);
        }

        this.state = 'settled';
    }

    public isBonusActive(): boolean {
        return this.state === 'bonus';
    }
}
