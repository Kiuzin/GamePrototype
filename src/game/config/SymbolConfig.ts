export interface SymbolPayout {
    readonly [symbolCount: number]: number;
}

export type WinAnimation =
    | 'bouncing'
    | 'scaling'
    | 'wiggle';

export interface SlotSymbol {
    readonly id: string;
    readonly color: number;
    readonly weight: number;
    readonly textureKey?: string;
    readonly winAnimation: WinAnimation;

    // Multiplicador pago quando aparecem
    // 3 símbolos iguais em uma linha.
    readonly payout: SymbolPayout;
}

const WILD_ID = 'Wild';

/**
 * Símbolo técnico utilizado por funcionalidades que precisam de uma
 * posição vazia. Ele não faz parte dos símbolos regulares do jogo e,
 * portanto, não pode ser sorteado em uma rodada comum nem gerar prêmio.
 */
const BLANK_ID = 'Blank';

const symbols = [
    {
        id: 'Crow',
        color: 0x0000ff,
        weight: 25,
        textureKey: 'symbolCrow',
        winAnimation: 'wiggle',

        payout: {
            3: 0.6,
        },
    },

    {
        id: 'Popcorn',
        color: 0xff0000,
        weight: 15,
        textureKey: 'symbolPopcorn',
        winAnimation: 'scaling',

        payout: {
            3: 1,
        },
    },

    {
        id: 'Cake',
        color: 0x00ff00,
        weight: 8,
        textureKey: 'symbolCake',
        winAnimation: 'wiggle',

        payout: {
            3: 1.6,
        },
    },

    {
        id: 'Pamonha',
        color: 0xffff00,
        weight: 7,
        textureKey: 'symbolPamonha',
        winAnimation: 'bouncing',

        payout: {
            3: 2,
        },
    },

    {
        id: 'Canjica',
        color: 0x800080,
        weight: 5,
        textureKey: 'symbolCanjica',
        winAnimation: 'scaling',

        payout: {
            3: 5,
        },
    },

    {
        id: 'Corn',
        color: 0x000000,
        weight: 5,
        textureKey: 'symbolCorn',
        winAnimation: 'wiggle',

        payout: {
            3: 25,
        },
    },

    {
        id: WILD_ID,
        color: 0xffa500,
        weight: 3,
        textureKey: 'symbolWild',
        winAnimation: 'scaling',

        payout: {
            3: 50,
        },
    },
] as const satisfies readonly SlotSymbol[];

const getById = (id: string): SlotSymbol | undefined =>
    symbols.find(symbol => symbol.id === id);

const getTotalWeight = (): number =>
    symbols.reduce((total, symbol) => total + symbol.weight, 0);

export const getWeightedRandomSymbol = (
    randomSource: () => number = Math.random
): SlotSymbol => {
    const totalWeight = getTotalWeight();
    let random = randomSource() * totalWeight;

    for (const symbol of symbols) {
        random -= symbol.weight;

        if (random < 0) {
            return symbol;
        }
    }

    return symbols[symbols.length - 1];
};

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

    getById,
    getTotalWeight,
    getWeightedRandom: getWeightedRandomSymbol,
};
