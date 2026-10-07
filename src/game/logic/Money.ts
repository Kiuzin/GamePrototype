/** Valores monetários são armazenados como créditos inteiros de R$ 0,01. */
export type MoneyCredits = number;

const CREDITS_PER_UNIT = 100;

/** Política única de conversão, arredondamento e exibição de valores monetários. */
export class Money {
    public static fromAmount(amount: number): MoneyCredits {
        if (!Number.isFinite(amount)) {
            throw new Error('O valor monetário deve ser finito.');
        }

        const credits = Math.round(
            (amount + Number.EPSILON) * CREDITS_PER_UNIT
        );
        this.assertCredits(credits);

        return credits;
    }

    public static multiply(
        credits: MoneyCredits,
        multiplier: number
    ): MoneyCredits {
        this.assertCredits(credits);

        if (!Number.isFinite(multiplier)) {
            throw new Error('O multiplicador monetário deve ser finito.');
        }

        const roundedCredits = Math.round(credits * multiplier);
        this.assertCredits(roundedCredits);

        return roundedCredits;
    }

    public static toAmount(credits: MoneyCredits): number {
        this.assertCredits(credits);
        return credits / CREDITS_PER_UNIT;
    }

    public static format(credits: MoneyCredits): string {
        return this.toAmount(credits).toFixed(2);
    }

    public static assertCredits(credits: number): asserts credits is MoneyCredits {
        if (!Number.isSafeInteger(credits)) {
            throw new Error('O valor monetário deve ser um crédito inteiro seguro.');
        }
    }
}
