/** Normaliza probabilidades aceitando frações (0.25) ou percentuais (25). */
export const normalizeProbability = (value: number): number => {
    if (!Number.isFinite(value)) {
        return 0;
    }

    const probability = value > 1
        ? value / 100
        : value;

    return Math.min(1, Math.max(0, probability));
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
