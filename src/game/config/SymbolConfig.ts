export interface SymbolPayout {
    3: number;
}

export interface SlotSymbol {
    id: string;
    color: number;
    count: number;

    // Multiplicador pago quando aparecem
    // 3 símbolos iguais em uma linha.
    payout: SymbolPayout;
}

export const SymbolConfig = {

    WILD_ID: 'Wild',

    SYMBOLS: [
        {
            id: 'Blue',
            color: 0x0000ff,
            count: 25,

            payout: {
                3: 0.6,
            },
        },

        {
            id: 'Red',
            color: 0xff0000,
            count: 15,

            payout: {
                3: 1,
            },
        },

        {
            id: 'Green',
            color: 0x00ff00,
            count: 8,

            payout: {
                3: 1.6,
            },
        },

        {
            id: 'Yellow',
            color: 0xffff00,
            count: 7,

            payout: {
                3: 20,
            },
        },

        {
            id: 'Purple',
            color: 0x800080,
            count: 5,

            payout: {
                3: 50,
            },
        },

        {
            id: 'Wild',
            color: 0xffa500,
            count: 3,

            payout: {
                3: 100,
            },
        }
    ] as SlotSymbol[],

    isWild(id: string): boolean {
        return id === this.WILD_ID;
    },

    getById(id: string): SlotSymbol | undefined {
        return this.SYMBOLS.find(
            symbol => symbol.id === id
        );
    },

    getTotalCount(): number {
        return this.SYMBOLS.reduce(
            (total, symbol) =>
                total + symbol.count,
            0
        );
    },

    getWeightedRandom(): SlotSymbol {
        const total =
            this.getTotalCount();

        let random =
            Math.random() * total;

        for (const symbol of this.SYMBOLS) {
            random -= symbol.count;

            if (random < 0) {
                return symbol;
            }
        }

        return this.SYMBOLS[
            this.SYMBOLS.length - 1
        ];
    },
};