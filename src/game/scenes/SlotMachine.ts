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

import { SlotSession } from '../logic/SlotSession';

import { Reel } from '../objects/Reel';

import {
    WinPresentation,
} from '../presentation/WinPresentation';
import { SpinHistoryModal } from '../presentation/SpinHistoryModal';

export class SlotMachine extends Scene {
    private reels: Reel[] = [];

    private spinBtn?:
        GameObjects.Image;

    private autoSpinBtn?:
        GameObjects.Image;

    private turboBtn?:
        GameObjects.Image;

    private historyModal?: SpinHistoryModal;

    private historyOverlay?: GameObjects.Container;

    private winPresentation?:
        WinPresentation;

    private betDecreaseBtn?:
        GameObjects.Image;

    private betIncreaseBtn?:
        GameObjects.Image;

    private debugText?:
        GameObjects.Text;

    private resultText?:
        GameObjects.Text;

    private balanceValueText?:
        GameObjects.Text;

    private betValueText?:
        GameObjects.Text;

    /**
     * Saldo atual do jogador.
     */
    private readonly session = new SlotSession();

    /**
     * Controlador dos níveis de aposta.
     */

    /**
     * Impede alterações enquanto
     * os reels estão girando.
     */
    private isSpinning = false;

    /**
     * Mantém novas rodadas sendo iniciadas
     * ao final da rodada atual.
     */
    private isAutoSpinning = false;

    /**
     * Reduz a duração e o atraso de início
     * dos rodilhos nas próximas rodadas.
     */
    private isTurboMode = false;

    /**
     * Velocidade angular do botão Spin,
     * em graus por segundo.
     */
    private spinRotationSpeed =
        GameConfig.spinButtonAnimation.idleSpeed;

    /**
     * Rodadas mais recentes, da mais nova
     * para a mais antiga.
     */

    constructor() {
        super('SlotMachine');
    }

    create(): void {
        this.historyModal = new SpinHistoryModal(this);
        this.createBackground();

        this.createTitle();

        this.createReelBackdrop();

        this.createReels();

        this.createReelFrame();

        this.createControlsBackdrop();

        this.createControlsDetails();

        this.createDebugText();

        this.createResultText();

        this.createBalanceText();

        this.createBetText();

        this.createBetControls();

        this.createSpinButton();

        this.createAutoSpinButton();

        this.createTurboButton();

        this.createHistoryButton();

        this.updateBalanceUI();

        this.updateBetUI();

        this.updateBetButtons();

        this.createWinPresentation();
    }

