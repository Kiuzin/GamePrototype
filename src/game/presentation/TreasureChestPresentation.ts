import { GameObjects, Scene, Time, Tweens } from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';
import { BonusThemeConfig } from '../config/BonusThemeConfig';
import { FeatureConfig } from '../config/FeatureConfig';
import type { TreasureChestRound, TreasureChestState } from '../logic/TreasureChestFeature';

interface TreasureChestCard {
    container: GameObjects.Container;
    hitArea: GameObjects.Rectangle;
    ear: GameObjects.Image;
    label: GameObjects.Text;
}

/** Interface do bônus de baús; a distribuição dos conteúdos pertence à lógica. */
export class TreasureChestPresentation {
    private container?: GameObjects.Container;

    private pendingTimer?: Time.TimerEvent;

    private payoutCounter?: Tweens.Tween;

    private multiplierCounter?: Tweens.Tween;

    private multiplierHypeTween?: Tweens.Tween;

    private multiplierScaleTween?: Tweens.Tween;

    private displayedMultiplier = 1;

    private accumulatedScale = 1;

    private hasAccumulatedReward = false;

    private selectionLocked = false;

    public constructor(private readonly scene: Scene) {}

    public show(round: TreasureChestRound, basePayout: number, onSelect: (chestId: string) => void): void {
        if (round.accumulatedMultiplier === 0) {
            this.displayedMultiplier = 1;
            this.accumulatedScale = 1;
            this.hasAccumulatedReward = false;
        }

        this.clear();
        this.createRound(round, basePayout, onSelect);
    }

