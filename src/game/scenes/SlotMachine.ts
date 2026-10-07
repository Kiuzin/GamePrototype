import {
    Scene,
    GameObjects,
} from 'phaser';

import { GameConfig } from '../config/GameConfig';
import { FeatureConfig } from '../config/FeatureConfig';
import { SecurityConfig } from '../config/SecurityConfig';

import {
    SlotCore,
} from '../logic/SlotCore';

import type {
    SpinResult,
} from '../logic/SlotCore';

import { SlotSession } from '../logic/SlotSession';

import {
    LuckyCornFeature,
} from '../logic/LuckyCornFeature';

import { Reel } from '../objects/Reel';

import {
    WinPresentation,
} from '../presentation/WinPresentation';
import { WinPayoutFeedback } from '../presentation/WinPayoutFeedback';
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
import { SlotHud } from '../presentation/SlotHud';
import { RulesModal } from '../presentation/RulesModal';
import { WalletModal } from '../presentation/WalletModal';
import type { BonusFeatureLifecycle } from '../logic/BonusFeatureLifecycle';
import { Money } from '../logic/Money';
import { FeatureRegistry } from '../logic/FeatureRegistry';
import { RoundStateMachine } from '../logic/RoundStateMachine';
import { createRoundSeed, createSeededRandom } from '../logic/SeededRandom';
import { LuckyCornFeatureFlow } from '../logic/LuckyCornFeatureFlow';

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

    private rulesModal?: RulesModal;

    private walletModal?: WalletModal;

    private winPresentation?:
        WinPresentation;

    private winPayoutFeedback?:
        WinPayoutFeedback;

    private luckyCornFeedback?:
        LuckyCornFeedback;

    private luckyCornFlow?: LuckyCornFeatureFlow;

    private horseRacePresentation?: HorseRacePresentation;

    private treasureChestPresentation?: TreasureChestPresentation;

    private cardDoublePresentation?: CardDoublePresentation;

    private wheelBonusPresentation?: WheelBonusPresentation;

    private betDecreaseBtn?:
        GameObjects.Image;

    private betIncreaseBtn?:
        GameObjects.Image;

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

    private readonly featureRegistry = new FeatureRegistry([
        ['luckyCorn', this.luckyCornFeature],
        ['horseRace', this.horseRaceFeature],
        ['treasureChest', this.treasureChestFeature],
        ['cardDouble', this.cardDoubleFeature],
        ['wheelBonus', this.wheelBonusFeature],
    ]);

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

    private readonly roundState = new RoundStateMachine();

    private roundId = 0;

    private roundPayout = 0;

    private roundWinningLines = 0;

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
        this.events.once('shutdown', () => this.featureRegistry.finishAll());
        this.historyModal = new SpinHistoryModal(this);
        this.rulesModal = new RulesModal(this);
        this.walletModal = new WalletModal(this, {
            getBalance: () => this.session.getBalance(),
            deposit: amount => {
                if (!SecurityConfig.allowLocalWalletMutations) {
                    return false;
                }

                this.session.adjustBalance(amount);
                this.updateBalanceUI();

                return true;
            },
            withdraw: amount => {
                if (!SecurityConfig.allowLocalWalletMutations) {
                    return false;
                }

                const succeeded = this.session.withdraw(amount);
                this.updateBalanceUI();

                return succeeded;
            },
        });
        this.createBackground();

        this.createTopHud();

        this.createReelBackdrop();

        this.createReels();

        this.createReelFrame();

        this.createControlsBackdrop();

        this.createControlsDetails();

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
        this.luckyCornFlow = new LuckyCornFeatureFlow({
            scene: this,
            reels: this.reels,
            feature: this.luckyCornFeature,
            feedback: this.luckyCornFeedback,
            isSpinActive: () => this.isSpinning,
            setResultText: text => this.resultText?.setText(text),
            finishSpin: result => this.finishSpin(result),
        });
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

        this.spinBtn.angle +=
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

        this.winPayoutFeedback =
            new WinPayoutFeedback(this);
    }

    private createLuckyCornFeedback(): void {
        this.luckyCornFeedback =
            new LuckyCornFeedback(this);
    }

    private createTopHud(): void {
        new SlotHud(this, {
            onMusicToggle: () => undefined,
            onSoundToggle: () => undefined,
            onRulesOpen: () => this.rulesModal?.open(),
            onWalletOpen: () => this.walletModal?.open(),
        }).create();
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
        this.session.betManager.increase();

        this.updateBetUI();

        this.updateBetButtons();
    }

    private decreaseBet(): void {
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
        if (!this.roundState.canStart()) {
            return;
        }

        this.winPresentation?.stop();
        this.winPayoutFeedback?.stop();

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

            this.walletModal?.open(
                'Voce nao tem fundos suficientes. Faca um deposito para continuar.'
            );

            return;
        }

        // -----------------------------------------
        // INICIA SPIN
        // -----------------------------------------

        this.roundState.start();
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

        const seed = createRoundSeed();
        const playResult = SlotCore.play(
            currentBet,
            createSeededRandom(seed)
        );

        this.roundPayout = 0;
        this.roundWinningLines = 0;
        this.session.beginRoundHistory({
            id: `round-${++this.roundId}`,
            seed,
            bet: currentBet,
            baseGrid: playResult.grid,
        });

        // A primeira grade especial é sorteada agora, mas só substitui o
        // conteúdo visual dos rolos enquanto o giro normal ainda acontece.
        const luckyCornRound =
            luckyCornActivation
                ? this.runFeatureStep(
                    this.luckyCornFeature,
                    () => {
                    this.luckyCornFeature.start();
                    return this.luckyCornFeature.playRound();
                    }
                )
                : undefined;

        // Apenas um bônus de continuação é ativado por rodada. A ordem do
        // registro também expressa sua prioridade e evita uma cadeia de ifs.
        const continuationBonus =
            luckyCornActivation || playResult.payout.totalPayout <= 0
                ? undefined
                : [
                    {
                        tryStart: () => this.horseRaceFeature.tryStart(),
                        start: () => this.startHorseRace(playResult.payout.totalPayout),
                    },
                    {
                        tryStart: () => this.treasureChestFeature.tryStart(),
                        start: () => this.startTreasureChest(playResult.payout.totalPayout),
                    },
                    {
                        tryStart: () => this.cardDoubleFeature.tryStart(),
                        start: () => this.startCardDouble(playResult.payout.totalPayout),
                    },
                    {
                        tryStart: () => this.wheelBonusFeature.tryStart(),
                        start: () => this.startWheelBonus(playResult.payout.totalPayout),
                    },
                ].find(feature => feature.tryStart());

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

        if (luckyCornRound) {
            this.luckyCornFlow?.scheduleSuspense(luckyCornRound);
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
                                    if (luckyCornRound) {
                                        this.luckyCornFlow?.completeRound(
                                            currentBet,
                                            luckyCornRound,
                                            playResult.grid
                                        );

                                        return;
                                    }

                                    if (continuationBonus) {
                                        this.finishSpin(
                                            playResult,
                                            0,
                                            continuationBonus.start
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

    /**
     * Protege a inicialização e os callbacks das features. Se qualquer etapa
     * síncrona falhar, o estado da feature é liberado antes de propagar o erro.
     */
    private runFeatureStep<T>(
        feature: BonusFeatureLifecycle,
        operation: () => T
    ): T {
        let completed = false;

        try {
            const result = operation();
            completed = true;
            return result;
        } finally {
            if (!completed) {
                feature.finish();
            }
        }
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

        this.runFeatureStep(this.horseRaceFeature, () => {
            this.horseRaceFeature.start();
            presentation.showSelection(this.horseRaceFeature.getRunners(), selectedRunnerId => {
                this.runFeatureStep(this.horseRaceFeature, () => {
                    const result = this.horseRaceFeature.run(selectedRunnerId);
                    presentation.playRace(result, FeatureConfig.horseRace.segmentDuration, () => {
                        this.completeHorseRace(basePayout, result);
                    });
                });
            });
        });
    }

    private completeHorseRace(basePayout: number, result: HorseRaceResult): void {
        const payout = this.horseRaceFeature.getPayout(basePayout, result.selectedRank);
        this.horseRaceFeature.finish();
        const finish = (): void => {
            this.creditRoundPayout(payout);
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

        this.runFeatureStep(this.treasureChestFeature, () => {
            this.showTreasureChestRound(
                basePayout,
                this.treasureChestFeature.start()
            );
        });
    }

    private showTreasureChestRound(basePayout: number, round: TreasureChestRound): void {
        const presentation = this.treasureChestPresentation;
        if (!presentation) {
            this.treasureChestFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        this.runFeatureStep(this.treasureChestFeature, () => {
            presentation.show(
                round,
                basePayout,
                chestId => {
                    this.runFeatureStep(this.treasureChestFeature, () => {
                        const updatedRound = this.treasureChestFeature.select(chestId);
                        if (updatedRound.isFinished) {
                            this.completeTreasureChest(basePayout, updatedRound);
                            return;
                        }

                        this.showTreasureChestRound(basePayout, updatedRound);
                    });
                }
            );
        });
    }

    private completeTreasureChest(basePayout: number, round: TreasureChestRound): void {
        const extraPayout = this.treasureChestFeature.getExtraPayout(basePayout);
        const finish = (): void => {
            this.treasureChestFeature.finish();
            this.creditRoundPayout(extraPayout);
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

        this.runFeatureStep(this.cardDoubleFeature, () => {
            this.cardDoublePresentation?.beginBonus();
            this.showCardDoubleRound(
                basePayout,
                this.cardDoubleFeature.start(basePayout)
            );
        });
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

        this.runFeatureStep(this.cardDoubleFeature, () => {
            presentation.showRound(
                round,
                (guess: CardGuess) => {
                    this.runFeatureStep(this.cardDoubleFeature, () => {
                        this.showCardDoubleRound(
                            basePayout,
                            this.cardDoubleFeature.guess(guess)
                        );
                    });
                },
                () => {
                    this.runFeatureStep(this.cardDoubleFeature, () => {
                        this.showCardDoubleRound(
                            basePayout,
                            this.cardDoubleFeature.continue()
                        );
                    });
                },
                () => this.cashOutCardDouble(basePayout),
                () => this.loseCardDouble(basePayout)
            );
        });
    }

    private cashOutCardDouble(basePayout: number): void {
        const totalPayout = this.cardDoubleFeature.getCurrentPayout();
        const extraPayout = totalPayout - basePayout;
        const finish = (): void => {
            this.cardDoubleFeature.finish();
            this.creditRoundPayout(extraPayout);
            this.updateBalanceUI();
            this.finishSpinInteraction();
        };

        if (!this.cardDoublePresentation) {
            finish();
            return;
        }

        if (extraPayout <= 0) {
            this.cardDoublePresentation.dismiss(finish);
            return;
        }

        this.cardDoublePresentation.showFinal(
            basePayout,
            totalPayout,
            finish
        );
    }

    private loseCardDouble(basePayout: number): void {
        const finish = (): void => {
            this.cardDoubleFeature.finish();
            this.creditRoundPayout(-basePayout);
            this.updateBalanceUI();
            this.finishSpinInteraction();
        };

        if (this.cardDoublePresentation) {
            this.cardDoublePresentation.dismiss(finish);
            return;
        }

        finish();
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

        this.runFeatureStep(this.wheelBonusFeature, () => {
            presentation.resetWheelPosition();
            this.showWheelBonusRound(this.wheelBonusFeature.start(basePayout));
        });
    }

    private showWheelBonusRound(round: WheelBonusRound): void {
        const presentation = this.wheelBonusPresentation;
        if (!presentation) {
            this.wheelBonusFeature.finish();
            this.finishSpinInteraction();
            return;
        }

        this.runFeatureStep(this.wheelBonusFeature, () => {
            presentation.showRound(
                round,
                () => this.runFeatureStep(
                    this.wheelBonusFeature,
                    () => this.wheelBonusFeature.spin()
                ),
                () => this.runFeatureStep(
                    this.wheelBonusFeature,
                    () => this.wheelBonusFeature.skip()
                ),
                completedRound => this.completeWheelBonus(completedRound)
            );
        });
    }

    private completeWheelBonus(round: WheelBonusRound): void {
        const extraPayout = this.wheelBonusFeature.getExtraPayout();
        this.wheelBonusFeature.finish();
        this.wheelBonusPresentation?.clear();
        this.creditRoundPayout(extraPayout);
        this.updateBalanceUI();
        this.resultText?.setText(
            round.accumulatedPayout <= 0
                ? 'ROLETA: PRÊMIO PERDIDO'
                : `ROLETA: PRÊMIO ${Money.format(round.accumulatedPayout)}`
        );
        this.finishSpinInteraction();
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

        const totalPayout =
            payout.totalPayout + bonusPayout;

        const creditWinnings = (): void => {
            this.creditRoundPayout(totalPayout);
            this.updateBalanceUI();
            this.roundWinningLines = winningLines.length;
        };

        if (
            winningLines.length === 0
        ) {
            creditWinnings();
            this.completeSpin(onComplete);

            return;
        }

        // ==========================================
        // WIN
        // ==========================================

        if (!this.winPresentation || !this.winPayoutFeedback) {
            creditWinnings();
            this.completeSpin(onComplete);

            return;
        }

        let displayedPayout = 0;
        this.winPayoutFeedback.start();

        this.winPresentation.play(
            winningLines,

            payout.wins,

            {
                onLineStart:
                    (_win, linePayout) => {
                        displayedPayout +=
                            linePayout?.payout ?? 0;

                        this.winPayoutFeedback?.increaseTo(
                            Math.min(
                                totalPayout,
                                displayedPayout
                            )
                        );
                    },

                onComplete:
                    () => {
                        this.winPayoutFeedback?.increaseTo(
                            totalPayout
                        );
                        this.time.delayedCall(
                            GameConfig.layout.winPayoutFeedback.countDuration,
                            () => {
                                this.winPayoutFeedback?.transferToBalance(
                                    () => {
                                        creditWinnings();
                                        this.completeSpin(onComplete);
                                    }
                                );
                            }
                        );
                    },
            }
        );
    }

    private finishSpinInteraction(): void {
        this.session.completeRoundHistory(
            this.roundPayout,
            this.roundWinningLines
        );
        this.roundState.settle();
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
            this.roundState.enterBonus();
            onComplete();
            return;
        }

        this.finishSpinInteraction();
    }

    private creditRoundPayout(amount: number): void {
        this.session.adjustBalance(amount);
        this.roundPayout += amount;
    }

    // =====================================================
    // CONTROLE DE INTERAÇÃO
    // =====================================================

    private disableControls(): void {
        this.setSpinButtonEnabled(false);
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
            Money.format(this.session.getBalance())
        );
    }

    private updateBetUI(): void {
        const currentBet =
            this.session.betManager.getCurrentBet();

        this.betValueText?.setText(
            Money.format(currentBet)
        );
    }

    /**
     * Também oferece feedback visual quando
     * chegamos ao mínimo/máximo.
     */
    private updateBetButtons(): void {
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

}
