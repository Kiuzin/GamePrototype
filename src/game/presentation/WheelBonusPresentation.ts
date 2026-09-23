import { GameObjects, Scene, Tweens } from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';
import { BonusThemeConfig } from '../config/BonusThemeConfig';
import { FeatureConfig } from '../config/FeatureConfig';
import type { WheelBonusRound } from '../logic/WheelBonusFeature';

/** Interface e animação da roleta do bônus. */
export class WheelBonusPresentation {
    private container?: GameObjects.Container;

    private wheel?: GameObjects.Container;

    private spinTween?: Tweens.Tween;

    private selectionLocked = false;

    /** Ângulo preservado enquanto a rodada atual da roleta estiver ativa. */
    private wheelAngle = 0;

    public constructor(private readonly scene: Scene) {}

    public showRound(
        round: WheelBonusRound,
        onSpin: () => WheelBonusRound,
        onSkip: () => WheelBonusRound,
        onComplete: (round: WheelBonusRound) => void
    ): void {
        this.clear();
        if (round.status === 'completed') {
            this.showCompleted(round, onComplete);
            return;
        }

        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.wheelBonus;
        const theme = BonusThemeConfig.wheelBonus;
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, theme.overlay.color, theme.overlay.alpha).setInteractive();
        const status = `GIROS RESTANTES: ${round.remainingSpins}  |  ACUMULADO: ${round.accumulatedPayout.toFixed(2)}`;
        this.wheel = this.createWheel();
        const pointer = this.scene.add.triangle(layout.wheel.pointerX, layout.wheel.pointerY, 0, 0, -28, -52, 28, -52, theme.pointerColor);

