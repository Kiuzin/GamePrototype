/**
 * Tema e movimentos das interfaces de bônus.
 * A geometria permanece em BonusLayoutConfig para permitir ajustes independentes.
 */
export const BonusThemeConfig = {
    fontFamily: 'Arial',
    luckyCorn: {
        panel: { color: 0x2d1609, alpha: 0.96, strokeColor: 0xffd54a, strokeWidth: 5 },
        colors: { suspense: '#ffe06b', feature: '#ffd54a', detail: '#ffffff', jackpot: '#ffe06b' },
        entrance: { initialScale: 0.9, duration: 220, ease: 'Back.easeOut' },
    },

    horseRace: {
        selection: {
            overlayColor: 0x07140e, overlayAlpha: 0.98, headerColor: 0x153b28,
            cardColor: 0x173b29, cardStrokeWidth: 4,
        },
        race: {
            backgroundColor: 0x184c31, headerColor: 0x102d20,
            laneColors: [0x265e3d, 0x215536], laneAlpha: 0.95,
            dividerColor: 0xffffff, dividerAlpha: 0.15, dividerWidth: 2,
            finishCheckerColors: [0xffffff, 0x101010],
            selectedIndicatorColor: 0xffe06b,
            winnerHighlight: { color: 0xffe06b, strokeWidth: 8, minAlpha: 0.25, duration: 420 },
        },
        podium: {
            overlayColor: 0x07140e, overlayAlpha: 0.98, strokeColor: 0xffffff,
            strokeWidth: 4, buttonColor: 0xd28b21, buttonStrokeColor: 0xffe06b,
            buttonStrokeWidth: 3,
            reveal: { blockDuration: 440, contentDuration: 230, stepDelay: 180, contentOffsetY: 28 },
        },
        colors: { highlight: '#ffe06b', primaryText: '#ffffff', secondaryText: '#d7edcf', darkText: '#102d20' },
    },

    treasureChest: {
        overlay: { color: 0x07140e, alpha: 0.98 },
        headerColor: 0x173b29,
        card: { color: 0x204c35, selectedColor: 0x315f43, strokeColor: 0xffd54a, strokeWidth: 4, revealedStrokeColor: 0xffffff, hoverScale: 1.025 },
        ear: { closedTextureKey: 'cornEarClosed', openTextureKey: 'cornEarOpen', shakeDistance: 13, shakeDuration: 70, revealDuration: 220 },
        accumulated: { duration: 480, scaleStep: 0.08, maxScale: 1.72, baseShakeDistance: 1.5, shakeStep: 1.25, maxShakeDistance: 6, shakeDuration: 120 },
        colors: { highlight: '#ffe06b', primaryText: '#ffffff', secondaryText: '#cce6cb', reward: '#8ff0a4', ending: '#ff9b75', debugEnding: '#ff8d7a' },
        final: { buttonColor: 0xd28b21, buttonStrokeColor: 0xffe06b, buttonStrokeWidth: 3 },
    },

    cardDouble: {
        overlay: { color: 0x07140e, alpha: 0.98 },
        headerColor: 0x32183f,
        card: { color: 0xf5f0df, backColor: 0x481d65, strokeColor: 0xffd54a, strokeWidth: 5 },
        colors: { highlight: '#ffe06b', primaryText: '#ffffff', secondaryText: '#e6dcec', redCard: '#d64141', blackCard: '#151515', win: '#8ff0a4', loss: '#ff9b75' },
        buttons: { primaryColor: 0x3e8b55, secondaryColor: 0x345d9d, cashoutColor: 0xd28b21, strokeColor: 0xffe06b, strokeWidth: 3 },
        animation: { entranceDuration: 360, entranceOffsetY: 42, cardDealDelay: 110, cardFlipDuration: 340, buttonDuration: 140, exitDuration: 260, exitOffsetY: 28 },
    },
    wheelBonus: {
        overlay: { color: 0x07140e, alpha: 0.98 },
        headerColor: 0x263452,
        wheelColors: [0x3e8b55, 0xd28b21, 0x345d9d, 0x7b3f8c, 0x9a3939, 0x000000],
        wheelStrokeColor: 0xffe06b,
        wheelStrokeWidth: 5,
        pointerColor: 0xffe06b,
        colors: { highlight: '#ffe06b', primaryText: '#ffffff', secondaryText: '#d7e3ff', win: '#8ff0a4', loss: '#ff9b75' },
        buttons: { primaryColor: 0x3e8b55, secondaryColor: 0xd28b21, strokeColor: 0xffe06b, strokeWidth: 3 },
    },
} as const;
