import { FeatureConfig } from '../config/FeatureConfig';
import { SymbolConfig } from '../config/SymbolConfig';
import { validateProbability } from './RandomUtils';
import type { BonusFeatureLifecycle } from './BonusFeatureLifecycle';

export interface LuckyCornActivation {
    selectedSymbolId: string;
}

export interface LuckyCornRound {
    grid: string[][];
    lockedGridBeforeSpin: LuckyCornLockedGrid;
    lockedGrid: LuckyCornLockedGrid;
    newSymbolCount: number;
    respinNumber: number;
    shouldRespin: boolean;
}

export type LuckyCornLockedGrid = Array<
    Array<string | null>
>;

interface LuckyCornFeatureSettings {
    enabled: boolean;
    activationChance: number;
    selectedSymbolChance: number;
    wildChance: number;
    maxRespins: number;
    symbolSelectionWeights: Readonly<Record<string, number>>;
    payoutMultiplier: {
        fullGrid: number;
    };
}

export interface LuckyCornFeatureOptions {
    settings?: LuckyCornFeatureSettings;
    random?: () => number;
    reels?: number;
    rows?: number;
}

/**
 * Controla o estado e os resultados do Milho da Sorte.
 *
 * A classe não depende de Phaser e pode ser reutilizada ou testada
 * sem a interface do jogo. Cada instância corresponde a uma única
 * execução da funcionalidade por vez.
 */
export class LuckyCornFeature implements BonusFeatureLifecycle {
    private readonly settings: LuckyCornFeatureSettings;

    private readonly random: () => number;

    private readonly reels: number;

    private readonly rows: number;

    private selectedSymbolId?: string;

    private lockedGrid: LuckyCornLockedGrid = [];

    private respinNumber = 0;

    constructor(
        options: LuckyCornFeatureOptions = {}
    ) {
        this.settings =
            options.settings ??
            FeatureConfig.luckyCorn;

        this.random =
            options.random ??
            Math.random;

        this.reels = options.reels ?? 3;
        this.rows = options.rows ?? 3;
    }

    /**
     * Verifica se a funcionalidade pode ser ativada sem alterar seu estado.
     */
    public tryStart(): boolean {
        return this.settings.enabled &&
            !this.isActive() &&
            this.random() < validateProbability(this.settings.activationChance);
    }

    /** Inicia uma ativação elegível e prepara sua grade travada. */
    public start(): LuckyCornActivation {
        if (this.isActive()) {
            throw new Error('O Milho da Sorte já está ativo.');
        }

        const selectedSymbolId =
            this.selectEligibleSymbol();

        this.selectedSymbolId =
            selectedSymbolId;

        this.lockedGrid =
            this.createEmptyLockedGrid();

        this.respinNumber = 0;

        return {
            selectedSymbolId,
        };
    }

    public isActive(): boolean {
        return this.selectedSymbolId !== undefined;
    }

    /**
     * Gera uma rodada da funcionalidade e incorpora os novos símbolos
     * elegíveis às posições que ficarão travadas nos próximos re-spins.
     */
    public playRound(): LuckyCornRound {
        if (!this.selectedSymbolId) {
            throw new Error(
                'O Milho da Sorte deve ser iniciado antes de jogar uma rodada.'
            );
        }

        const lockedGridBeforeSpin =
            this.cloneLockedGrid(
                this.lockedGrid
            );

        const grid = this.createRoundGrid(
            lockedGridBeforeSpin
        );

        const newSymbolCount =
            this.lockNewSymbols(
                grid,
                lockedGridBeforeSpin
            );

        this.respinNumber++;

        const reachedRespinLimit =
            this.respinNumber >=
            this.settings.maxRespins;

        const hasUnlockedPositions =
            this.hasUnlockedPositions();

        return {
            grid,
            lockedGridBeforeSpin,
            lockedGrid: this.cloneLockedGrid(
                this.lockedGrid
            ),
            newSymbolCount,
            respinNumber: this.respinNumber,
            shouldRespin:
                newSymbolCount > 0 &&
                hasUnlockedPositions &&
                !reachedRespinLimit,
        };
    }

    /**
     * Retorna o único conjunto de símbolos que pode aparecer durante
     * a animação de uma rodada da funcionalidade.
     */
    public getSpinSymbols(): readonly string[] {
        if (!this.selectedSymbolId) {
            throw new Error(
                'O Milho da Sorte deve estar ativo para fornecer símbolos de giro.'
            );
        }

        return [
            this.selectedSymbolId,
            SymbolConfig.WILD_ID,
            SymbolConfig.BLANK_ID,
        ];
    }