        this.container = this.scene.add.container(0, 0, [
            overlay,
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, theme.headerColor),
            this.scene.add.text(width / 2, layout.header.titleY, 'ROULETA DA COLHEITA', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.statusY, status, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.statusFontSize, color: theme.colors.secondaryText, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.prizeY, `PRÊMIO-BASE: ${round.basePayout.toFixed(2)}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.prizeFontSize, color: theme.colors.primaryText }).setOrigin(0.5),
            this.wheel,
            pointer,
            this.scene.add.text(width / 2, layout.feedback.y, 'Gire a roleta ou pule o bônus e fique com o prêmio atual.', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.feedback.fontSize, color: theme.colors.primaryText, align: 'center', wordWrap: { width: 930 } }).setOrigin(0.5),
        ]).setDepth(layout.depth);

        this.addButton(layout.buttons.spinY, 'GIRAR ROLETA', theme.buttons.primaryColor, () => {
            const updatedRound = onSpin();
            this.animateSpin(updatedRound, () => this.showRound(updatedRound, onSpin, onSkip, onComplete));
        });
        this.addButton(layout.buttons.skipY, 'PULAR BÔNUS · FICAR COM O PRÊMIO', theme.buttons.secondaryColor, () => this.showRound(onSkip(), onSpin, onSkip, onComplete));
    }

    public clear(): void {
        this.spinTween?.stop();
        this.spinTween = undefined;
        this.selectionLocked = false;
        this.container?.destroy();
        this.container = undefined;
        this.wheel = undefined;
    }

    /** Prepara a roleta para uma nova ativação do bônus. */
    public resetWheelPosition(): void {
        this.wheelAngle = 0;
    }

    private showCompleted(round: WheelBonusRound, onComplete: (round: WheelBonusRound) => void): void {
        this.clear();
        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.wheelBonus;
        const theme = BonusThemeConfig.wheelBonus;
        const lost = round.accumulatedPayout <= 0;
        const message = lost ? 'A ROLETA LEVOU TODO O PRÊMIO.' : `PRÊMIO FINAL: ${round.accumulatedPayout.toFixed(2)}`;
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, theme.overlay.color, theme.overlay.alpha).setInteractive();
        this.container = this.scene.add.container(0, 0, [
            overlay,
            this.scene.add.text(width / 2, layout.header.titleY, lost ? 'FIM DA ROLETA' : 'PRÊMIO DA ROLETA!', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: lost ? theme.colors.loss : theme.colors.win, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.wheel.y, message, { fontFamily: BonusThemeConfig.fontFamily, fontSize: '48px', color: theme.colors.highlight, fontStyle: 'bold', align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5),
        ]).setDepth(layout.depth);
        this.scene.time.delayedCall(FeatureConfig.wheelBonus.finalDisplayDuration, () => {
            if (!this.container) return;
            this.addButton(layout.buttons.skipY, 'CONTINUAR', theme.buttons.secondaryColor, () => onComplete(round));
        });
    }

    private createWheel(): GameObjects.Container {
        const layout = BonusLayoutConfig.wheelBonus.wheel;
        const theme = BonusThemeConfig.wheelBonus;
        const slices = FeatureConfig.wheelBonus.slices;
        const sector = (Math.PI * 2) / slices.length;
        const graphics = this.scene.add.graphics();
        const labels: GameObjects.GameObject[] = [graphics];

        slices.forEach((slice, index) => {
            const start = -Math.PI / 2 + sector * index;
            const end = start + sector;
            graphics.fillStyle(theme.wheelColors[index % theme.wheelColors.length], 1);
            graphics.slice(0, 0, layout.radius, start, end, false);
            graphics.fillPath();
            graphics.lineStyle(theme.wheelStrokeWidth, theme.wheelStrokeColor, 1);
            graphics.strokePath();
            const labelAngle = start + sector / 2;
            labels.push(this.scene.add.text(Math.cos(labelAngle) * layout.labelRadius, Math.sin(labelAngle) * layout.labelRadius, slice.label, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.labelFontSize, color: theme.colors.primaryText, fontStyle: 'bold', align: 'center', wordWrap: { width: 130 } }).setOrigin(0.5).setRotation(labelAngle + Math.PI / 2));
        });

        graphics.lineStyle(theme.wheelStrokeWidth + 2, theme.wheelStrokeColor, 1);
        graphics.strokeCircle(0, 0, layout.radius);
        return this.scene.add.container(layout.x, layout.y, labels)
            .setAngle(this.wheelAngle);
    }

    private animateSpin(round: WheelBonusRound, onComplete: () => void): void {
        const slice = round.lastSlice;
        const index = slice ? FeatureConfig.wheelBonus.slices.findIndex(item => item.id === slice.id) : 0;
        const sectorDegrees = 360 / FeatureConfig.wheelBonus.slices.length;
        const landingAngle = -(index + 0.5) * sectorDegrees;
        const minimumTurns = Math.ceil(
            (this.wheelAngle - landingAngle) / 360
        );
        const targetAngle = landingAngle + (minimumTurns + 5) * 360;
        this.spinTween = this.scene.tweens.add({
            targets: this.wheel,
            angle: targetAngle,
            duration: FeatureConfig.wheelBonus.spinDuration,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.spinTween = undefined;
                this.wheelAngle = targetAngle;
                onComplete();
            },
        });
    }

    private addButton(y: number, label: string, color: number, onClick: () => void): void {
        const { width } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.wheelBonus.buttons;
        const theme = BonusThemeConfig.wheelBonus.buttons;
        const button = this.scene.add.rectangle(width / 2, y, layout.width, layout.height, color).setStrokeStyle(theme.strokeWidth, theme.strokeColor).setInteractive();
        const text = this.scene.add.text(width / 2, y, label, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.fontSize, color: BonusThemeConfig.wheelBonus.colors.primaryText, fontStyle: 'bold', align: 'center', wordWrap: { width: layout.width - 24 } }).setOrigin(0.5);
        button.on('pointerdown', () => {
            if (this.selectionLocked) return;
            this.selectionLocked = true;
            onClick();
        });
        this.container?.add([button, text]);
    }
}
