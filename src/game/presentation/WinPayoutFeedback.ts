import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Apresenta o valor acumulado das linhas e o transfere visualmente ao saldo. */
export class WinPayoutFeedback {
    private readonly text: GameObjects.Text;
    private currentAmount = 0;

    public constructor(
        private readonly scene: Scene
    ) {
        const layout = GameConfig.layout.winPayoutFeedback;
        const theme = GameConfig.winPayoutFeedback;

        this.text = this.scene.add.text(
            layout.x,
            layout.y,
            '',
            {
                fontFamily: 'Arial',
                fontSize: layout.fontSize,
                color: theme.color,
                stroke: theme.strokeColor,
                strokeThickness: theme.strokeThickness,
            }
        )
            .setOrigin(0.5)
            .setDepth(layout.depth)
            .setVisible(false);
    }

    public start(): void {
        this.stop();

        const layout = GameConfig.layout.winPayoutFeedback;
        this.currentAmount = 0;
        this.text
            .setPosition(layout.x, layout.y)
            .setScale(1)
            .setAlpha(1)
            .setText(this.formatAmount(0))
            .setVisible(true);
    }

    public increaseTo(amount: number): void {
        const targetAmount = Math.max(this.currentAmount, amount);

        this.scene.tweens.killTweensOf(this.text);

        this.scene.tweens.addCounter({
            from: this.currentAmount,
            to: targetAmount,
            duration: GameConfig.layout.winPayoutFeedback.countDuration,
            ease: 'Cubic.Out',
            onUpdate: tween => {
                const value = tween.getValue();
                this.currentAmount = value;
                this.text.setText(this.formatAmount(value));
            },
        });
    }

    public transferToBalance(onComplete: () => void): void {
        const layout = GameConfig.layout.winPayoutFeedback;

        this.scene.tweens.killTweensOf(this.text);
        this.text.setText(this.formatAmount(this.currentAmount));

        this.scene.tweens.add({
            targets: this.text,
            x: layout.targetX,
            y: layout.targetY,
            scale: 0.45,
            alpha: 0,
            duration: layout.transferDuration,
            ease: 'Quad.In',
            onComplete: () => {
                this.text.setVisible(false);
                onComplete();
            },
        });
    }

    public stop(): void {
        this.scene.tweens.killTweensOf(this.text);
        this.text.setVisible(false);
    }

    private formatAmount(amount: number): string {
        return `+ ${amount.toFixed(2)}`;
    }
}
