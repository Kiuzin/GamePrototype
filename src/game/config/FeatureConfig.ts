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
        activationChance: 0.01,
        extraSpinDuration: 4300,
        suspenseStartDelay: 2050,
        suspenseDisplayDuration: 1800,
        reelTransitionDuration: 260,
        respinDelay: 650,
        noWinDisplayDuration: 1500,
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
            fullGrid: 10,
        },
    },
    horseRace: {
        enabled: true,
        activationChance: 0.01,
        segmentCount: 12,
        segmentDuration: 650,
        minimumSpeed: 45,
        maximumSpeed: 100,
        payouts: {
            1: 12,
            2: 4,
            3: 1.5,
        },
        // A ordem abaixo define as pistas da corrida.
        runners: [
            {
                id: 'greenTractor',
                name: 'TRATOR VERDE',
                color: 0x58a65c,
                textureKey: 'tractorGreen',
            },
            {
                id: 'blueTractor',
                name: 'TRATOR AZUL',
                color: 0x4b8ed6,
                textureKey: 'tractorBlue',
            },
            {
                id: 'redTractor',
                name: 'TRATOR VERMELHO',
                color: 0xd65a5a,
                textureKey: 'tractorRed',
            },
            {
                id: 'yellowTractor',
                name: 'TRATOR AMARELO',
                color: 0xe0b844,
                textureKey: 'tractorYellow',
            },
        ],
    },
    treasureChest: {
        enabled: true,
        activationChance: 0.01,
        // Uso exclusivo de build: destaca as espigas que encerram a feature.
        // Não altera a distribuição dos prêmios nem o resultado da rodada.
        debugShowEndingChests: false,
        chestCount: 8,
        endingChestCount: 2,
        rewardMultipliers: [0.5, 1, 1.5, 1.75, 2, 2.25],
        revealDelay: 700,
        payoutCountDuration: 1800,
    },
    cardDouble: {
        enabled: true,
        activationChance: 100,
        thresholdRank: 7,
        // Um baralho de 26 cartas: cada valor existe uma vez em cada cor.
        // O Ás vale 1, deixando seis valores abaixo e seis acima do 7.
        suits: [
            { id: 'spades', symbol: '♠', color: 'black' },
            { id: 'hearts', symbol: '♥', color: 'red' },
        ],
        finalDisplayDuration: 1500,
    },
    wheelBonus: {
        enabled: true,
        activationChance: 0.01,
        initialSpins: 3,
        spinDuration: 2200,
        finalDisplayDuration: 1200,
        // Cada item representa uma fatia. O peso controla a chance relativa
        // de parada; os valores de prêmio são multiplicadores da rodada-base.
        slices: [
            { id: 'prize', label: 'PRÊMIO x2', type: 'payout', multiplier: 2, weight: 25 },
            { id: 'pass', label: 'PASSA A VEZ', type: 'pass', weight: 25 },
            { id: 'extra', label: '+2 GIROS', type: 'extraSpins', spins: 2, weight: 5 },
            { id: 'double', label: 'MULTIPLICA x2', type: 'multiply', multiplier: 2, weight: 10 },
            { id: 'jackpot', label: 'PRÊMIO x5', type: 'payout', multiplier: 5, weight: 2 },
            { id: 'lose', label: 'PERDE TUDO', type: 'loseAll', weight: 7 },
        ],
    },
} as const;