    update(
        _time: number,
        delta: number
    ): void {
        if (!this.spinBtn) {
            return;
        }

        this.spinBtn.angle -=
            this.spinRotationSpeed *
            delta / 1000;
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

    private createControlsBackdrop(): void {
        const backdrop =
            GameConfig.layout.controlsBackdrop;

        this.add
            .image(
                backdrop.x,
                backdrop.y,
                'slotMachineControlsBackdrop'
            )
            .setDisplaySize(
                backdrop.width,
                backdrop.height
            );
    }

    private createControlsDetails(): void {
        const details =
            GameConfig.layout.controlsDetails;

        const oppositeDetails =
            GameConfig.layout
                .controlsDetailsOpposite;

        this.add
            .image(
                details.x,
                details.y,
                'slotMachineControlsDetails'
            )
            .setDisplaySize(
                details.width,
                details.height
            );

        this.add
            .image(
                oppositeDetails.x,
                oppositeDetails.y,
                'slotMachineControlsDetails'
            )
            .setDisplaySize(
                oppositeDetails.width,
                oppositeDetails.height
            )
            .setFlipX(true);
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
        const label =
            GameConfig.layout.balanceLabel;

        const value =
            GameConfig.layout.balanceValue;

        this.createLabel(
            label.x,
            label.y,
            'BALANCE:',
            {
                fontSize: label.fontSize,
                color: label.color,
            }
        );

        this.balanceValueText =
            this.createLabel(
                value.x,
                value.y,
                '',
                {
                    fontSize: value.fontSize,
                    color: value.color,
                }
            );
    }

    private createBetText(): void {
        const label =
            GameConfig.layout.betLabel;

        const value =
            GameConfig.layout.betValue;

        this.createLabel(
            label.x,
            label.y,
            'BET:',
            {
                fontSize: label.fontSize,
                color: label.color,
            }
        );

        this.betValueText =
            this.createLabel(
                value.x,
                value.y,
                '',
                {
                    fontSize: value.fontSize,
                    color: value.color,
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
            this.add.image(
                decrease.x,
                decrease.y,
                'slotMachineMinusButton'
            )
                .setDisplaySize(
                    decrease.width,
                    decrease.height
                )
                .setInteractive();

        this.betDecreaseBtn.on(
            'pointerdown',
            () => {
                this.decreaseBet();
            }
        );

        this.betIncreaseBtn =
            this.add.image(
                increase.x,
                increase.y,
                'slotMachinePlusButton'
            )
                .setDisplaySize(
                    increase.width,
                    increase.height
                )
                .setInteractive();

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

        this.session.betManager.increase();

        this.updateBetUI();

        this.updateBetButtons();
    }

    private decreaseBet(): void {
        if (this.isSpinning) {
            return;
        }

        this.session.betManager.decrease();

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
            this.add.image(
                button.x,
                button.y,
                'slotMachineSpinButton'
            )
                .setDisplaySize(
                    button.width,
                    button.height
                )
                .setInteractive();

        this.spinBtn.on(
            'pointerdown',
            () => {
                this.spin();
            }
        );

        this.startSpinIdleAnimation();
    }

    private startSpinIdleAnimation(): void {
        this.tweens.killTweensOf(this);

        this.spinRotationSpeed =
            GameConfig.spinButtonAnimation.idleSpeed;
    }

    private playSpinPressedAnimation(): void {
        const animation =
            GameConfig.spinButtonAnimation;

        this.tweens.killTweensOf(this);

        this.tweens.add({
            targets: this,
            spinRotationSpeed:
                animation.boostSpeed,
            duration: animation.boostDuration,
            ease: 'Sine.easeIn',
            onComplete: () => {
                this.returnToIdleSpinSpeed();
            },
        });
    }

    private returnToIdleSpinSpeed(): void {
        const animation =
            GameConfig.spinButtonAnimation;

        this.tweens.add({
            targets: this,
            spinRotationSpeed:
                animation.idleSpeed,
            duration: animation.returnDuration,
            ease: 'Sine.easeOut',
        });
    }

    private createAutoSpinButton(): void {
        const button =
            GameConfig.layout.autoSpinButton;

        this.autoSpinBtn =
            this.add.image(
                button.x,
                button.y,
                'slotMachineAutoSpinOnButton'
            )
                .setDisplaySize(
                    button.width,
                    button.height
                )
                .setInteractive();

        this.autoSpinBtn.on(
            'pointerdown',
            () => {
                this.toggleAutoSpin();
            }
        );
    }

    private toggleAutoSpin(): void {
        this.isAutoSpinning =
            !this.isAutoSpinning;

        this.updateAutoSpinButton();

        if (
            !this.isAutoSpinning &&
            !this.isSpinning
        ) {
            this.enableControls();

            return;
        }

        if (
            this.isAutoSpinning &&
            !this.isSpinning
        ) {
            this.spin();
        }
    }

    private updateAutoSpinButton(): void {
        if (!this.autoSpinBtn) {
            return;
        }

        this.autoSpinBtn.setTexture(
            this.isAutoSpinning
                ? 'slotMachineAutoSpinOffButton'
                : 'slotMachineAutoSpinOnButton'
        );
    }

    private createTurboButton(): void {
        const button =
            GameConfig.layout.turboButton;

        this.turboBtn =
            this.add.image(
                button.x,
                button.y,
                'slotMachineTurboOnButton'
            )
                .setDisplaySize(
                    button.width,
                    button.height
                )
                .setInteractive();

        this.turboBtn.on(
            'pointerdown',
            () => {
                this.toggleTurboMode();
            }
        );
    }

    private toggleTurboMode(): void {
        this.isTurboMode =
            !this.isTurboMode;

        this.updateTurboButton();
    }

    private updateTurboButton(): void {
        this.turboBtn?.setTexture(
            this.isTurboMode
                ? 'slotMachineTurboOffButton'
                : 'slotMachineTurboOnButton'
        );
    }

    private createHistoryButton(): void {
        const button =
            GameConfig.layout.historyButton;

        const historyButton =
            this.add.image(
                button.x,
                button.y,
                'slotMachineHistoryButton'
            )
                .setDisplaySize(
                    button.width,
                    button.height
                )
                .setInteractive();

        historyButton.on(
            'pointerdown',
            () => {
                this.openHistoryModal();
            }
        );
    }

    private openHistoryModal(): void {
        this.historyModal?.close();
        this.closeHistoryModal();

        const { width, height } =
            this.scale.gameSize;

        const modal =
            this.add.container(0, 0)
                .setDepth(20);

        const overlay =
            this.add.rectangle(
                width / 2,
                height / 2,
                width,
                height,
                0x000000,
                0.7
            ).setInteractive();

        const panel =
            this.add.rectangle(
                width / 2,
                height / 2,
                900,
                1080,
                0x24150e
            ).setStrokeStyle(
                4,
                0xd28b21
            );

        const title =
            this.createLabel(
                width / 2,
                500,
                'HISTÓRICO DE JOGADAS',
                {
                    fontSize: '36px',
                    color: GameConfig.colors.text,
                }
            );

        const entries =
            this.createHistoryEntriesText(
                width / 2 - 370,
                590
            );

        const closeButton =
            this.add.rectangle(
                width / 2,
                1440,
                240,
                70,
                GameConfig.colors.button
            ).setInteractive();

        const closeText =
            this.createLabel(
                width / 2,
                1440,
                'FECHAR',
                {
                    fontSize: '26px',
                    color: GameConfig.colors.buttonText,
                }
            );

        const close = (): void => {
            this.closeHistoryModal();
        };

        overlay.on('pointerdown', close);
        closeButton.on('pointerdown', close);

        modal.add([
            overlay,
            panel,
            title,
            entries,
            closeButton,
            closeText,
        ]);

        this.historyOverlay = modal;
    }

    private createHistoryEntriesText(
        x: number,
        y: number
    ): GameObjects.Text {
        const content =
            this.session.getHistory().length === 0
                ? 'NENHUMA JOGADA REALIZADA.'
                : this.session.getHistory().map(
                    (entry, index) => {
                        const result =
                            entry.winningLines > 0
                                ? `GANHO ${entry.payout.toFixed(2)}`
                                : 'SEM GANHO';

                        return `${index + 1}. APOSTA ${entry.bet.toFixed(2)} | ${result}`;
                    }
                ).join('\n\n');

        return this.add.text(
            x,
            y,
            content,
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: GameConfig.colors.text,
                lineSpacing: 6,
                wordWrap: {
                    width: 740,
                },
            }
        );
    }

    private closeHistoryModal(): void {
        this.historyOverlay?.destroy();

        this.historyOverlay = undefined;
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
            this.session.betManager.getCurrentBet();

        // -----------------------------------------
        // VALIDA SALDO
        // -----------------------------------------

        if (
            !this.session.canAffordCurrentBet()
        ) {
            if (this.isAutoSpinning) {
                this.isAutoSpinning = false;

                this.updateAutoSpinButton();
            }

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

        this.playSpinPressedAnimation();

        // -----------------------------------------
        // DESCONTA A APOSTA
        // -----------------------------------------

        this.session.placeBet();

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

        const reelStartDelay =
            this.getReelStartDelay();

        const reelSpinDuration =
            this.getReelSpinDuration();

        this.reels.forEach(
            (reel, index) => {
                this.time.delayedCall(
                    index *
                        reelStartDelay,

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
                            playResult.grid[index],
                            reelSpinDuration
                        );
                    }
                );
            }
        );
    }

    private getReelSpinDuration(): number {
        return this.isTurboMode
            ? GameConfig.turbo.spinDuration
            : GameConfig.reel.spinDuration;
    }

    private getReelStartDelay(): number {
        return this.isTurboMode
            ? GameConfig.turbo.reelStartDelay
            : GameConfig.reel.reelStartDelay;
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

        this.session.creditPayout(payout.totalPayout);

        this.updateBalanceUI();

        this.addSpinToHistory(playResult);

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

        if (!this.isAutoSpinning) {
            return;
        }

        this.time.delayedCall(
            250,
            () => {
                if (this.isAutoSpinning) {
                    this.spin();
                }
            }
        );
    }

    private addSpinToHistory(
        playResult: SpinResult
    ): void {
        this.session.addHistoryEntry({
            bet: playResult.bet,
            payout: playResult.payout.totalPayout,
            winningLines:
                playResult.winningLines.length,
        });

    }

    // =====================================================
    // CONTROLE DE INTERAÇÃO
    // =====================================================

    private disableControls(): void {
        this.setSpinButtonEnabled(false);

        this.setImageButtonEnabled(
            this.betDecreaseBtn,
            false
        );

        this.setImageButtonEnabled(
            this.betIncreaseBtn,
            false
        );
    }

    private enableControls(): void {
        this.setSpinButtonEnabled(
            !this.isAutoSpinning
        );

        this.updateBetButtons();
    }

    // =====================================================
    // UI
    // =====================================================

    private updateBalanceUI(): void {
        this.balanceValueText?.setText(
            this.session.getBalance().toFixed(
                2
            )
        );
    }

    private updateBetUI(): void {
        const currentBet =
            this.session.betManager.getCurrentBet();

        this.betValueText?.setText(
            currentBet.toFixed(2)
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

        this.setImageButtonEnabled(
            this.betDecreaseBtn,
            this.session.betManager.canDecrease()
        );

        this.setImageButtonEnabled(
            this.betIncreaseBtn,
            this.session.betManager.canIncrease()
        );
    }

    private setSpinButtonEnabled(
        enabled: boolean
    ): void {
        if (!this.spinBtn) {
            return;
        }

        if (enabled) {
            this.spinBtn
                .setInteractive()
                .setAlpha(1);

            return;
        }

        this.spinBtn
            .disableInteractive()
            .setAlpha(0.55);
    }

    private setImageButtonEnabled(
        button: GameObjects.Image | undefined,
        enabled: boolean
    ): void {
        if (!button) {
            return;
        }

        if (enabled) {
            button
                .setInteractive()
                .setAlpha(1);

            return;
        }

        button
            .disableInteractive()
            .setAlpha(0.45);
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