    public showFinal(round: TreasureChestRound, basePayout: number, onComplete: () => void): void {
        this.clear();
        this.createRound(round, basePayout, undefined, false);

        const layout = BonusLayoutConfig.treasureChest.final;
        const theme = BonusThemeConfig.treasureChest;
        const extraPayout = basePayout * round.accumulatedMultiplier;
        const totalPayout = basePayout + extraPayout;
        const detail = this.scene.add.text(
            this.scene.scale.gameSize.width / 2,
            layout.detailY,
            `GANHO BASE ${basePayout.toFixed(2)}  |  EXTRAS ${extraPayout.toFixed(2)}`,
            {
                fontFamily: BonusThemeConfig.fontFamily,
                fontSize: layout.detailFontSize,
                color: theme.colors.secondaryText,
            }
        ).setOrigin(0.5);
        const total = this.scene.add.text(
            this.scene.scale.gameSize.width / 2,
            layout.totalY,
            '0.00',
            {
                fontFamily: BonusThemeConfig.fontFamily,
                fontSize: layout.totalFontSize,
                color: theme.colors.highlight,
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);

        this.container?.add([detail, total]);
        this.pendingTimer = this.scene.time.delayedCall(
            FeatureConfig.treasureChest.revealDelay,
            () => {
                this.pendingTimer = undefined;
                this.payoutCounter = this.scene.tweens.addCounter({
                    from: 0,
                    to: totalPayout,
                    duration: FeatureConfig.treasureChest.payoutCountDuration,
                    ease: 'Quad.easeOut',
                    onUpdate: tween => total.setText((tween.getValue() ?? 0).toFixed(2)),
                    onComplete: () => {
                        this.payoutCounter = undefined;
                        this.addContinueButton(onComplete);
                    },
                });
            }
        );
    }

    public clear(): void {
        this.payoutCounter?.stop();
        this.payoutCounter = undefined;
        this.multiplierCounter?.stop();
        this.multiplierCounter = undefined;
        this.multiplierHypeTween?.stop();
        this.multiplierHypeTween = undefined;
        this.multiplierScaleTween?.stop();
        this.multiplierScaleTween = undefined;
        if (this.pendingTimer) {
            this.scene.time.removeEvent(this.pendingTimer);
            this.pendingTimer = undefined;
        }
        this.selectionLocked = false;
        this.container?.destroy();
        this.container = undefined;
    }

    private createRound(
        round: TreasureChestRound,
        basePayout: number,
        onSelect?: (chestId: string) => void,
        showAccumulatedMultiplier = true
    ): void {
        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.treasureChest;
        const theme = BonusThemeConfig.treasureChest;
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, theme.overlay.color, theme.overlay.alpha),
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, theme.headerColor),
            this.scene.add.text(width / 2, layout.header.titleY, 'ESPIGAS PREMIADAS', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.subtitleY, round.isFinished ? 'TODAS AS ESPIGAS FORAM REVELADAS' : 'ESCOLHA UMA ESPIGA PARA REVELAR O PRÊMIO', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.subtitleFontSize, color: theme.colors.primaryText }).setOrigin(0.5),
        ];

        round.chests.forEach((chest, index) => {
            const x = layout.grid.columns[index % layout.grid.columns.length];
            const y = layout.grid.firstY + Math.floor(index / layout.grid.columns.length) * layout.grid.rowGap;
            const chestCard = this.createChestCard(x, y, chest, basePayout);
            if (onSelect && !chest.isRevealed && !round.isFinished) {
                chestCard.hitArea.setInteractive();
                chestCard.hitArea.on('pointerdown', () => {
                    if (this.selectionLocked) return;
                    this.selectionLocked = true;
                    this.revealCornEar(
                        chestCard,
                        chest,
                        basePayout,
                        () => onSelect(chest.id)
                    );
                });
                chestCard.hitArea.on('pointerover', () => {
                    chestCard.container.setScale(
                        theme.card.hoverScale
                    );
                });
                chestCard.hitArea.on('pointerout', () => {
                    chestCard.container.setScale(1);
                });
            }
            items.push(chestCard.container);
        });

        this.container = this.scene.add.container(0, 0, items).setDepth(layout.depth);

        if (showAccumulatedMultiplier) {
            this.addAccumulatedMultiplier(
                1 + round.accumulatedMultiplier
            );
        }
    }

    private createChestCard(
        x: number,
        y: number,
        chest: TreasureChestState,
        basePayout: number
    ): TreasureChestCard {
        const layout = BonusLayoutConfig.treasureChest.grid;
        const theme = BonusThemeConfig.treasureChest;
        const isEndingChest = chest.isRevealed && chest.content.type === 'ending';
        const isRewardChest = chest.isRevealed && chest.content.type === 'reward';
        const showDebugEnding =
            FeatureConfig.treasureChest
                .debugShowEndingChests &&
            !chest.isRevealed &&
            chest.content.type === 'ending';
        const cardColor = chest.isRevealed ? theme.card.selectedColor : theme.card.color;
        
        const label = this.getChestLabel(chest, basePayout);
        const labelColor = isEndingChest
            ? theme.colors.ending
            : isRewardChest
                ? theme.colors.reward
                : theme.colors.primaryText;

        const hitArea = this.scene.add.rectangle(0, 0, layout.cardWidth, layout.cardHeight, cardColor)
            .setStrokeStyle(theme.card.strokeWidth);
        const ear = this.scene.add.image(
            0,
            layout.earOffsetY,
            chest.isRevealed
                ? theme.ear.openTextureKey
                : theme.ear.closedTextureKey
        ).setDisplaySize(
            layout.earWidth,
            layout.earHeight
        );
        const labelText = this.scene.add.text(
            0,
            layout.labelOffsetY,
            label,
            {
                fontFamily: BonusThemeConfig.fontFamily,
                fontSize: layout.labelFontSize,
                color: labelColor,
                fontStyle: 'bold',
                align: 'center',
            }
        ).setOrigin(0.5);
        const cardItems: GameObjects.GameObject[] = [
            hitArea,
            ear,
            labelText,
        ];

        if (showDebugEnding) {
            cardItems.push(
                this.scene.add.text(
                    0,
                    layout.debugLabelOffsetY,
                    'DEBUG: FINALIZA',
                    {
                        fontFamily: BonusThemeConfig.fontFamily,
                        fontSize: layout.debugLabelFontSize,
                        color: theme.colors.debugEnding,
                        fontStyle: 'bold',
                    }
                ).setOrigin(0.5)
            );
        }

        const container = this.scene.add.container(
            x,
            y,
            cardItems
        );

        return { container, hitArea, ear, label: labelText };
    }

    /** Anima a abertura antes de delegar a resolução à regra da feature. */
    private revealCornEar(
        chestCard: TreasureChestCard,
        chest: TreasureChestState,
        basePayout: number,
        onComplete: () => void
    ): void {
        const animation =
            BonusThemeConfig.treasureChest.ear;
        const layout = BonusLayoutConfig.treasureChest.grid;
        const theme = BonusThemeConfig.treasureChest;
        const initialX = chestCard.ear.x;

        chestCard.hitArea.disableInteractive();

        this.scene.tweens.add({
            targets: chestCard.ear,
            x: initialX + animation.shakeDistance,
            duration: animation.shakeDuration,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                chestCard.ear
                    .setTexture(animation.openTextureKey)
                    .setDisplaySize(
                        layout.earWidth,
                        layout.earHeight
                    )
                    .setX(initialX);

                chestCard.label.setVisible(false);

                const revealLabel = this.scene.add.text(
                    0,
                    layout.earOffsetY,
                    this.getRevealedChestLabel(
                        chest,
                        basePayout
                    ),
                    {
                        fontFamily: BonusThemeConfig.fontFamily,
                        fontSize: layout.labelFontSize,
                        color: chest.content.type === 'ending'
                            ? theme.colors.ending
                            : theme.colors.reward,
                        fontStyle: 'bold',
                        align: 'center',
                    }
                ).setOrigin(0.5);

                chestCard.container.add(revealLabel);

                this.scene.tweens.add({
                    targets: revealLabel,
                    y: layout.labelOffsetY,
                    duration: animation.revealDuration,
                    ease: 'Quad.easeOut',
                    onComplete,
                });
            },
        });
    }

    private getChestLabel(chest: TreasureChestState, basePayout: number): string {
        if (!chest.isRevealed) return 'ESCOLHER';
        return this.getRevealedChestLabel(chest, basePayout);
    }

    private getRevealedChestLabel(
        chest: TreasureChestState,
        basePayout: number
    ): string {
        if (chest.content.type === 'ending') return 'FIM DO BÔNUS';
        const amount = basePayout * chest.content.multiplier;
        return `+${chest.content.multiplier.toFixed(2)}x\n+${amount.toFixed(2)}`;
    }

    private addAccumulatedMultiplier(
        multiplier: number
    ): void {
        const layout = BonusLayoutConfig.treasureChest.accumulated;
        const theme = BonusThemeConfig.treasureChest;
        const { width } = this.scene.scale.gameSize;
        const previousMultiplier = this.displayedMultiplier;
        const hasNewMultiplier =
            multiplier > previousMultiplier;
        const accumulatedAnimation =
            theme.accumulated;
        const targetScale = hasNewMultiplier
            ? Math.min(
                accumulatedAnimation.maxScale,
                this.accumulatedScale +
                    accumulatedAnimation.scaleStep
            )
            : this.accumulatedScale;
        const label = this.scene.add.text(
            width / 2,
            layout.labelY,
            'MULTIPLICADOR ACUMULADO',
            {
                fontFamily: BonusThemeConfig.fontFamily,
                fontSize: layout.labelFontSize,
                color: theme.colors.secondaryText,
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);
        const value = this.scene.add.text(
            width / 2,
            layout.valueY,
            this.formatMultiplier(previousMultiplier),
            {
                fontFamily: BonusThemeConfig.fontFamily,
                fontSize: layout.valueFontSize,
                color: theme.colors.highlight,
                fontStyle: 'bold',
            }
        )
            .setOrigin(0.5)
            .setScale(this.accumulatedScale);

        this.container?.add([label, value]);
        this.displayedMultiplier = multiplier;

        if (previousMultiplier === multiplier) {
            if (this.hasAccumulatedReward) {
                this.startMultiplierShake(value);
            }

            return;
        }

        this.multiplierCounter = this.scene.tweens.addCounter({
            from: previousMultiplier,
            to: multiplier,
            duration: accumulatedAnimation.duration,
            ease: 'Quad.easeOut',
            onUpdate: tween => {
                value.setText(
                    this.formatMultiplier(
                        tween.getValue() ?? 0
                    )
                );
            },
            onComplete: () => {
                this.multiplierCounter = undefined;

                if (!hasNewMultiplier) {
                    this.startMultiplierShake(value);

                    return;
                }

                this.accumulatedScale = targetScale;
                this.hasAccumulatedReward = true;
                this.multiplierScaleTween = this.scene.tweens.add({
                    targets: value,
                    scaleX: targetScale,
                    scaleY: targetScale,
                    duration: accumulatedAnimation.duration,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        this.multiplierScaleTween = undefined;
                    },
                });
                this.startMultiplierShake(value);
            },
        });
    }

    /** Mantém uma vibração discreta, proporcional ao nível acumulado. */
    private startMultiplierShake(
        value: GameObjects.Text
    ): void {
        const animation =
            BonusThemeConfig.treasureChest.accumulated;
        const growthSteps =
            (this.accumulatedScale - 1) /
            animation.scaleStep;
        const shakeDistance = Math.min(
            animation.maxShakeDistance,
            animation.baseShakeDistance +
                growthSteps * animation.shakeStep
        );
        const { width } = this.scene.scale.gameSize;

        this.multiplierHypeTween?.stop();
        value.setX(width / 2 - shakeDistance);

        this.multiplierHypeTween = this.scene.tweens.add({
            targets: value,
            x: width / 2 + shakeDistance,
            duration: animation.shakeDuration,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });
    }

    private formatMultiplier(value: number): string {
        return `${Number(value.toFixed(2))}x`;
    }

    private addContinueButton(onComplete: () => void): void {
        const { width } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.treasureChest.final.continueButton;
        const theme = BonusThemeConfig.treasureChest.final;
        const button = this.scene.add.rectangle(width / 2, layout.y, layout.width, layout.height, theme.buttonColor).setStrokeStyle(theme.buttonStrokeWidth, theme.buttonStrokeColor).setInteractive();
        const label = this.scene.add.text(width / 2, layout.y, 'CONTINUAR', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.fontSize, color: BonusThemeConfig.treasureChest.colors.primaryText, fontStyle: 'bold' }).setOrigin(0.5);

        button.on('pointerdown', () => {
            if (this.selectionLocked) return;
            this.selectionLocked = true;
            this.clear();
            onComplete();
        });
        this.container?.add([button, label]);
    }
}
