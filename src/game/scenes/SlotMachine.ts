import {
    Scene,
    GameObjects,
} from 'phaser';

import { GameConfig } from '../config/GameConfig';

import {
    SlotCore,
} from '../logic/SlotCore';

import type {
    CornPlayResult,
} from '../logic/SlotCore';

import {
    BetManager,
} from '../logic/BetManager';

import { Reel } from '../objects/Reel';

import {
    WinPresentation,
} from '../presentation/WinPresentation';

export class SlotMachine extends Scene {
    private reels: Reel[] = [];

    private spinBtn?:
        GameObjects.Rectangle;

    private winPresentation?:
        WinPresentation;

    private betDecreaseBtn?:
        GameObjects.Rectangle;

    private betIncreaseBtn?:
        GameObjects.Rectangle;

    private debugText?:
        GameObjects.Text;

    private resultText?:
        GameObjects.Text;

    private balanceText?:
        GameObjects.Text;

    private betText?:
        GameObjects.Text;

    /**
     * Saldo atual do jogador.
     */
    private balance =
        GameConfig.bet.initialBalance;

    /**
     * Controlador dos níveis de aposta.
     */
    private readonly betManager =
        new BetManager(
            GameConfig.bet.values,
            GameConfig.bet.defaultBet
        );

    /**
     * Impede alterações enquanto
     * os reels estão girando.
     */
    private isSpinning = false;

    constructor() {
        super('SlotMachine');
    }

    create(): void {
        this.createBackground();

        this.createTitle();

        this.createReels();

        this.createDebugText();

        this.createResultText();

        this.createBalanceText();

        this.createBetText();

        this.createBetControls();

        this.createSpinButton();

        this.updateBalanceUI();

        this.updateBetUI();

        this.updateBetButtons();

        this.createWinPresentation();
    }

    // =====================================================
    // SCENE
    // =====================================================

    private createBackground(): void {
        this.cameras.main.setBackgroundColor(
            GameConfig.colors.background
        );
    }

    private createWinPresentation(): void {
    this.winPresentation =
        new WinPresentation(
            this,
            this.reels
        );
}

    private createTitle(): void {
        this.add.text(
            GameConfig.layout.title.x,
            GameConfig.layout.title.y,
            'Slot Machine MVP',
            {
                fontSize: '32px',

                color:
                    GameConfig.colors.text,
            }
        );
    }

    // =====================================================
    // REELS
    // =====================================================

    private createReels(): void {
        this.reels = [];

        GameConfig.layout.reelPositions.forEach(
            position => {
                this.reels.push(
                    new Reel(
                        this,
                        position.x,
                        position.y
                    )
                );
            }
        );
    }

    // =====================================================
    // TEXTOS
    // =====================================================

    private createDebugText(): void {
        this.debugText =
            this.add.text(
                GameConfig.layout.debug.x,
                GameConfig.layout.debug.y,
                '',
                {
                    fontSize: '16px',

                    color:
                        GameConfig.colors.text,

                    lineSpacing: 4,
                }
            );
    }

    private createResultText(): void {
        this.resultText =
            this.add.text(
                GameConfig.layout.result.x,
                GameConfig.layout.result.y,
                '',
                {
                    fontSize: '24px',

                    color:
                        GameConfig.colors.win,
                }
            );
    }

    private createBalanceText(): void {
        this.balanceText =
            this.add.text(
                GameConfig.layout.balance.x,
                GameConfig.layout.balance.y,
                '',
                {
                    fontSize: '22px',

                    color:
                        GameConfig.colors.balance,
                }
            );
    }

    private createBetText(): void {
        this.betText =
            this.add.text(
                GameConfig.layout.bet.x,
                GameConfig.layout.bet.y,
                '',
                {
                    fontSize: '22px',

                    color:
                        GameConfig.colors.bet,
                }
            );
    }

    // =====================================================
    // BET CONTROLS
    // =====================================================

