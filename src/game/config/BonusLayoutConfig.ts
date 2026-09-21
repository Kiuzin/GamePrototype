/**
 * Geometria das interfaces dos bônus.
 * Mantém posições e dimensões fora das apresentações Phaser para facilitar
 * ajustes visuais e testes em resoluções de referência.
 */
export const BonusLayoutConfig = {
    luckyCorn: {
        depth: 200,
        panel: { y: 1010, width: 860, height: 215 },
        title: { y: 965, fontSize: '42px' },
        detail: { y: 1050, fontSize: '27px' },
        jackpotValueFontSize: '68px',
    },
    horseRace: {
        depth: 500,
        selection: {
            header: { y: 150, height: 220, eyebrowY: 115, titleY: 170, subtitleY: 245 },
            cards: { columns: [285, 795], firstY: 560, rowGap: 350, width: 430, height: 270, tractorOffsetY: -32, labelOffsetY: 105 },
        },
        race: {
            header: { y: 105, height: 165, titleY: 82, segmentY: 305 },
            track: { startX: 120, finishRight: 115, firstLaneY: 390, laneHeight: 255, laneInset: 1, laneExtraWidth: 70, laneLabelX: 48 },
        },
        podium: {
            titleY: 150,
            baseY: 1230,
            places: [
                { rank: 2, x: 260, height: 210, color: 0xc4cbd0 },
                { rank: 1, x: 540, height: 325, color: 0xffd54a },
                { rank: 3, x: 820, height: 145, color: 0xcf8b48 },
            ],
            prizeY: 1490,
            continueButton: { y: 1690, width: 390, height: 105 },
        },
    },
} as const;
