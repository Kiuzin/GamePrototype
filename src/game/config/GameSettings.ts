export const GameSettings = {
    screen: { width: 1080, height: 1920 },
    reels: 3,
    rows: 3,
    bet: { initialBalance: 1000, defaultBet: 10, values: [1, 2, 5, 10, 20, 50, 100] },
    reel: {
        symbolWidth: 230, symbolHeight: 230, symbolGap: 5, visualObjects: 5,
        visibleRows: 3, extraRotations: 4, spinDuration: 1800, reelStartDelay: 300,
    },
    turbo: { spinDuration: 700, reelStartDelay: 100 },
    history: { maxEntries: 10 },
    spinButtonAnimation: { idleSpeed: 30, boostSpeed: 1800, boostDuration: 180, returnDuration: 2020 },
} as const;