    /**
     * Calcula o multiplicador do prêmio do re-spin. A regra atual concede o
     * multiplicador configurado apenas quando toda a grade estiver travada.
     */
    public calculatePayoutMultiplier(): number {
        if (!this.selectedSymbolId) {
            throw new Error(
                'O Milho da Sorte deve estar ativo para calcular o multiplicador.'
            );
        }

        const isFullGrid = this.lockedGrid.every(column =>
            column.every(symbolId => symbolId !== null)
        );

        return isFullGrid
            ? this.normalizeNonNegative(
                this.settings.payoutMultiplier.fullGrid
            )
            : 1;
    }

    /**
     * Encerra a execução atual, preservando apenas a configuração.
     */
    public finish(): void {
        this.selectedSymbolId = undefined;
        this.lockedGrid = [];
        this.respinNumber = 0;
    }

    private selectEligibleSymbol(): string {
        const eligibleSymbols =
            SymbolConfig.SYMBOLS.filter(
                symbol =>
                    !SymbolConfig.isWild(
                        symbol.id
                    )
            );

        if (eligibleSymbols.length === 0) {
            throw new Error(
                'O Milho da Sorte requer ao menos um símbolo que não seja Wild.'
            );
        }

        const totalWeight = eligibleSymbols.reduce(
            (total, symbol) => total +
                this.getSymbolSelectionWeight(symbol.id),
            0
        );

        if (totalWeight <= 0) {
            return eligibleSymbols[0].id;
        }

        let roll = this.random() * totalWeight;

        for (const symbol of eligibleSymbols) {
            roll -= this.getSymbolSelectionWeight(symbol.id);

            if (roll < 0) {
                return symbol.id;
            }
        }

        return eligibleSymbols[eligibleSymbols.length - 1].id;
    }

    private createRoundGrid(
        lockedGrid: LuckyCornLockedGrid
    ): string[][] {
        return Array.from(
            { length: this.reels },
            (_value, reelIndex) => {
                return Array.from(
                    { length: this.rows },
                    (_rowValue, rowIndex) => {
                        const lockedSymbol =
                            lockedGrid[reelIndex][rowIndex];

                        return lockedSymbol ??
                            this.rollSymbol();
                    }
                );
            }
        );
    }

    private rollSymbol(): string {
        const roll = this.random();

        const selectedSymbolChance =
            validateProbability(
                this.settings
                    .selectedSymbolChance
            );

        const wildChance =
            validateProbability(
                this.settings.wildChance
            );

        if (
            roll <
            selectedSymbolChance
        ) {
            return this.selectedSymbolId!;
        }

        if (
            roll <
            Math.min(
                1,
                selectedSymbolChance +
                    wildChance
            )
        ) {
            return SymbolConfig.WILD_ID;
        }

        return SymbolConfig.BLANK_ID;
    }

    private lockNewSymbols(
        grid: string[][],
        lockedGridBeforeSpin: LuckyCornLockedGrid
    ): number {
        let newSymbolCount = 0;

        grid.forEach(
            (column, reelIndex) => {
                column.forEach(
                    (symbolId, rowIndex) => {
                        if (
                            lockedGridBeforeSpin[
                                reelIndex
                            ][rowIndex] !== null ||
                            !this.isLockableSymbol(
                                symbolId
                            )
                        ) {
                            return;
                        }

                        this.lockedGrid[reelIndex][
                            rowIndex
                        ] = symbolId;

                        newSymbolCount++;
                    }
                );
            }
        );

        return newSymbolCount;
    }

    private isLockableSymbol(
        symbolId: string
    ): boolean {
        return symbolId === this.selectedSymbolId ||
            SymbolConfig.isWild(symbolId);
    }

    private createEmptyLockedGrid(): LuckyCornLockedGrid {
        return Array.from(
            { length: this.reels },
            () => Array.from(
                { length: this.rows },
                () => null
            )
        );
    }

    private cloneLockedGrid(
        grid: LuckyCornLockedGrid
    ): LuckyCornLockedGrid {
        return grid.map(
            column => [...column]
        );
    }

    private hasUnlockedPositions(): boolean {
        return this.lockedGrid.some(
            column => column.some(
                symbolId => symbolId === null
            )
        );
    }

    private getSymbolSelectionWeight(
        symbolId: string
    ): number {
        return this.normalizeNonNegative(
            this.settings.symbolSelectionWeights[symbolId] ?? 0
        );
    }

    private normalizeNonNegative(value: number): number {
        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.max(0, value);
    }
}
