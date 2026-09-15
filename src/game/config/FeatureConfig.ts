/**
 * Configurações das funcionalidades opcionais do jogo.
 *
 * A alteração de `enabled` é suficiente para habilitar ou
 * desabilitar o Milho da Sorte sem alterar o fluxo da cena.
 * Chances aceitam frações (0.12) ou percentuais (12).
 */
export const FeatureConfig = {
    luckyCorn: {
        enabled: true,
        activationChance: 100.12,
        extraSpinDuration: 3400,
        suspenseStartDelay: 2050,
        startDisplayDuration: 1150,
        respinDelay: 650,
        finalDisplayDuration: 1800,
        finalDisplayPause: 550,
        selectedSymbolChance: 0.24,
        wildChance: 0.08,
        maxRespins: 20,
    },
} as const;
