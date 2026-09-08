export const GameConfig = {
    screen: {
        width: 1080,
        height: 1920,
    },

    reels: 3,
    rows: 3,

    bet: {
        initialBalance: 1000,

        defaultBet: 10,

        values: [
            1,
            2,
            5,
            10,
            20,
            50,
            100,
        ],
    },

    reel: {
        symbolWidth: 230,
        symbolHeight: 230,
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

    turbo: {
        spinDuration: 700,
        reelStartDelay: 100,
    },

    history: {
        maxEntries: 10,
    },

    spinButtonAnimation: {
        idleSpeed: 30,
        boostSpeed: 1800,
        boostDuration: 180,
        returnDuration: 2020,
    },

    winPresentation: {
        lineDuration: 900,

        lineWidth: 8,

        lineColor: 0xffff00,

        symbolStrokeWidth: 6,

        symbolStrokeColor: 0xffffff,

        symbolPulseScale: 1.12,

        symbolPulseDuration: 220,

        finalPauseDuration: 350,
    },

    layout: {

        betDecreaseButton: {
            x: 335,
            y: 1585,
            width: 100,
            height: 100,
        },

        betIncreaseButton: {
            x: 750,
            y: 1585,
            width: 100,
            height: 100,
        },

        reelPositions: [
            { x: 250, y: 750 },
            { x: 540, y: 750 },
            { x: 830, y: 750 },
        ],

        reelBackdrop: {
            // Painel decorativo atrás dos rolos.
            x: 540,
            y: 1000,
            width: 950,
            height: 870,
            cornerRadius: 36,
            color: 0x24150e,
            grainColor: 0x3b2317,
            grainSpacing: 58,
        },

        reelFrame: {
            // Ajuste horizontal e vertical da moldura.
            // Diminua y para subir; aumente y para descer.
            x: 540,
            y: 980,

            // Ajuste manual do tamanho da moldura.
            width: 1100,
            height: 1100,
        },

        controlsBackdrop: {
            x: 540,
            y: 1850,
            width: 1080,
            height: 810,
        },

        reelMask: {
            // Janela visível de cada rolo.
            width: 250,
            height: 800,

            // Deslocamento relativo ao centro do primeiro símbolo.
            // Diminua offsetY para subir; aumente para descer.
            offsetX: 0,
            offsetY: 200,
        },

        title: {
            x: 540,
            y: 50,
        },

        debug: {
            x: 300,
            y: 150,
        },

        balanceLabel: {
            x: 125,
            y: 1560,
            fontSize: '16px',
            color: '#ffffff',
        },

        balanceValue: {
            x: 150,
            y: 1600,
            fontSize: '32px',
            color: '#00ff00',
        },

        betLabel: {
            x: 880,
            y: 1560,
            fontSize: '16px',
            color: '#ffffff',
        },

        betValue: {
            x: 920,
            y: 1600,
            fontSize: '32px',
            color: '#ffffff',
        },

        result: {
            x: 550,
            y: 1460,
        },

        spinButton: {
            x: 536,
            y: 1578,
            width: 215,
            height: 215,
        },

        autoSpinButton: {
            x: 215,
            y: 1750,
            width: 220,
            height: 70,
        },

        turboButton: {
            x: 865,
            y: 1750,
            width: 220,
            height: 70,
        },

        historyButton: {
            x: 540,
            y: 1750,
            width: 300,
            height: 70,
        },
    },

    colors: {
        background: 0x222222,
        button: 0xaaaaaa,
        autoSpinButton: 0xaaaaaa,
        activeAutoSpinButton: 0xd28b21,
        turboButton: 0xaaaaaa,
        activeTurboButton: 0xe6b800,
        historyButton: 0xaaaaaa,
        buttonText: '#000000',
        text: '#ffffff',
        win: '#ffff00',
        error: '#ff4444',
        disabledButton: 0x555555,
    },
} as const;
