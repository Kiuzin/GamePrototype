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
        // Pesos relativos para o símbolo da sorte. Não precisam somar 100:
        // quanto maior o peso, mais frequente será o símbolo no bônus.
        // O Wild não participa deste sorteio.
        symbolSelectionWeights: {
            Crow: 40,
            Popcorn: 25,
            Cake: 15,
            Pamonha: 10,
            Canjica: 6,
            Corn: 2,
        },
        // O prêmio formado no re-spin é multiplicado por este valor. O Corvo
        // começa em x10; símbolos mais valiosos e mais linhas da rodada-base
        // aumentam o multiplicador final.
        payoutMultiplier: {
            base: 10,
            symbolFactors: {
                Crow: 1,
                Popcorn: 1.2,
                Cake: 1.5,
                Pamonha: 2,
                Canjica: 3,
                Corn: 5,
            },
            baseWinningLineFactors: [1, 1, 1.25, 1.5, 1.75, 2],
        },
    },
    horseRace: {
        enabled: true,
        activationChance: 100.04,
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
        enabled: false,
        activationChance: 0.1,
        chestCount: 8,
        endingChestCount: 2,
        rewardMultipliers: [0.5, 1, 1.5, 1.75, 2, 2.25],
        revealDelay: 700,
        payoutCountDuration: 1800,
    },
    cardDouble: {
        enabled: false,
        activationChance: 0.12,
        thresholdRank: 7,
        // Um baralho de 26 cartas: cada valor existe uma vez em cada cor.
        // O Ás vale 1, deixando seis valores abaixo e seis acima do 7.
        suits: [
            { id: 'spades', symbol: '♠', color: 'black' },
            { id: 'hearts', symbol: '♥', color: 'red' },
        ],
        finalDisplayDuration: 1500,
    },
} as const;
