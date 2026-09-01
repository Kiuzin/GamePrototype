export interface SymbolPayout {
    3: number;
}

export interface SlotSymbol {
    id: string;
    color: number;
    count: number;
    textureKey?: string;

    // Multiplicador pago quando aparecem
    // 3 símbolos iguais em uma linha.
    payout: SymbolPayout;
}

const WILD_ID = 'Wild';

const symbols: readonly SlotSymbol[] = [
    {
        id: 'Crow',
        color: 0x0000ff,
        count: 25,
        textureKey: 'symbolCrow',

        payout: {
            3: 0.6,
        },
    },

    {
        id: 'Popcorn',
        color: 0xff0000,
        count: 15,
        textureKey: 'symbolPopcorn',

        payout: {
            3: 1,
        },
    },

    {
        id: 'Cake',
        color: 0x00ff00,
        count: 8,
        textureKey: 'symbolCake',

        payout: {
            3: 1.6,
        },
    },

    {
        id: 'Pamonha',
        color: 0xffff00,
        count: 7,
        textureKey: 'symbolPamonha',

        payout: {
            3: 20,
        },
    },

    {
        id: 'Canjica',
        color: 0x800080,
        count: 5,
        textureKey: 'symbolCanjica',

        payout: {
            3: 50,
        },
    },

    {
        id: 'Corn',
        color: 0x000000,
        count: 5,
        textureKey: 'symbolCorn',

        payout: {
            3: 50,
        },
    },

    {
        id: WILD_ID,
        color: 0xffa500,
        count: 3,
        textureKey: 'symbolWild',

        payout: {
            3: 100,
        },
    },
];

export const SymbolConfig = {
    WILD_ID,

    SYMBOLS: symbols,

    isWild(id: string): boolean {
        return id === WILD_ID;
    },

    getById(id: string): SlotSymbol | undefined {
        return symbols.find(
            symbol => symbol.id === id
        );
    },

    getTotalCount(): number {
        return symbols.reduce(
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

        for (const symbol of symbols) {
            random -= symbol.count;

            if (random < 0) {
                return symbol;
            }
        }

        return symbols[
            symbols.length - 1
        ];
    },
};
