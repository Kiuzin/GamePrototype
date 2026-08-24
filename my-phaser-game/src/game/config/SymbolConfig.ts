export interface SlotSymbol {
    id: string;
    color: number;
    count: number;
}

export const SymbolConfig = {
    SYMBOLS: [
        {
            id: 'Blue',
            color: 0x0000ff,
            count: 25,
        },
        {
            id: 'Red',
            color: 0xff0000,
            count: 15,
        },
        {
            id: 'Green',
            color: 0x00ff00,
            count: 8,
        },
        {
            id: 'Yellow',
            color: 0xffff00,
            count: 7,
        },
        {
            id: 'Purple',
            color: 0x800080,
            count: 5,
        },
    ] as SlotSymbol[],

    getById(id: string): SlotSymbol | undefined {
        return this.SYMBOLS.find(symbol => symbol.id === id);
    },

    getTotalCount(): number {
        return this.SYMBOLS.reduce(
            (total, symbol) => total + symbol.count,
            0
        );
    },

    getWeightedRandom(): SlotSymbol {
        const total = this.getTotalCount();

        let random = Math.random() * total;

        for (const symbol of this.SYMBOLS) {
            random -= symbol.count;

            if (random < 0) {
                return symbol;
            }
        }

        // Fallback de segurança
        return this.SYMBOLS[this.SYMBOLS.length - 1];
    },
};