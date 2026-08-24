import { SymbolConfig } from '../config/SymbolConfig';

export class RandomGenerator {
    /**
     * Gera o resultado final do spin.
     *
     * A estrutura retornada é:
     *
     * [
     *   [reel1-row1, reel1-row2, reel1-row3],
     *   [reel2-row1, reel2-row2, reel2-row3],
     *   [reel3-row1, reel3-row2, reel3-row3]
     * ]
     */
    static generateOutcome(
        reels = 3,
        rows = 3
    ): string[][] {
        return Array.from({ length: reels }, () => {
            return Array.from(
                { length: rows },
                () => SymbolConfig.getWeightedRandom().id
            );
        });
    }

    /**
     * Gera o strip físico de um reel.
     *
     * Cada símbolo aparece a quantidade configurada
     * em SymbolConfig.
     *
     * Depois o strip é embaralhado.
     */
    static generateReelStrip(): string[] {
        const strip: string[] = [];

        for (const symbol of SymbolConfig.SYMBOLS) {
            for (let i = 0; i < symbol.count; i++) {
                strip.push(symbol.id);
            }
        }

        return this.shuffle(strip);
    }

    /**
     * Fisher-Yates shuffle.
     */
    static shuffle<T>(array: T[]): T[] {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }
}