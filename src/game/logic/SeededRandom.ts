/** Gerador determinístico para auditoria e reprodução do resultado-base. */
export const createSeededRandom = (seed: number): (() => number) => {
    let state = seed >>> 0;

    return (): number => {
        state += 0x6d2b79f5;
        let value = state;
        value = Math.imul(value ^ value >>> 15, value | 1);
        value ^= value + Math.imul(value ^ value >>> 7, value | 61);
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
};

export const createRoundSeed = (): number => {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0];
};
