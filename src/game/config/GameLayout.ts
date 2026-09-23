import { ScreenLayout } from './ScreenLayout';

const { centerX, height: screenHeight, width: screenWidth, x, y, horizontal, vertical } = ScreenLayout;

export const GameLayout = {
    betDecreaseButton: { x: x(370), y: y(1600), width: horizontal(140), height: vertical(140) },
    betIncreaseButton: { x: x(700), y: y(1600), width: horizontal(140), height: vertical(140) },
    reelPositions: [{ x: x(250), y: y(750) }, { x: centerX, y: y(750) }, { x: x(830), y: y(750) }],
    reelBackdrop: { x: centerX, y: y(1000), width: horizontal(950), height: vertical(870), cornerRadius: 36, color: 0x24150e, grainColor: 0x3b2317, grainSpacing: 58 },
    reelFrame: { x: centerX, y: y(980), width: horizontal(1100), height: vertical(1100) },
    controlsBackdrop: { x: centerX, y: y(1850), width: screenWidth, height: vertical(810) },
    controlsDetails: { x: x(175), y: y(1590), width: horizontal(225), height: vertical(125) },
    controlsDetailsOpposite: { x: x(905), y: y(1590), width: horizontal(225), height: vertical(125) },
    reelMask: { width: horizontal(250), height: vertical(800), offsetX: 0, offsetY: vertical(200) },
    title: { x: centerX, y: y(50) }, debug: { x: x(300), y: y(150) },
    balanceLabel: { x: x(145), y: y(1560), fontSize: '24px', color: '#ffffff' },
    balanceValue: { x: x(175), y: y(1600), fontSize: '38px', color: '#00ff00' },
    betLabel: { x: x(850), y: y(1560), fontSize: '24px', color: '#ffffff' },
    betValue: { x: x(910), y: y(1600), fontSize: '38px', color: '#ffffff' },
    result: { x: centerX, y: y(1460) }, spinButton: { x: centerX, y: y(1578), width: horizontal(175), height: vertical(175) },
    autoSpinButton: { x: x(215), y: y(1775), width: horizontal(275), height: vertical(135) },
    turboButton: { x: x(875), y: y(1775), width: horizontal(285), height: vertical(150) },
    historyButton: { x: centerX, y: y(1775), width: horizontal(350), height: vertical(100) },
    historyModal: {
        depth: 20, panel: { width: horizontal(900), height: vertical(1080) }, titleY: y(500),
        content: { offsetX: horizontal(-370), y: y(590), width: horizontal(740) },
        closeButton: { y: y(1440), width: horizontal(240), height: vertical(70) },
    },
    screen: { width: screenWidth, height: screenHeight },
} as const;
