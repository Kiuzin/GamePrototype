export interface WinLine {
    id: number;
    positions: Array<{
        reel: number;
        row: number;
    }>;
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
    static checkWinningLines(result: string[][]): number[] {
        const winningLines: number[] = [];

        for (const line of WIN_LINES) {
            const symbols = line.positions.map(position => {
                return result[position.reel][position.row];
            });

            if (this.isWinningLine(symbols)) {
                winningLines.push(line.id);
            }
        }

        return winningLines;
    }

    private static isWinningLine(symbols: string[]): boolean {
        if (symbols.length !== 3) {
            return false;
        }

        return (
            symbols[0] === symbols[1] &&
            symbols[1] === symbols[2]
        );
    }
}