import type { Scene } from 'phaser';
import { FeatureConfig } from '../config/FeatureConfig';
import { GameConfig } from '../config/GameConfig';
import { PayoutCalculator } from './PayoutCalculator';
import { SlotCore } from './SlotCore';
import type { SpinResult } from './SlotCore';
import type { LuckyCornLockedGrid, LuckyCornRound } from './LuckyCornFeature';
import { LuckyCornFeature } from './LuckyCornFeature';
import { Reel } from '../objects/Reel';
import { LuckyCornFeedback } from '../presentation/LuckyCornFeedback';

interface LuckyCornFeatureFlowOptions {
    scene: Scene;
    reels: readonly Reel[];
    feature: LuckyCornFeature;
    feedback?: LuckyCornFeedback;
    isSpinActive: () => boolean;
    setResultText: (text: string) => void;
    finishSpin: (result: SpinResult) => void;
}

/** Orquestra o re-spin do Milho da Sorte sem acoplar sua lógica à cena principal. */
export class LuckyCornFeatureFlow {
    private readonly scene: Scene;

    private readonly reels: readonly Reel[];

    private readonly feature: LuckyCornFeature;

    private readonly feedback?: LuckyCornFeedback;

    private readonly isSpinActive: () => boolean;

    private readonly setResultText: (text: string) => void;

    private readonly finishSpin: (result: SpinResult) => void;

    public constructor(options: LuckyCornFeatureFlowOptions) {
        this.scene = options.scene;
        this.reels = options.reels;
        this.feature = options.feature;
        this.feedback = options.feedback;
        this.isSpinActive = options.isSpinActive;
        this.setResultText = options.setResultText;
        this.finishSpin = options.finishSpin;
    }

    public scheduleSuspense(round: LuckyCornRound): void {
        this.scene.time.delayedCall(FeatureConfig.luckyCorn.suspenseStartDelay, () => {
            this.runStep(() => {
                if (!this.isSpinActive() || !this.feature.isActive()) {
                    return;
                }

                this.feedback?.showSuspense(FeatureConfig.luckyCorn.suspenseDisplayDuration);
                const symbols = this.feature.getSpinSymbols();

                this.reels.forEach((reel, index) => {
                    reel.replaceSpinStrip(
                        round.grid[index],
                        symbols,
                        FeatureConfig.luckyCorn.reelTransitionDuration
                    );
                });
                this.setResultText('O MILHO DA SORTE ESTÁ CHEGANDO...');
            });
        });
    }

    public completeRound(
        currentBet: number,
        round: LuckyCornRound,
        baseGrid: string[][]
    ): void {
        this.runStep(() => {
            this.applyLocks(round.lockedGrid);

            if (round.shouldRespin) {
                this.scene.time.delayedCall(
                    FeatureConfig.luckyCorn.respinDelay,
                    () => this.playRound(currentBet, baseGrid)
                );
                return;
            }

            const result = SlotCore.resolve(currentBet, round.grid);
            const multiplier = this.feature.calculatePayoutMultiplier();
            const multipliedResult = {
                ...result,
                payout: PayoutCalculator.applyMultiplier(result.payout, multiplier),
            };

            this.feature.finish();
            this.clearLocks();

            if (multipliedResult.payout.totalPayout <= 0 || !this.feedback) {
                this.restoreBaseGrid(baseGrid);

                if (!this.feedback) {
                    this.finishSpin(multipliedResult);
                    return;
                }

                this.feedback.showNoWin(
                    FeatureConfig.luckyCorn.noWinDisplayDuration,
                    () => this.finishSpin(multipliedResult)
                );
                return;
            }

            this.feedback.showFinalPayout(
                multipliedResult.payout.totalPayout,
                multiplier,
                FeatureConfig.luckyCorn.finalDisplayDuration,
                FeatureConfig.luckyCorn.finalDisplayPause,
                () => this.finishSpin(multipliedResult)
            );
        });
    }

    private playRound(currentBet: number, baseGrid: string[][]): void {
        this.runStep(() => {
            const round = this.feature.playRound();
            this.setResultText('MILHO DA SORTE');
            this.spinReels(round, () => this.completeRound(currentBet, round, baseGrid));
        });
    }

    private spinReels(round: LuckyCornRound, onComplete: () => void): void {
        let stoppedReels = 0;
        const symbols = this.feature.getSpinSymbols();

        this.reels.forEach((reel, index) => {
            reel.setLockedRows(round.lockedGridBeforeSpin[index]);
            this.scene.time.delayedCall(index * GameConfig.reel.reelStartDelay, () => {
                reel.setOnComplete(() => {
                    stoppedReels++;
                    if (stoppedReels === this.reels.length) {
                        onComplete();
                    }
                });
                reel.startSpin(round.grid[index], GameConfig.reel.spinDuration, symbols);
            });
        });
    }

    private applyLocks(lockedGrid: LuckyCornLockedGrid): void {
        this.reels.forEach((reel, index) => reel.setLockedRows(lockedGrid[index]));
    }

    private restoreBaseGrid(baseGrid: readonly string[][]): void {
        this.reels.forEach((reel, index) => reel.showResult(baseGrid[index]));
    }

    private clearLocks(): void {
        this.reels.forEach(reel => reel.clearLockedRows());
    }

    private runStep<T>(operation: () => T): T {
        let completed = false;

        try {
            const result = operation();
            completed = true;
            return result;
        } finally {
            if (!completed) {
                this.feature.finish();
                this.clearLocks();
            }
        }
    }
}
