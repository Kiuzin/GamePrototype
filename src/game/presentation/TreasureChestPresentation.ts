import { GameObjects, Scene, Time, Tweens } from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';
import { BonusThemeConfig } from '../config/BonusThemeConfig';
import { FeatureConfig } from '../config/FeatureConfig';
import type { TreasureChestRound, TreasureChestState } from '../logic/TreasureChestFeature';

/** Interface do bônus de baús; a distribuição dos conteúdos pertence à lógica. */
export class TreasureChestPresentation {
    private container?: GameObjects.Container;

    private pendingTimer?: Time.TimerEvent;

    private payoutCounter?: Tweens.Tween;

    private selectionLocked = false;

    public constructor(private readonly scene: Scene) {}

    public show(round: TreasureChestRound, basePayout: number, onSelect: (chestId: string) => void): void {
        this.clear();
        this.createRound(round, basePayout, onSelect);
    }

    public showFinal(round: TreasureChestRound, basePayout: number, onComplete: () => void): void {
        this.clear();
        this.createRound(round, basePayout);

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
        if (this.pendingTimer) {
            this.scene.time.removeEvent(this.pendingTimer);
            this.pendingTimer = undefined;
        }
        this.selectionLocked = false;
        this.container?.destroy();
        this.container = undefined;
    }

    private createRound(round: TreasureChestRound, basePayout: number, onSelect?: (chestId: string) => void): void {
        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.treasureChest;
        const theme = BonusThemeConfig.treasureChest;
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, theme.overlay.color, theme.overlay.alpha),
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, theme.headerColor),
            this.scene.add.text(width / 2, layout.header.titleY, 'BAÚS DO TESOURO', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.subtitleY, round.isFinished ? 'TODOS OS BAÚS FORAM REVELADOS' : 'ESCOLHA UM BAÚ PARA REVELAR O PRÊMIO', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.subtitleFontSize, color: theme.colors.primaryText }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.progressY, `EXTRAS ACUMULADOS: ${(basePayout * round.accumulatedMultiplier).toFixed(2)}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.progressFontSize, color: theme.colors.secondaryText, fontStyle: 'bold' }).setOrigin(0.5),
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
                    onSelect(chest.id);
                });
            }
            items.push(chestCard.container);
        });

        this.container = this.scene.add.container(0, 0, items).setDepth(layout.depth);
    }

    private createChestCard(x: number, y: number, chest: TreasureChestState, basePayout: number): { container: GameObjects.Container; hitArea: GameObjects.Rectangle } {
        const layout = BonusLayoutConfig.treasureChest.grid;
        const theme = BonusThemeConfig.treasureChest;
        const isEndingChest = chest.isRevealed && chest.content.type === 'ending';
        const isRewardChest = chest.isRevealed && chest.content.type === 'reward';
        const cardColor = chest.isRevealed ? theme.card.selectedColor : theme.card.color;
        const strokeColor = chest.isRevealed ? theme.card.revealedStrokeColor : theme.card.strokeColor;
        const label = this.getChestLabel(chest, basePayout);
        const labelColor = isEndingChest
            ? theme.colors.ending
            : isRewardChest
                ? theme.colors.reward
                : theme.colors.primaryText;

        const hitArea = this.scene.add.rectangle(0, 0, layout.cardWidth, layout.cardHeight, cardColor)
            .setStrokeStyle(theme.card.strokeWidth, strokeColor);
        const container = this.scene.add.container(x, y, [
            hitArea,
            this.scene.add.text(0, layout.chestOffsetY, theme.chest.emoji, { fontSize: theme.chest.emojiFontSize }).setOrigin(0.5).setScale(layout.chestScale),
            this.scene.add.text(0, layout.labelOffsetY, label, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.labelFontSize, color: labelColor, fontStyle: 'bold', align: 'center' }).setOrigin(0.5),
        ]);

        return { container, hitArea };
    }

    private getChestLabel(chest: TreasureChestState, basePayout: number): string {
        if (!chest.isRevealed) return 'ESCOLHER';
        if (chest.content.type === 'ending') return 'FIM DO BÔNUS';
        const amount = basePayout * chest.content.multiplier;
        return `+${chest.content.multiplier.toFixed(2)}x\n+${amount.toFixed(2)}`;
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
