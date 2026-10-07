/** Valida uma probabilidade fracionária no intervalo fechado de 0 a 1. */
export const validateProbability = (value: number): number => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new RangeError(
            'A probabilidade deve ser uma fração entre 0 e 1.'
        );
    }

    return value;
};

/** Retorna uma nova lista embaralhada, sem alterar a lista de origem. */
export const shuffle = <T>(
    items: readonly T[],
    random: () => number = Math.random
): T[] => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index--) {
        const targetIndex = Math.floor(
            random() * (index + 1)
        );

        [shuffled[index], shuffled[targetIndex]] = [
            shuffled[targetIndex],
            shuffled[index],
        ];
    }

    return shuffled;
};
