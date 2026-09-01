import {
    Scene,
    GameObjects,
    Time,
} from 'phaser';

import {
    GameConfig,
} from '../config/GameConfig';

import type {
    WinningLineResult,
} from '../logic/WinChecker';

import type {
    LinePayoutResult,
} from '../logic/PayoutCalculator';

import {
    Reel,
} from '../objects/Reel';

export interface WinPresentationOptions {
    onLineStart?: (
        win: WinningLineResult,
        payout:
            LinePayoutResult | undefined
    ) => void;

    onComplete?: () => void;
}

export class WinPresentation {
    private readonly scene: Scene;

    private readonly reels: Reel[];

    private readonly graphics:
        GameObjects.Graphics;

    private pendingTimer?:
        Time.TimerEvent;

    private isPlaying = false;

    constructor(
        scene: Scene,
        reels: Reel[]
    ) {
        this.scene =
            scene;

        this.reels =
            reels;

        this.graphics =
            this.scene.add.graphics();

        /**
         * Mantém a payline visual
         * acima dos símbolos.
         */
        this.graphics.setDepth(
            100
        );
    }

    // =====================================================
    // PUBLIC
    // =====================================================

    public play(
        winningLines:
            WinningLineResult[],

        payouts:
            LinePayoutResult[],

        options:
            WinPresentationOptions = {}
    ): void {
        this.stop();

        if (
            winningLines.length === 0
        ) {
            options.onComplete?.();

            return;
        }

        this.isPlaying =
            true;

        this.playLine(
            winningLines,
            payouts,
            0,
            options
        );
    }

    /**
     * Interrompe qualquer apresentação
     * que esteja acontecendo.
     */
    public stop(): void {
        this.isPlaying =
            false;

        this.cancelPendingTimer();

        this.clearVisuals();
    }

    /**
     * Apenas limpa os efeitos.
     * Não interfere no restante do jogo.
     */
    public clearVisuals(): void {
        this.graphics.clear();

        for (
            const reel of
            this.reels
        ) {
            reel.clearWinEffects();
        }
    }

    // =====================================================
    // LINE SEQUENCE
    // =====================================================

    private playLine(
        winningLines:
            WinningLineResult[],

        payouts:
            LinePayoutResult[],

        index: number,

        options:
            WinPresentationOptions
    ): void {
        if (!this.isPlaying) {
            return;
        }

        // Terminou todas
        if (
            index >=
            winningLines.length
        ) {
            this.finish(
                options
            );

            return;
        }

        const win =
            winningLines[index];

        const payout =
            payouts.find(
                payoutItem =>
                    payoutItem.lineId ===
                    win.lineId
            );

        this.clearVisuals();

        this.highlightWinningSymbols(
            win
        );

        this.drawPayline(
            win
        );

        options.onLineStart?.(
            win,
            payout
        );

        this.schedule(
            GameConfig.winPresentation
                .lineDuration,
            () => {
                this.playLine(
                    winningLines,
                    payouts,
                    index + 1,
                    options
                );
            }
        );
    }

    // =====================================================
    // SYMBOL HIGHLIGHT
    // =====================================================

    private highlightWinningSymbols(
        win: WinningLineResult
    ): void {
        for (
            const position of
            win.positions
        ) {
            const reel =
                this.reels[
                    position.reel
                ];

            reel?.highlightRow(
                position.row
            );
        }
    }

    // =====================================================
    // PAYLINE
    // =====================================================

    private drawPayline(
        win: WinningLineResult
    ): void {
        const points =
            win.positions.map(
                position => {
                    const reel =
                        this.reels[
                            position.reel
                        ];

                    return reel.getRowCenter(
                        position.row
                    );
                }
            );

        if (
            points.length < 2
        ) {
            return;
        }

        this.graphics.lineStyle(
            GameConfig.winPresentation
                .lineWidth,

            GameConfig.winPresentation
                .lineColor,

            1
        );

        this.graphics.beginPath();

        this.graphics.moveTo(
            points[0].x,
            points[0].y
        );

        for (
            let i = 1;
            i < points.length;
            i++
        ) {
            this.graphics.lineTo(
                points[i].x,
                points[i].y
            );
        }

        this.graphics.strokePath();
    }

    // =====================================================
    // FINISH
    // =====================================================

    private finish(
        options:
            WinPresentationOptions
    ): void {
        this.schedule(
            GameConfig.winPresentation
                .finalPauseDuration,
            () => {
                this.clearVisuals();

                this.isPlaying =
                    false;

                options.onComplete?.();
            }
        );
    }

    private schedule(
        delay: number,
        callback: () => void
    ): void {
        this.pendingTimer =
            this.scene.time.delayedCall(
                delay,
                () => {
                    this.pendingTimer =
                        undefined;

                    callback();
                }
            );
    }

    private cancelPendingTimer(): void {
        if (!this.pendingTimer) {
            return;
        }

        this.scene.time.removeEvent(
            this.pendingTimer
        );

        this.pendingTimer =
            undefined;
    }
}
