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
        },
        podium: {
            overlayColor: 0x07140e, overlayAlpha: 0.98, strokeColor: 0xffffff,
            strokeWidth: 4, buttonColor: 0xd28b21, buttonStrokeColor: 0xffe06b,
            buttonStrokeWidth: 3,
        },
        colors: { highlight: '#ffe06b', primaryText: '#ffffff', secondaryText: '#d7edcf', darkText: '#102d20' },
        tractor: { bodyY: 3, bodyWidth: 108, bodyHeight: 70, strokeWidth: 3, emoji: '🚜', emojiFontSize: '68px' },
    },
    treasureChest: {
        overlay: { color: 0x07140e, alpha: 0.98 },
        headerColor: 0x173b29,
        card: { color: 0x204c35, selectedColor: 0x315f43, strokeColor: 0xffd54a, strokeWidth: 4, revealedStrokeColor: 0xffffff },
        chest: { emoji: '🧰', emojiFontSize: '72px' },
        colors: { highlight: '#ffe06b', primaryText: '#ffffff', secondaryText: '#cce6cb', reward: '#8ff0a4', ending: '#ff9b75' },
        final: { buttonColor: 0xd28b21, buttonStrokeColor: 0xffe06b, buttonStrokeWidth: 3 },
    },
} as const;
