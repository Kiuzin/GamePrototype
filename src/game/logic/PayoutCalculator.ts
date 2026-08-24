import { SymbolConfig } from '../config/SymbolConfig';
import { WIN_LINES } from './WinChecker';

export interface WinResult {
    lineId: number;

    symbolId: string;

    multiplier: number;

    payout: number;
}

export interface SpinPayoutResult {
    wins: WinResult[];

    totalPayout: number;
}

export class PayoutCalculator {
    /**
     * Calcula os pagamentos de todas as linhas vencedoras.
     *
     * Exemplo:
     *
     * Bet = 10
     *
     * Purple x3
     * Multiplier = 50
     *
     * Payout = 10 * 50 = 500
     */
    static calculate(
        result: string[][],
        bet: number
    ): SpinPayoutResult {
        const wins: WinResult[] = [];

        let totalPayout = 0;

        for (const line of WIN_LINES) {
            const symbols =
                line.positions.map(position => {
                    return result[
                        position.reel
                    ][position.row];
                });

            if (
                symbols.length !== 3 ||
                symbols[0] !== symbols[1] ||
                symbols[1] !== symbols[2]
            ) {
                continue;
            }

            const symbolId =
                symbols[0];

            const symbol =
                SymbolConfig.getById(
                    symbolId
                );

            if (!symbol) {
                console.warn(
                    `Unknown symbol: ${symbolId}`
                );

                continue;
            }

            const multiplier =
                symbol.payout[3];

            const payout =
                bet * multiplier;

            wins.push({
                lineId: line.id,

                symbolId,

                multiplier,

                payout,
            });

            totalPayout += payout;
        }

        return {
            wins,

            totalPayout,
        };
    }
}