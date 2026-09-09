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
            x: 370,
            y: 1600,
            width: 140,
            height: 140,
        },

        betIncreaseButton: {
            x: 700,
            y: 1600,
            width: 140,
            height: 140,
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

        controlsDetails: {
            x: 175,
            y: 1590,
            width: 225,
            height: 125,
        },

        controlsDetailsOpposite: {
            x: 905,
            y: 1590,
            width: 225,
            height: 125,
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
            x: 145,
            y: 1560,
            fontSize: '24px',
            color: '#ffffff',
        },

        balanceValue: {
            x: 175,
            y: 1600,
            fontSize: '38px',
            color: '#00ff00',
        },

        betLabel: {
            x: 850,
            y: 1560,
            fontSize: '24px',
            color: '#ffffff',
        },

        betValue: {
            x: 910,
            y: 1600,
            fontSize: '38px',
            color: '#ffffff',
        },

        result: {
            x: 550,
            y: 1460,
        },

        spinButton: {
            x: 536,
            y: 1578,
            width: 175,
            height: 175,
        },

        autoSpinButton: {
            x: 215,
            y: 1775,
            width: 275,
            height: 135,
        },

        turboButton: {
            x: 875,
            y: 1775,
            width: 285,
            height: 150,
        },

        historyButton: {
            x: 540,
            y: 1775,
            width: 350,
            height: 100,
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
