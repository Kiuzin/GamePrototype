export const GameTheme = {
    colors: {
        background: 0x222222, button: 0xaaaaaa, autoSpinButton: 0xaaaaaa,
        activeAutoSpinButton: 0xd28b21, turboButton: 0xaaaaaa, activeTurboButton: 0xe6b800,
        historyButton: 0xaaaaaa, buttonText: '#000000', text: '#ffffff', win: '#ffff00',
        error: '#ff4444', disabledButton: 0x555555,
    },
    winPresentation: {
        lineDuration: 900, lineWidth: 8, lineColor: 0xffff00, symbolStrokeWidth: 6,
        symbolStrokeColor: 0xffffff, symbolPulseScale: 1.12, symbolPulseDuration: 220,
        finalPauseDuration: 350,
    },
    winPayoutFeedback: {
        color: '#ffe34f',
        strokeColor: '#4a2507',
        strokeThickness: 10,
    },
    historyModal: {
        overlayColor: 0x000000, overlayAlpha: 0.7, panelColor: 0x24150e,
        panelStrokeColor: 0xd28b21, panelStrokeWidth: 4,
    },
    topHud: {
        panelColor: 0x24150e, panelStrokeColor: 0xd28b21, panelStrokeWidth: 3,
        buttonColor: 0x6d3f1e, activeButtonColor: 0xd28b21, buttonText: '#ffffff',
    },
    walletModal: {
        overlayColor: 0x000000, overlayAlpha: 0.75, panelColor: 0x24150e,
        panelStrokeColor: 0xd28b21, panelStrokeWidth: 4, amountButtonColor: 0x6d3f1e,
        selectedAmountButtonColor: 0xd28b21, depositButtonColor: 0x3b8a47,
        withdrawButtonColor: 0xa64b3d,
    },
    rulesModal: {
        overlayColor: 0x000000, overlayAlpha: 0.75, panelColor: 0x24150e,
        panelStrokeColor: 0xd28b21, panelStrokeWidth: 4,
    },
} as const;
