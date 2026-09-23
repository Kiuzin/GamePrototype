/**
 * Geometria das interfaces dos bônus. Posições e dimensões usam ScreenLayout
 * para acompanhar a resolução configurada em GameSettings.
 */
import { ScreenLayout } from './ScreenLayout';

const { centerX, x, y, horizontal, vertical } = ScreenLayout;

export const BonusLayoutConfig = {
    luckyCorn: {
        depth: 200,
        panel: { y: y(1010), width: horizontal(860), height: vertical(215) },
        title: { y: y(965), fontSize: '42px' },
        detail: { y: y(1050), fontSize: '27px' },
        jackpotValueFontSize: '68px',
    },
    horseRace: {
        depth: 500,
        selection: {
            header: { y: y(150), height: vertical(220), eyebrowY: y(115), eyebrowFontSize: '25px', eyebrowLetterSpacing: 4, titleY: y(170), titleFontSize: '48px', subtitleY: y(245), subtitleFontSize: '24px' },
            cards: { columns: [x(285), x(795)], firstY: y(560), rowGap: vertical(350), width: horizontal(430), height: vertical(270), tractorOffsetY: vertical(-32), tractorScale: 1.35, labelOffsetY: vertical(105), labelFontSize: '24px', labelWidth: horizontal(370) },
        },
        race: {
            header: { y: y(105), height: vertical(165), titleY: y(82), titleFontSize: '39px', segmentY: y(305), segmentFontSize: '24px', segmentLetterSpacing: 2 },
            track: { startX: x(120), finishRight: horizontal(115), firstLaneY: y(400), laneHeight: vertical(145), laneInset: 1, laneExtraWidth: horizontal(70), laneLabelX: x(48), laneLabelFontSize: '23px', dividerTop: y(315), finishLine: { edgeOffset: horizontal(20), checkerSize: horizontal(20), columns: 2 }, tractorScale: 0.7 },
        },
        podium: {
            titleY: y(1020), titleFontSize: '40px', blockWidth: horizontal(210), baseY: y(1580),
            places: [
                { rank: 2, x: x(285), height: vertical(165), color: 0xc4cbd0 },
                { rank: 1, x: centerX, height: vertical(250), color: 0xffd54a },
                { rank: 3, x: x(795), height: vertical(115), color: 0xcf8b48 },
            ],
            runner: { tractorOffsetY: vertical(-45), tractorScale: 0.54, rankOffsetY: vertical(35), rankFontSize: '32px', nameOffsetY: vertical(-100), nameFontSize: '16px', nameWidth: horizontal(200) },
            prizeY: y(1710), prizeFontSize: '32px',
            continueButton: { y: y(1830), width: horizontal(390), height: vertical(90), fontSize: '28px' },
        },
    },
    treasureChest: {
        depth: 520,
        header: { y: y(140), height: vertical(225), titleY: y(105), titleFontSize: '45px', subtitleY: y(165), subtitleFontSize: '23px', progressY: y(245), progressFontSize: '27px' },
        grid: { columns: [x(285), x(795)], firstY: y(530), rowGap: vertical(270), cardWidth: horizontal(405), cardHeight: vertical(220), chestOffsetY: vertical(-28), chestScale: 1.2, labelOffsetY: vertical(75), labelFontSize: '25px' },
        final: { totalY: y(1600), totalFontSize: '54px', detailY: y(1515), detailFontSize: '26px', continueButton: { y: y(1700), width: horizontal(390), height: vertical(105), fontSize: '31px' } },
    },
    cardDouble: {
        depth: 530,
        header: { y: y(145), height: vertical(235), titleY: y(95), titleFontSize: '45px', prizeY: y(160), prizeFontSize: '34px', deckY: y(220), deckFontSize: '22px' },
        card: { x: centerX, y: y(755), width: horizontal(400), height: vertical(550), rankOffsetX: horizontal(130), rankOffsetY: vertical(175), rankFontSize: '112px', suitOffsetY: vertical(72), suitFontSize: '100px', questionFontSize: '120px' },
        prompt: { y: y(1115), width: horizontal(900), fontSize: '28px' },
        buttons: { firstY: y(1270), secondY: y(1410), width: horizontal(370), height: vertical(100), labelPadding: horizontal(25), fontSize: '29px', leftX: x(320), rightX: x(760), cashoutY: y(1560) },
        feedback: { y: y(1120), fontSize: '34px', finalY: y(1150), finalFontSize: '62px' },
    },
    wheelBonus: {
        depth: 540,
        header: { y: y(130), height: vertical(230), titleY: y(85), titleFontSize: '45px', statusY: y(155), statusFontSize: '28px', prizeY: y(220), prizeFontSize: '32px' },
        wheel: { x: centerX, y: y(795), radius: horizontal(360), labelRadius: horizontal(220), labelWidth: horizontal(130), labelFontSize: '21px', pointerX: centerX, pointerY: y(400), pointerHalfWidth: horizontal(28), pointerHeight: vertical(52) },
        feedback: { y: y(1235), width: horizontal(930), fontSize: '29px' },
        final: { messageWidth: horizontal(900), messageFontSize: '48px' },
        buttons: { spinY: y(1400), skipY: y(1535), width: horizontal(520), height: vertical(100), labelPadding: horizontal(24), fontSize: '29px' },
    },
} as const;
