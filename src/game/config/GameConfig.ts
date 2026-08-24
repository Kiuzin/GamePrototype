export const GameConfig = {
    reels: 3,
    rows: 3,

    bet: {
        initialBalance: 1000,
        defaultBet: 10,
        minBet: 1,
        maxBet: 100,
        step: 1,
    },

    reel: {
        symbolWidth: 100,
        symbolHeight: 100,
        symbolGap: 5,

        // Precisamos de 5 objetos visuais:
        // 1 acima da área visível
        // 3 visíveis
        // 1 abaixo da área visível
        visualObjects: 5,

        visibleRows: 3,

        extraRotations: 4,
        spinDuration: 1800,
        reelStartDelay: 300,
    },

    layout: {
        reelPositions: [
            { x: 200, y: 200 },
            { x: 350, y: 200 },
            { x: 500, y: 200 },
        ],

        title: {
            x: 650,
            y: 50,
        },

        debug: {
            x: 600,
            y: 150,
        },

        balance: {
            x: 400,
            y: 560,
        },

        bet: {
            x: 400,
            y: 600,
        },

        result: {
            x: 600,
            y: 550,
        },

        spinButton: {
            x: 500,
            y: 700,
            width: 200,
            height: 60,
        },
    },

    colors: {
        background: 0x222222,
        button: 0xaaaaaa,
        buttonText: '#000000',
        text: '#ffffff',
        balance: '#00ff00',
        bet: '#ffffff',
        win: '#ffff00',
        error: '#ff4444',
    },
} as const;