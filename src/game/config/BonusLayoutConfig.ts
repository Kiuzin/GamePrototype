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
            header: { y: 150, height: 220, eyebrowY: 115, eyebrowFontSize: '25px', eyebrowLetterSpacing: 4, titleY: 170, titleFontSize: '48px', subtitleY: 245, subtitleFontSize: '24px' },
            cards: { columns: [285, 795], firstY: 560, rowGap: 350, width: 430, height: 270, tractorOffsetY: -32, tractorScale: 1.35, labelOffsetY: 105, labelFontSize: '24px', labelWidth: 370 },
        },
        race: {
            header: { y: 105, height: 165, titleY: 82, titleFontSize: '39px', segmentY: 305, segmentFontSize: '24px', segmentLetterSpacing: 2 },
            track: { startX: 120, finishRight: 115, firstLaneY: 390, laneHeight: 255, laneInset: 1, laneExtraWidth: 70, laneLabelX: 48, laneLabelFontSize: '23px', dividerTop: 270, dividerBottomOffset: 120, finishLine: { edgeOffset: 28, checkerSize: 20, columns: 2 }, tractorScale: 0.78 },
        },
        podium: {
            titleY: 150, titleFontSize: '46px', blockWidth: 235,
            baseY: 1230,
            places: [
                { rank: 2, x: 260, height: 210, color: 0xc4cbd0 },
                { rank: 1, x: 540, height: 325, color: 0xffd54a },
                { rank: 3, x: 820, height: 145, color: 0xcf8b48 },
            ],
            runner: { tractorOffsetY: -55, tractorScale: 0.64, rankOffsetY: 42, rankFontSize: '38px', nameOffsetY: -120, nameFontSize: '18px', nameWidth: 230 },
            prizeY: 1490, prizeFontSize: '37px',
            continueButton: { y: 1690, width: 390, height: 105, fontSize: '31px' },
        },
    },
} as const;
