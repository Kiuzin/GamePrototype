import {
    Scene,
    GameObjects,
} from 'phaser';

import { GameConfig } from '../config/GameConfig';
import { FeatureConfig } from '../config/FeatureConfig';

import {
    SlotCore,
} from '../logic/SlotCore';

import { PayoutCalculator } from '../logic/PayoutCalculator';

import type {
    SpinResult,
} from '../logic/SlotCore';

import { SlotSession } from '../logic/SlotSession';

import {
    LuckyCornFeature,
} from '../logic/LuckyCornFeature';

import type {
    LuckyCornLockedGrid,
    LuckyCornRound,
} from '../logic/LuckyCornFeature';

import { Reel } from '../objects/Reel';

import {
    WinPresentation,
} from '../presentation/WinPresentation';
import { SpinHistoryModal } from '../presentation/SpinHistoryModal';
import { LuckyCornFeedback } from '../presentation/LuckyCornFeedback';
import { HorseRacePresentation } from '../presentation/HorseRacePresentation';
import { HorseRaceFeature } from '../logic/HorseRaceFeature';
import type { HorseRaceResult } from '../logic/HorseRaceFeature';
import { TreasureChestFeature } from '../logic/TreasureChestFeature';
import type { TreasureChestRound } from '../logic/TreasureChestFeature';
import { TreasureChestPresentation } from '../presentation/TreasureChestPresentation';
import { CardDoubleFeature } from '../logic/CardDoubleFeature';
import type { CardDoubleRound, CardGuess } from '../logic/CardDoubleFeature';
import { CardDoublePresentation } from '../presentation/CardDoublePresentation';
import { WheelBonusFeature } from '../logic/WheelBonusFeature';
import type { WheelBonusRound } from '../logic/WheelBonusFeature';
import { WheelBonusPresentation } from '../presentation/WheelBonusPresentation';

export class SlotMachine extends Scene {
    private reels: Reel[] = [];

    private spinBtn?:
        GameObjects.Image;

    private autoSpinBtn?:
        GameObjects.Image;

    private turboBtn?:
        GameObjects.Image;

    private historyBtn?:
        GameObjects.Image;

    private historyModal?: SpinHistoryModal;

    private winPresentation?:
        WinPresentation;

    private luckyCornFeedback?:
        LuckyCornFeedback;

    private horseRacePresentation?: HorseRacePresentation;

    private treasureChestPresentation?: TreasureChestPresentation;

    private cardDoublePresentation?: CardDoublePresentation;

    private wheelBonusPresentation?: WheelBonusPresentation;

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
     * Estado isolado da funcionalidade Milho da Sorte.
     */
    private readonly luckyCornFeature =
        new LuckyCornFeature({
            reels: GameConfig.reels,
            rows: GameConfig.rows,
        });

    private readonly horseRaceFeature =
        new HorseRaceFeature();

    private readonly treasureChestFeature =
        new TreasureChestFeature();

    private readonly cardDoubleFeature =
        new CardDoubleFeature();

    private readonly wheelBonusFeature =
        new WheelBonusFeature();

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

        this.createLuckyCornFeedback();
        this.horseRacePresentation = new HorseRacePresentation(this);
        this.treasureChestPresentation = new TreasureChestPresentation(this);
        this.cardDoublePresentation = new CardDoublePresentation(this);
        this.wheelBonusPresentation = new WheelBonusPresentation(this);
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

    private createLuckyCornFeedback(): void {
        this.luckyCornFeedback =
            new LuckyCornFeedback(this);
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

        this.historyBtn =
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

        this.historyBtn.on(
            'pointerdown',
            () => {
                this.openHistoryModal();
            }
        );
    }

