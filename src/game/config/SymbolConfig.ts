export interface SymbolPayout {
    3: number;
}

export type WinAnimation =
    | 'bouncing'
    | 'scaling'
    | 'wiggle';

export interface SlotSymbol {
    id: string;
    color: number;
    count: number;
    textureKey?: string;
    winAnimation: WinAnimation;

    // Multiplicador pago quando aparecem
    // 3 símbolos iguais em uma linha.
    payout: SymbolPayout;
}

const WILD_ID = 'Wild';

/**
 * Símbolo técnico utilizado por funcionalidades que precisam de uma
 * posição vazia. Ele não faz parte dos símbolos regulares do jogo e,
 * portanto, não pode ser sorteado em uma rodada comum nem gerar prêmio.
 */
const BLANK_ID = 'Blank';

const symbols: readonly SlotSymbol[] = [
    {
        id: 'Crow',
        color: 0x0000ff,
        count: 25,
        textureKey: 'symbolCrow',
        winAnimation: 'wiggle',

        payout: {
            3: 0.6,
        },
    },

    {
        id: 'Popcorn',
        color: 0xff0000,
        count: 15,
        textureKey: 'symbolPopcorn',
        winAnimation: 'scaling',

        payout: {
            3: 1,
        },
    },

    {
        id: 'Cake',
        color: 0x00ff00,
        count: 8,
        textureKey: 'symbolCake',
        winAnimation: 'wiggle',

        payout: {
            3: 1.6,
        },
    },

    {
        id: 'Pamonha',
        color: 0xffff00,
        count: 7,
        textureKey: 'symbolPamonha',
        winAnimation: 'bouncing',

        payout: {
            3: 2,
        },
    },

    {
        id: 'Canjica',
        color: 0x800080,
        count: 5,
        textureKey: 'symbolCanjica',
        winAnimation: 'scaling',

        payout: {
            3: 5,
        },
    },

    {
        id: 'Corn',
        color: 0x000000,
        count: 5,
        textureKey: 'symbolCorn',
        winAnimation: 'wiggle',

        payout: {
            3: 25,
        },
    },

    {
        id: WILD_ID,
        color: 0xffa500,
        count: 3,
        textureKey: 'symbolWild',
        winAnimation: 'scaling',

        payout: {
            3: 50,
        },
    },
];

export const SymbolConfig = {
    WILD_ID,

    BLANK_ID,

    SYMBOLS: symbols,

    isWild(id: string): boolean {
        return id === WILD_ID;
    },

    isBlank(id: string): boolean {
        return id === BLANK_ID;
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
