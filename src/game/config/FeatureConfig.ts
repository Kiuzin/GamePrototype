/**
 * Configurações das funcionalidades opcionais do jogo.
 *
 * A alteração de `enabled` é suficiente para habilitar ou
 * desabilitar o Milho da Sorte sem alterar o fluxo da cena.
 * Chances aceitam frações (0.12) ou percentuais (12).
 */
export const FeatureConfig = {
    luckyCorn: {
        enabled: false,
        activationChance: 0.12,
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
    horseRace: {
        enabled: false,
        activationChance: 0.04,
        segmentCount: 12,
        segmentDuration: 650,
        minimumSpeed: 45,
        maximumSpeed: 100,
        payouts: { 1: 12, 2: 4, 3: 1.5 },
        // A ordem abaixo define as pistas da corrida.
        runners: [
            { id: 'greenTractor', name: 'TRATOR VERDE', color: 0x58a65c },
            { id: 'blueTractor', name: 'TRATOR AZUL', color: 0x4b8ed6 },
            { id: 'redTractor', name: 'TRATOR VERMELHO', color: 0xd65a5a },
            { id: 'yellowTractor', name: 'TRATOR AMARELO', color: 0xe0b844 },
        ],
    },
    treasureChest: {
        enabled: true,
        activationChance: 100.1,
        chestCount: 8,
        endingChestCount: 2,
        rewardMultipliers: [0.5, 1, 1.5, 1.75, 2, 2.25],
        revealDelay: 700,
        payoutCountDuration: 1800,
    },
} as const;
