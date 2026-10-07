import { SymbolConfig } from '../config/SymbolConfig';
import { GameError } from './GameError';

export interface LinePosition {
    readonly reel: number;
    readonly row: number;
}

export interface WinLine {
    readonly id: number;

    readonly positions: readonly LinePosition[];
}

/**
 * Resultado detalhado de uma linha vencedora.
 *
 * Exemplo:
 *
 * Blue - Wild - Blue
 *
 * result:
 *
 * {
 *     lineId: 1,
 *     symbolId: 'Blue',
 *     wildCount: 1,
 *     symbols: ['Blue', 'Wild', 'Blue']
 * }
 */
export interface WinningLineResult {
    lineId: number;

    /**
     * Símbolo que efetivamente ganhou.
     *
     * Blue + Wild + Blue
     * retorna "Blue".
     *
     * Wild + Wild + Wild
     * retorna "Wild".
     */
    symbolId: string;

    /**
     * Quantidade de Wilds usados
     * na combinação.
     */
    wildCount: number;

    /**
     * Símbolos originais da linha.
     *
     * Útil posteriormente para
     * animações e debug.
     */
    symbols: string[];

    /**
     * Posições do grid pertencentes
     * a essa linha.
     */
    positions: LinePosition[];
}

export const WIN_LINES = [
    {
        id: 1,

        positions: [
            { reel: 0, row: 0 },
            { reel: 1, row: 0 },
            { reel: 2, row: 0 },
        ],
    },

    {
        id: 2,

        positions: [
            { reel: 0, row: 1 },
            { reel: 1, row: 1 },
            { reel: 2, row: 1 },
        ],
    },

    {
        id: 3,

        positions: [
            { reel: 0, row: 2 },
            { reel: 1, row: 2 },
            { reel: 2, row: 2 },
        ],
    },

    {
        id: 4,

        positions: [
            { reel: 0, row: 0 },
            { reel: 1, row: 1 },
            { reel: 2, row: 2 },
        ],
    },

    {
        id: 5,

        positions: [
            { reel: 0, row: 2 },
            { reel: 1, row: 1 },
            { reel: 2, row: 0 },
        ],
    },
] as const satisfies readonly WinLine[];

export class WinChecker {

    /**
     * Analisa todas as paylines.
     *
     * Retorna informações completas
     * das linhas vencedoras.
     */
    static checkWinningLines(
        result: string[][]
    ): WinningLineResult[] {

        this.validateGrid(result);

        const wins: WinningLineResult[] = [];

        for (const line of WIN_LINES) {

            const symbols: string[] = [];

            for (
                const position of
                line.positions
            ) {
                const symbol =
                    result[position.reel]?.[
                        position.row
                    ];

                if (symbol === undefined) {
                    throw new GameError(
                        'INVALID_GRID',
                        `Grade inválida: posição ${position.reel},${position.row} ausente.`
                    );
                }

                symbols.push(symbol);
            }

            const win =
                this.evaluateLine(
                    line,
                    symbols
                );

            if (win) {
                wins.push(win);
            }
        }

        return wins;
    }

    private static validateGrid(result: string[][]): void {
        const expectedReels = Math.max(
            ...WIN_LINES.flatMap(line => line.positions.map(position => position.reel))
        ) + 1;
        const expectedRows = Math.max(
            ...WIN_LINES.flatMap(line => line.positions.map(position => position.row))
        ) + 1;

        if (
            result.length !== expectedReels ||
            result.some(column => column.length !== expectedRows)
        ) {
            throw new GameError(
                'INVALID_GRID',
                `A grade deve possuir ${expectedReels} rolos e ${expectedRows} linhas.`
            );
        }

        if (
            result.some(column => column.some(
                symbolId => !SymbolConfig.getById(symbolId) && !SymbolConfig.isBlank(symbolId)
            ))
        ) {
            throw new GameError(
                'UNKNOWN_SYMBOL',
                'A grade contém um símbolo desconhecido.'
            );
        }
    }

    /**
     * Analisa uma única linha.
     */
    private static evaluateLine(
        line: WinLine,
        symbols: string[]
    ): WinningLineResult | null {

        if (symbols.length !== line.positions.length) {
            return null;
        }

        const wildId =
            SymbolConfig.WILD_ID;

        // =========================================
        // CONTAGEM DE WILDS
        // =========================================

        const wildCount =
            symbols.filter(
                symbol =>
                    symbol === wildId
            ).length;

        // =========================================
        // CASO 1
        //
        // WILD + WILD + WILD
        // =========================================

        if (wildCount === symbols.length) {

            return {
                lineId: line.id,

                symbolId: wildId,

                wildCount,

                symbols: [...symbols],

                positions: [
                    ...line.positions,
                ],
            };
        }

        // =========================================
        // REMOVE OS WILDS
        //
        // Blue Wild Blue
        //
        // vira:
        //
        // Blue Blue
        // =========================================

        const regularSymbols =
            symbols.filter(
                symbol =>
                    symbol !== wildId
            );

        // Posições vazias podem aparecer em funcionalidades especiais,
        // mas nunca representam um símbolo pagador, nem mesmo quando
        // combinadas com Wilds.
        if (
            regularSymbols.some(
                symbol =>
                    SymbolConfig.isBlank(symbol)
            )
        ) {
            return null;
        }

        // Segurança
        if (
            regularSymbols.length === 0
        ) {
            return null;
        }

        // =========================================
        // DESCOBRE QUAL É O SÍMBOLO BASE
        // =========================================

        const baseSymbol =
            regularSymbols[0];

        // =========================================
        // TODOS OS SÍMBOLOS NÃO-WILD
        // PRECISAM SER IGUAIS
        // =========================================

        const allRegularSymbolsMatch =
            regularSymbols.every(
                symbol =>
                    symbol === baseSymbol
            );

        if (
            !allRegularSymbolsMatch
        ) {
            return null;
        }

        // =========================================
        // VITÓRIA
        // =========================================

        return {
            lineId: line.id,

            symbolId: baseSymbol,

            wildCount,

            symbols: [...symbols],

            positions: [
                ...line.positions,
            ],
        };
    }
}
