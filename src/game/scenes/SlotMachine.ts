import {
    Scene,
    GameObjects,
} from 'phaser';

import { GameConfig } from '../config/GameConfig';

import {
    SlotCore,
} from '../logic/SlotCore';

import type {
    SpinResult,
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

        this.createReelBackdrop();

        this.createReels();

        this.createReelFrame();

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

        const { width, height } =
            this.scale.gameSize;

        const background =
            this.add.image(
                width / 2,
                height / 2,
                'slotMachineBackground'
            );

        const scale = Math.max(
            width / background.width,
            height / background.height
        );

        background.setScale(scale);
    }

    private createWinPresentation(): void {
        this.winPresentation =
            new WinPresentation(
                this,
                this.reels
            );
    }

    private createTitle(): void {
        this.createLabel(
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

    private createLabel(
        x: number,
        y: number,
        text: string,
        style: Phaser.Types.GameObjects.Text.TextStyle = {}
    ): GameObjects.Text {
        return this.add.text(
            x,
            y,
            text,
            {
                fontFamily: 'Arial',
                ...style,
            }
        ).setOrigin(0.5);
    }

    private createActionButton(
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        fillColor: number,
        textColor: string,
        onPointerDown: () => void
    ): GameObjects.Rectangle {
        const button = this.add.rectangle(
            x,
            y,
            width,
            height,
            fillColor
        ).setInteractive();

        this.add.text(
            x,
            y,
            label,
            {
                fontSize: '30px',
                color: textColor,
                fontFamily: 'Arial',
            }
        ).setOrigin(0.5);

        button.on(
            'pointerdown',
            onPointerDown
        );

        return button;
    }

    // =====================================================
    // REELS
    // =====================================================

    private createReelBackdrop(): void {
        const backdrop =
            GameConfig.layout.reelBackdrop;

        const left =
            backdrop.x -
            backdrop.width / 2;

        const top =
            backdrop.y -
            backdrop.height / 2;

        const graphics =
            this.add.graphics();

        graphics.fillStyle(
            backdrop.color
        );

        graphics.fillRoundedRect(
            left,
            top,
            backdrop.width,
            backdrop.height,
            backdrop.cornerRadius
        );

        graphics.lineStyle(
            3,
            backdrop.grainColor,
            0.7
        );

        for (
            let y =
                top + backdrop.grainSpacing;
            y <
            top +
                backdrop.height -
                backdrop.grainSpacing;
            y += backdrop.grainSpacing
        ) {
            graphics.lineBetween(
                left + backdrop.cornerRadius,
                y,
                left +
                    backdrop.width -
                    backdrop.cornerRadius,
                y
            );
        }
    }

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

    private createReelFrame(): void {
        const frame =
            GameConfig.layout.reelFrame;

        this.add
            .image(
                frame.x,
                frame.y,
                'slotMachineFrame'
            )
            .setDisplaySize(
                frame.width,
                frame.height
            )
            .setDepth(1);
    }

    // =====================================================
    // TEXTOS
    // =====================================================

    private createDebugText(): void {
        this.debugText =
            this.createLabel(
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
            this.createLabel(
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
            this.createLabel(
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
            this.createLabel(
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

        this.betDecreaseBtn =
            this.createActionButton(
                decrease.x,
                decrease.y,
                decrease.width,
                decrease.height,
                '-',
                GameConfig.colors.button,
                GameConfig.colors.buttonText,
                () => {
                    this.decreaseBet();
                }
            );

        this.betIncreaseBtn =
            this.createActionButton(
                increase.x,
                increase.y,
                increase.width,
                increase.height,
                '+',
                GameConfig.colors.button,
                GameConfig.colors.buttonText,
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
            this.createActionButton(
                button.x,
                button.y,
                button.width,
                button.height,
                'SPIN',
                GameConfig.colors.button,
                GameConfig.colors.buttonText,
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

        this.winPresentation?.stop();

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
        playResult: SpinResult
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

            this.finishSpinInteraction();

            return;
        }

        // ==========================================
        // WIN
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
        this.setButtonEnabled(
            this.spinBtn,
            false
        );

        this.setButtonEnabled(
            this.betDecreaseBtn,
            false
        );

        this.setButtonEnabled(
            this.betIncreaseBtn,
            false
        );
    }

    private enableControls(): void {
        this.setButtonEnabled(
            this.spinBtn,
            true
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

        this.setButtonEnabled(
            this.betDecreaseBtn,
            this.betManager.canDecrease()
        );

        this.setButtonEnabled(
            this.betIncreaseBtn,
            this.betManager.canIncrease()
        );
    }

    private setButtonEnabled(
        button: GameObjects.Rectangle | undefined,
        enabled: boolean
    ): void {
        if (!button) {
            return;
        }

        if (enabled) {
            button
                .setInteractive()
                .setFillStyle(
                    GameConfig.colors.button
                );

            return;
        }

        button
            .disableInteractive()
            .setFillStyle(
                GameConfig.colors.disabledButton
            );
    }

    private showError(
        message: string
    ): void {
        this.resultText?.setText(
            message
        );
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
