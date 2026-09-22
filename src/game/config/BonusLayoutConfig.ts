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
            track: { startX: 120, finishRight: 115, firstLaneY: 400, laneHeight: 145, laneInset: 1, laneExtraWidth: 70, laneLabelX: 48, laneLabelFontSize: '23px', dividerTop: 315, finishLine: { edgeOffset: 20, checkerSize: 20, columns: 2 }, tractorScale: 0.7 },
        },
        podium: {
            titleY: 1020, titleFontSize: '40px', blockWidth: 210,
            baseY: 1580,
            places: [
                { rank: 2, x: 285, height: 165, color: 0xc4cbd0 },
                { rank: 1, x: 540, height: 250, color: 0xffd54a },
                { rank: 3, x: 795, height: 115, color: 0xcf8b48 },
            ],
            runner: { tractorOffsetY: -45, tractorScale: 0.54, rankOffsetY: 35, rankFontSize: '32px', nameOffsetY: -100, nameFontSize: '16px', nameWidth: 200 },
            prizeY: 1710, prizeFontSize: '32px',
            continueButton: { y: 1830, width: 390, height: 90, fontSize: '28px' },
        },
    },
    treasureChest: {
        depth: 520,
        header: { y: 140, height: 225, titleY: 105, titleFontSize: '45px', subtitleY: 165, subtitleFontSize: '23px', progressY: 245, progressFontSize: '27px' },
        grid: { columns: [285, 795], firstY: 530, rowGap: 270, cardWidth: 405, cardHeight: 220, chestOffsetY: -28, chestScale: 1.2, labelOffsetY: 75, labelFontSize: '25px' },
        final: { totalY: 1600, totalFontSize: '54px', detailY: 1515, detailFontSize: '26px', continueButton: { y: 1700, width: 390, height: 105, fontSize: '31px' } },
    },
    cardDouble: {
        depth: 530,
        header: { y: 145, height: 235, titleY: 95, titleFontSize: '45px', prizeY: 160, prizeFontSize: '34px', deckY: 220, deckFontSize: '22px' },
        card: { x: 540, y: 755, width: 400, height: 550, rankOffsetX: 130, rankOffsetY: 175, rankFontSize: '112px', suitOffsetY: 72, suitFontSize: '100px', questionFontSize: '120px' },
        prompt: { y: 1115, fontSize: '28px' },
        buttons: { firstY: 1270, secondY: 1410, width: 370, height: 100, fontSize: '29px', leftX: 320, rightX: 760, cashoutY: 1560 },
        feedback: { y: 1120, fontSize: '34px', finalY: 1150, finalFontSize: '62px' },
    },
} as const;