    private createBetControls(): void {
        const decrease =
            GameConfig.layout.betDecreaseButton;

        const increase =
            GameConfig.layout.betIncreaseButton;

        // -----------------------------------------
        // BOTÃO -
        // -----------------------------------------

        this.betDecreaseBtn =
            this.add
                .rectangle(
                    decrease.x,
                    decrease.y,
                    decrease.width,
                    decrease.height,
                    GameConfig.colors.button
                )
                .setInteractive();

        this.add
            .text(
                decrease.x,
                decrease.y,
                '-',
                {
                    fontSize: '30px',

                    color:
                        GameConfig.colors.buttonText,
                }
            )
            .setOrigin(0.5);

        this.betDecreaseBtn.on(
            'pointerdown',
            () => {
                this.decreaseBet();
            }
        );

        // -----------------------------------------
        // BOTÃO +
        // -----------------------------------------

        this.betIncreaseBtn =
            this.add
                .rectangle(
                    increase.x,
                    increase.y,
                    increase.width,
                    increase.height,
                    GameConfig.colors.button
                )
                .setInteractive();

        this.add
            .text(
                increase.x,
                increase.y,
                '+',
                {
                    fontSize: '30px',

                    color:
                        GameConfig.colors.buttonText,
                }
            )
            .setOrigin(0.5);

        this.betIncreaseBtn.on(
            'pointerdown',
            () => {
                this.increaseBet();
            }
        );
    }

    private increaseBet(): void {
        if (this.isSpinning) {
            return;
        }

        this.betManager.increase();

        this.updateBetUI();

        this.updateBetButtons();
    }

    private decreaseBet(): void {
        if (this.isSpinning) {
            return;
        }

        this.betManager.decrease();

        this.updateBetUI();

        this.updateBetButtons();
    }

    // =====================================================
    // SPIN BUTTON
    // =====================================================

    private createSpinButton(): void {
        const button =
            GameConfig.layout.spinButton;

        this.spinBtn =
            this.add
                .rectangle(
                    button.x,
                    button.y,
                    button.width,
                    button.height,
                    GameConfig.colors.button
                )
                .setInteractive();

        this.add
            .text(
                button.x,
                button.y,
                'SPIN',
                {
                    fontSize: '28px',

                    color:
                        GameConfig.colors.buttonText,
                }
            )
            .setOrigin(0.5);

        this.spinBtn.on(
            'pointerdown',
            () => {
                this.spin();
            }
        );
    }

    // =====================================================
    // SPIN
    // =====================================================

    private spin(): void {
        if (this.isSpinning) {
            return;
        }

        this.winPresentation
            ?.clearVisuals();

        const currentBet =
            this.betManager.getCurrentBet();

        // -----------------------------------------
        // VALIDA SALDO
        // -----------------------------------------

        if (
            this.balance <
            currentBet
        ) {
            this.showError(
                'INSUFFICIENT BALANCE'
            );

            return;
        }

        // -----------------------------------------
        // INICIA SPIN
        // -----------------------------------------

        this.isSpinning = true;

        this.disableControls();

        // -----------------------------------------
        // DESCONTA A APOSTA
        // -----------------------------------------

        this.balance -=
            currentBet;

        this.updateBalanceUI();

        // -----------------------------------------
        // GERA O RESULTADO
        // -----------------------------------------

        const playResult =
            SlotCore.play(currentBet);

        // -----------------------------------------
        // DEBUG
        // -----------------------------------------

        this.updateDebug(
            playResult.grid
        );

        this.resultText?.setText(
            'SPINNING...'
        );

        // -----------------------------------------
        // REELS
        // -----------------------------------------

        let stoppedReels = 0;

        this.reels.forEach(
            (reel, index) => {
                this.time.delayedCall(
                    index *
                        GameConfig.reel.reelStartDelay,

                    () => {
                        reel.setOnComplete(
                            () => {
                                stoppedReels++;

                                if (
                                    stoppedReels ===
                                    this.reels.length
                                ) {
                                    this.finishSpin(
                                        playResult
                                    );
                                }
                            }
                        );

                        reel.startSpin(
                            playResult.grid[index]
                        );
                    }
                );
            }
        );
    }

    // =====================================================
    // FINAL DO SPIN
    // =====================================================