    private openHistoryModal(): void {
        this.historyModal?.open(
            this.session.getHistory()
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

        this.luckyCornFeedback?.clear();
        this.horseRacePresentation?.clear();
        this.treasureChestPresentation?.clear();
        this.cardDoublePresentation?.clear();
        this.wheelBonusPresentation?.clear();

        this.clearReelLocks();

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

        const luckyCornActivation =
            this.luckyCornFeature.tryStart();

        const playResult =
            SlotCore.play(currentBet);

        // A corrida é um bônus de continuação: só pode ser sorteada
        // quando a rodada base já gerou algum ganho.
        const horseRaceActivation =
            luckyCornActivation ||
            playResult.payout.totalPayout <= 0
                ? false
                : this.horseRaceFeature.tryStart();

        // Apenas um bônus de continuação pode ocorrer por rodada. A corrida
        // possui prioridade quando ambas as funcionalidades estiverem ativas.
        const treasureChestActivation =
            luckyCornActivation ||
            horseRaceActivation ||
            playResult.payout.totalPayout <= 0
                ? false
                : this.treasureChestFeature.tryStart();

        // A Dobra de Cartas trabalha sobre o prêmio já pago pela rodada-base.
        // Ela é exclusiva para que o jogador saiba exatamente o que está em risco.
        const cardDoubleActivation =
            luckyCornActivation ||
            horseRaceActivation ||
            treasureChestActivation ||
            playResult.payout.totalPayout <= 0
                ? false
                : this.cardDoubleFeature.tryStart();

        // A roleta também estende o prêmio-base e permanece exclusiva dos
        // demais bônus de continuação para manter o saldo previsível.
        const wheelBonusActivation =
            luckyCornActivation ||
            horseRaceActivation ||
            treasureChestActivation ||
            cardDoubleActivation ||
            playResult.payout.totalPayout <= 0
                ? false
                : this.wheelBonusFeature.tryStart();

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
            this.getReelSpinDuration() +
            (
                luckyCornActivation
                    ? FeatureConfig.luckyCorn
                        .extraSpinDuration
                    : 0
            );

        if (luckyCornActivation) {
            this.scheduleLuckyCornSuspense();
        }

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
                                    if (
                                        luckyCornActivation
                                    ) {
                                        this.startLuckyCornFeature(
                                            currentBet,
                                            luckyCornActivation.selectedSymbolId,
                                            playResult.winningLines.length
                                        );

                                        return;
                                    }

                                    if (horseRaceActivation) {
                                        this.finishSpin(
                                            playResult,
                                            0,
                                            () => {
                                                this.startHorseRace(
                                                    playResult.payout
                                                        .totalPayout
                                                );
                                            }
                                        );
                                        return;
                                    }

                                    if (treasureChestActivation) {
                                        this.finishSpin(
                                            playResult,
                                            0,
                                            () => {
                                                this.startTreasureChest(
                                                    playResult.payout
                                                        .totalPayout
                                                );
                                            }
                                        );
                                        return;
                                    }

                                    if (cardDoubleActivation) {
                                        this.finishSpin(
                                            playResult,
                                            0,
                                            () => {
                                                this.startCardDouble(
                                                    playResult.payout
                                                        .totalPayout
                                                );
                                            }
                                        );
                                        return;
                                    }

                                    if (wheelBonusActivation) {
                                        this.finishSpin(
                                            playResult,
                                            0,
                                            () => {
                                                this.startWheelBonus(
                                                    playResult.payout
                                                        .totalPayout
                                                );
                                            }
                                        );
                                        return;
                                    }

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
    // CORRIDA DE TRATORES
    // =====================================================

    private startHorseRace(basePayout: number): void {
        const presentation = this.horseRacePresentation;
        if (!presentation) {
            this.horseRaceFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        presentation.showSelection(this.horseRaceFeature.getRunners(), selectedRunnerId => {
            const result = this.horseRaceFeature.run(selectedRunnerId);
            presentation.playRace(result, FeatureConfig.horseRace.segmentDuration, () => {
                this.completeHorseRace(basePayout, result);
            });
        });
    }

    private completeHorseRace(basePayout: number, result: HorseRaceResult): void {
        const payout = this.horseRaceFeature.getPayout(basePayout, result.selectedRank);
        this.horseRaceFeature.finish();
        const finish = (): void => {
            this.session.creditPayout(payout);
            this.session.addPayoutToLatestHistory(payout);
            this.updateBalanceUI();
            this.finishSpinInteraction();
        };

        if (!this.horseRacePresentation) {
            finish();
            return;
        }

        this.horseRacePresentation.showResult(result, payout, finish);
    }

    // =====================================================
    // BAÚS DO TESOURO
    // =====================================================

    private startTreasureChest(basePayout: number): void {
        const presentation = this.treasureChestPresentation;
        if (!presentation) {
            this.treasureChestFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        this.showTreasureChestRound(
            basePayout,
            this.treasureChestFeature.start()
        );
    }

    private showTreasureChestRound(basePayout: number, round: TreasureChestRound): void {
        const presentation = this.treasureChestPresentation;
        if (!presentation) {
            this.treasureChestFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        presentation.show(
            round,
            basePayout,
            chestId => {
                const updatedRound = this.treasureChestFeature.select(chestId);
                if (updatedRound.isFinished) {
                    this.completeTreasureChest(basePayout, updatedRound);
                    return;
                }

                this.showTreasureChestRound(basePayout, updatedRound);
            }
        );
    }

    private completeTreasureChest(basePayout: number, round: TreasureChestRound): void {
        const extraPayout = this.treasureChestFeature.getExtraPayout(basePayout);
        const finish = (): void => {
            this.treasureChestFeature.finish();
            this.session.creditPayout(extraPayout);
            this.session.addPayoutToLatestHistory(extraPayout);
            this.updateBalanceUI();
            this.finishSpinInteraction();
        };

        if (!this.treasureChestPresentation) {
            finish();
            return;
        }

        this.treasureChestPresentation.showFinal(round, basePayout, finish);
    }

    // =====================================================
    // DOBRA DE CARTAS
    // =====================================================

    private startCardDouble(basePayout: number): void {
        if (!this.cardDoublePresentation) {
            this.cardDoubleFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        this.showCardDoubleRound(
            basePayout,
            this.cardDoubleFeature.start(basePayout)
        );
    }

    private showCardDoubleRound(
        basePayout: number,
        round: CardDoubleRound
    ): void {
        const presentation = this.cardDoublePresentation;

        if (!presentation) {
            this.cardDoubleFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        presentation.showRound(
            round,
            (guess: CardGuess) => {
                this.showCardDoubleRound(
                    basePayout,
                    this.cardDoubleFeature.guess(guess)
                );
            },
            () => {
                this.showCardDoubleRound(
                    basePayout,
                    this.cardDoubleFeature.continue()
                );
            },
            () => this.cashOutCardDouble(basePayout),
            () => this.loseCardDouble(basePayout)
        );
    }

    private cashOutCardDouble(basePayout: number): void {
        const totalPayout = this.cardDoubleFeature.getCurrentPayout();
        const extraPayout = totalPayout - basePayout;
        const finish = (): void => {
            this.cardDoubleFeature.finish();
            this.cardDoublePresentation?.clear();
            this.session.creditPayout(extraPayout);
            this.session.addPayoutToLatestHistory(extraPayout);
            this.updateBalanceUI();
            this.finishSpinInteraction();
        };

        if (extraPayout <= 0 || !this.cardDoublePresentation) {
            finish();
            return;
        }

        this.cardDoublePresentation.showFinal(
            basePayout,
            totalPayout,
            finish
        );
    }

    private loseCardDouble(basePayout: number): void {
        this.cardDoubleFeature.finish();
        this.cardDoublePresentation?.clear();
        this.session.creditPayout(-basePayout);
        this.session.addPayoutToLatestHistory(-basePayout);
        this.updateBalanceUI();
        this.finishSpinInteraction();
    }

    // =====================================================
    // ROLETA DA COLHEITA
    // =====================================================

    private startWheelBonus(basePayout: number): void {
        const presentation = this.wheelBonusPresentation;
        if (!presentation) {
            this.wheelBonusFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        presentation.resetWheelPosition();
        this.showWheelBonusRound(this.wheelBonusFeature.start(basePayout));
    }

    private showWheelBonusRound(round: WheelBonusRound): void {
        const presentation = this.wheelBonusPresentation;
        if (!presentation) {
            this.wheelBonusFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        presentation.showRound(
            round,
            () => this.wheelBonusFeature.spin(),
            () => this.wheelBonusFeature.skip(),
            completedRound => this.completeWheelBonus(completedRound)
        );
    }

    private completeWheelBonus(round: WheelBonusRound): void {
        const extraPayout = this.wheelBonusFeature.getExtraPayout();
        this.wheelBonusFeature.finish();
        this.wheelBonusPresentation?.clear();
        this.session.creditPayout(extraPayout);
        this.session.addPayoutToLatestHistory(extraPayout);
        this.updateBalanceUI();
        this.resultText?.setText(
            round.accumulatedPayout <= 0
                ? 'ROLETA: PRÊMIO PERDIDO'
                : `ROLETA: PRÊMIO ${round.accumulatedPayout.toFixed(2)}`
        );
        this.finishSpinInteraction();
    }

    // =====================================================
    // MILHO DA SORTE
    // =====================================================

    private scheduleLuckyCornSuspense(): void {
        this.time.delayedCall(
            FeatureConfig.luckyCorn
                .suspenseStartDelay,
            () => {
                if (
                    !this.isSpinning ||
                    !this.luckyCornFeature.isActive()
                ) {
                    return;
                }

                this.luckyCornFeedback?.showSuspense();

                this.resultText?.setText(
                    'O MILHO DA SORTE ESTÁ CHEGANDO...'
                );
            }
        );
    }

    private startLuckyCornFeature(
        currentBet: number,
        selectedSymbolId: string,
        baseWinningLineCount: number
    ): void {
        this.resultText?.setText(
            'MILHO DA SORTE!'
        );

        const startRound = (): void => {
            this.playLuckyCornRound(
                currentBet,
                baseWinningLineCount
            );
        };

        if (!this.luckyCornFeedback) {
            startRound();

            return;
        }

        this.luckyCornFeedback.showStart(
            selectedSymbolId,
            FeatureConfig.luckyCorn
                .startDisplayDuration,
            startRound
        );
    }

    private playLuckyCornRound(
        currentBet: number,
        baseWinningLineCount: number
    ): void {
        const round =
            this.luckyCornFeature.playRound();

        this.updateDebug(round.grid);

        this.resultText?.setText(
            'MILHO DA SORTE'
        );

        this.spinLuckyCornReels(
            round,
            () => {
                this.completeLuckyCornRound(
                    currentBet,
                    round,
                    baseWinningLineCount
                );
            }
        );
    }

    private spinLuckyCornReels(
        round: LuckyCornRound,
        onComplete: () => void
    ): void {
        let stoppedReels = 0;

        const featureSpinSymbols =
            this.luckyCornFeature.getSpinSymbols();

        this.reels.forEach(
            (reel, index) => {
                reel.setLockedRows(
                    round.lockedGridBeforeSpin[index]
                );

                this.time.delayedCall(
                    index *
                        GameConfig.reel
                            .reelStartDelay,
                    () => {
                        reel.setOnComplete(
                            () => {
                                stoppedReels++;

                                if (
                                    stoppedReels ===
                                    this.reels.length
                                ) {
                                    onComplete();
                                }
                            }
                        );

                        reel.startSpin(
                            round.grid[index],
                            GameConfig.reel
                                .spinDuration,
                            featureSpinSymbols
                        );
                    }
                );
            }
        );
    }

    private completeLuckyCornRound(
        currentBet: number,
        round: LuckyCornRound,
        baseWinningLineCount: number
    ): void {
        this.applyLuckyCornLocks(
            round.lockedGrid
        );

        if (round.shouldRespin) {
            const playNextRound = (): void => {
                this.playLuckyCornRound(
                    currentBet,
                    baseWinningLineCount
                );
            };

            this.time.delayedCall(
                FeatureConfig.luckyCorn
                    .respinDelay,
                playNextRound
            );

            return;
        }

        const playResult =
            SlotCore.resolve(
                currentBet,
                round.grid
            );

        const payoutMultiplier =
            this.luckyCornFeature.calculatePayoutMultiplier(
                baseWinningLineCount
            );

        const multipliedPlayResult = {
            ...playResult,
            payout: PayoutCalculator.applyMultiplier(
                playResult.payout,
                payoutMultiplier
            ),
        };

        this.luckyCornFeature.finish();

        this.clearReelLocks();

        const finishFeature = (): void => {
            this.finishSpin(multipliedPlayResult);
        };

        // Sem prêmio, a funcionalidade retorna diretamente ao fluxo
        // normal e não exibe a apresentação de Jackpot.
        if (
            multipliedPlayResult.payout.totalPayout <= 0 ||
            !this.luckyCornFeedback
        ) {
            this.luckyCornFeedback?.clear();

            finishFeature();

            return;
        }

        this.luckyCornFeedback.showFinalPayout(
            multipliedPlayResult.payout.totalPayout,
            payoutMultiplier,
            FeatureConfig.luckyCorn
                .finalDisplayDuration,
            FeatureConfig.luckyCorn
                .finalDisplayPause,
            finishFeature
        );
    }

    private applyLuckyCornLocks(
        lockedGrid: LuckyCornLockedGrid
    ): void {
        this.reels.forEach(
            (reel, reelIndex) => {
                reel.setLockedRows(
                    lockedGrid[reelIndex]
                );
            }
        );
    }

    private clearReelLocks(): void {
        this.reels.forEach(
            reel => {
                reel.clearLockedRows();
            }
        );
    }

    // =====================================================
    // FINAL DO SPIN
    // =====================================================

    private finishSpin(
        playResult: SpinResult,
        bonusPayout = 0,
        onComplete?: () => void
    ): void {
        const {
            winningLines,
            payout,
        } = playResult;

        // ==========================================
        // CREDITA PRÊMIO
        // ==========================================

        this.session.creditPayout(payout.totalPayout + bonusPayout);

        this.updateBalanceUI();

        this.addSpinToHistory(playResult, bonusPayout);

        // ==========================================
        // NO WIN
        // ==========================================

        if (
            winningLines.length === 0
        ) {
            this.resultText?.setText(
                'NO WIN'
            );

            this.completeSpin(onComplete);

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

                        this.completeSpin(onComplete);
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

    private completeSpin(onComplete?: () => void): void {
        if (onComplete) {
            onComplete();
            return;
        }

        this.finishSpinInteraction();
    }

    private addSpinToHistory(
        playResult: SpinResult,
        bonusPayout = 0
    ): void {
        this.session.addHistoryEntry({
            bet: playResult.bet,
            payout: playResult.payout.totalPayout + bonusPayout,
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

        this.setImageButtonEnabled(
            this.autoSpinBtn,
            false
        );

        this.setImageButtonEnabled(
            this.turboBtn,
            false
        );

        this.setImageButtonEnabled(
            this.historyBtn,
            false
        );
    }

    private enableControls(): void {
        this.setSpinButtonEnabled(
            !this.isAutoSpinning
        );

        this.updateBetButtons();

        this.setImageButtonEnabled(
            this.autoSpinBtn,
            true
        );

        this.setImageButtonEnabled(
            this.turboBtn,
            true
        );

        this.setImageButtonEnabled(
            this.historyBtn,
            true
        );
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
