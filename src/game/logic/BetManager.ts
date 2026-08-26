export class BetManager {
    private readonly betValues: readonly number[];

    private currentIndex: number;

    constructor(
        betValues: readonly number[],
        defaultBet: number
    ) {
        if (betValues.length === 0) {
            throw new Error(
                'BetManager requires at least one bet value.'
            );
        }

        this.betValues = betValues;

        const defaultIndex =
            this.betValues.indexOf(defaultBet);

        this.currentIndex =
            defaultIndex >= 0
                ? defaultIndex
                : 0;
    }

    /**
     * Retorna a aposta atualmente selecionada.
     */
    public getCurrentBet(): number {
        return this.betValues[
            this.currentIndex
        ];
    }

    /**
     * Vai para a próxima aposta.
     */
    public increase(): number {
        if (!this.canIncrease()) {
            return this.getCurrentBet();
        }

        this.currentIndex++;

        return this.getCurrentBet();
    }

    /**
     * Vai para a aposta anterior.
     */
    public decrease(): number {
        if (!this.canDecrease()) {
            return this.getCurrentBet();
        }

        this.currentIndex--;

        return this.getCurrentBet();
    }

    /**
     * Verifica se existe uma aposta maior.
     */
    public canIncrease(): boolean {
        return (
            this.currentIndex <
            this.betValues.length - 1
        );
    }

    /**
     * Verifica se existe uma aposta menor.
     */
    public canDecrease(): boolean {
        return this.currentIndex > 0;
    }
}