    private finishSpin(
        playResult: CornPlayResult
    ): void {
        const {
            winningLines,
            payout,
        } = playResult;

        // ==========================================
        // CREDITA PRÊMIO
        // ==========================================

        this.balance +=
            payout.totalPayout;

        this.updateBalanceUI();

        // ==========================================
        // NO WIN
        // ==========================================

        if (
            winningLines.length === 0
        ) {
            this.resultText?.setText(
                'NO WIN'
            );

            console.log(
                'No winning lines.'
            );

            this.finishSpinInteraction();

            return;
        }

        // ==========================================
        // WIN
        // ==========================================

        console.log(
            'Winning lines:',
            winningLines
        );

        console.log(
            'Payout details:',
            payout
        );

        console.log(
            'Bet used:',
            playResult.bet
        );

        console.log(
            'Final balance:',
            this.balance
        );

        // ==========================================
        // APRESENTAÇÃO VISUAL
        // ==========================================

        this.winPresentation?.play(
            winningLines,

            payout.wins,

            {
                onLineStart:
                    (
                        win,
                        linePayout
                    ) => {
                        const payoutValue =
                            linePayout?.payout ??
                            0;

                        this.resultText?.setText(
                            `LINE ${win.lineId} | ${win.symbolId} | WIN ${payoutValue.toFixed(
                                2
                            )}`
                        );
                    },

                onComplete:
                    () => {
                        this.resultText?.setText(
                            `TOTAL WIN: ${payout.totalPayout.toFixed(
                                2
                            )}`
                        );

                        this.finishSpinInteraction();
                    },
            }
        );
    }

    private finishSpinInteraction(): void {
        this.isSpinning = false;

        this.enableControls();
    }

    // =====================================================
    // CONTROLE DE INTERAÇÃO
    // =====================================================

    private disableControls(): void {
        this.spinBtn
            ?.disableInteractive();

        this.betDecreaseBtn
            ?.disableInteractive();

        this.betIncreaseBtn
            ?.disableInteractive();

        this.spinBtn?.setFillStyle(
            GameConfig.colors.disabledButton
        );

        this.betDecreaseBtn?.setFillStyle(
            GameConfig.colors.disabledButton
        );

        this.betIncreaseBtn?.setFillStyle(
            GameConfig.colors.disabledButton
        );
    }

    private enableControls(): void {
        this.spinBtn
            ?.setInteractive();

        this.spinBtn?.setFillStyle(
            GameConfig.colors.button
        );

        this.updateBetButtons();
    }

    // =====================================================
    // UI
    // =====================================================

    private updateBalanceUI(): void {
        this.balanceText?.setText(
            `BALANCE: ${this.balance.toFixed(
                2
            )}`
        );
    }

    private updateBetUI(): void {
        const currentBet =
            this.betManager.getCurrentBet();

        this.betText?.setText(
            `BET: ${currentBet.toFixed(2)}`
        );
    }

    /**
     * Também oferece feedback visual quando
     * chegamos ao mínimo/máximo.
     */
    private updateBetButtons(): void {
        if (this.isSpinning) {
            return;
        }

        // -----------------------------------------
        // -
        // -----------------------------------------

        if (
            this.betManager.canDecrease()
        ) {
            this.betDecreaseBtn
                ?.setInteractive();

            this.betDecreaseBtn
                ?.setFillStyle(
                    GameConfig.colors.button
                );
        } else {
            this.betDecreaseBtn
                ?.disableInteractive();

            this.betDecreaseBtn
                ?.setFillStyle(
                    GameConfig.colors.disabledButton
                );
        }

        // -----------------------------------------
        // +
        // -----------------------------------------

        if (
            this.betManager.canIncrease()
        ) {
            this.betIncreaseBtn
                ?.setInteractive();

            this.betIncreaseBtn
                ?.setFillStyle(
                    GameConfig.colors.button
                );
        } else {
            this.betIncreaseBtn
                ?.disableInteractive();

            this.betIncreaseBtn
                ?.setFillStyle(
                    GameConfig.colors.disabledButton
                );
        }
    }

    private showError(
        message: string
    ): void {
        this.resultText?.setText(
            message
        );

        console.warn(message);
    }

    // =====================================================
    // DEBUG
    // =====================================================

    private updateDebug(
        result: string[][]
    ): void {
        if (!this.debugText) {
            return;
        }

        const lines: string[] = [
            'UPCOMING RESULT',
            '',
        ];

        result.forEach(
            (column, reelIndex) => {
                lines.push(
                    `REEL ${reelIndex + 1}`
                );

                column.forEach(
                    symbol => {
                        lines.push(
                            `[${symbol}]`
                        );
                    }
                );

                lines.push('');
            }
        );

        this.debugText.setText(
            lines.join('\n')
        );
    }
}
