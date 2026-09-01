import { SymbolConfig } from '../config/SymbolConfig';

export interface LinePosition {
    reel: number;
    row: number;
}

export interface WinLine {
    id: number;

    positions: LinePosition[];
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

export const WIN_LINES: WinLine[] = [
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
];

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
                    break;
                }

                symbols.push(symbol);
            }

            if (
                symbols.length !==
                line.positions.length
            ) {
                continue;
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

    /**
     * Analisa uma única linha.
     */
    private static evaluateLine(
        line: WinLine,
        symbols: string[]
    ): WinningLineResult | null {

        if (symbols.length !== 3) {
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

        if (wildCount === 3) {

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
