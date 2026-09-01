export const GameConfig = {
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
            x: 400,
            y: 1700,
            width: 50,
            height: 50,
        },

        betIncreaseButton: {
            x: 700,
            y: 1700,
            width: 50,
            height: 50,
        },

        reelPositions: [
            { x: 260, y: 750 },
            { x: 550, y: 750 },
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

        reelMask: {
            // Janela visível de cada rolo.
            width: 200,
            height: 800,

            // Deslocamento relativo ao centro do primeiro símbolo.
            // Diminua offsetY para subir; aumente para descer.
            offsetX: 0,
            offsetY: 200,
        },

        title: {
            x: 440,
            y: 50,
        },

        debug: {
            x: 300,
            y: 150,
        },

        balance: {
            x: 550,
            y: 1600,
        },

        bet: {
            x: 550,
            y: 1550,
        },

        result: {
            x: 550,
            y: 1500,
        },

        spinButton: {
            x: 550,
            y: 1700,
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
        disabledButton: 0x555555,
    },
} as const;
