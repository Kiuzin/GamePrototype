import {
    GameObjects,
    Scene,
    Time,
    Tweens,
} from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';
import { BonusThemeConfig } from '../config/BonusThemeConfig';

/**
 * Apresentação visual transitória do Milho da Sorte.
 * O controle de tempo da funcionalidade permanece na cena; esta classe
 * é responsável somente por comunicar seus estados ao jogador.
 */
export class LuckyCornFeedback {
    private readonly scene: Scene;

    private announcement?: GameObjects.Container;

    private pendingTimer?: Time.TimerEvent;

    private payoutCounter?: Tweens.Tween;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public showSuspense(): void {
        this.showMessage(
            'O MILHO DA SORTE ESTÁ CHEGANDO!',
            'Os rolos ganharam um giro extra...',
            BonusThemeConfig.luckyCorn.colors.suspense
        );
    }

    public showStart(
        selectedSymbolId: string,
        duration: number,
        onComplete: () => void
    ): void {
        this.showTimedMessage(
            'MILHO DA SORTE!',
            `Símbolo da sorte: ${selectedSymbolId.toUpperCase()}`,
            BonusThemeConfig.luckyCorn.colors.feature,
            duration,
            onComplete
        );
    }

    /** Exibe o encerramento de uma sequência de re-spin sem prêmio. */
    public showNoWin(
        duration: number,
        onComplete: () => void
    ): void {
        this.showTimedMessage(
            'SEM PRÊMIO',
            'O RE-SPIN TERMINOU SEM GANHOS.',
            BonusThemeConfig.luckyCorn.colors.suspense,
            duration,
            onComplete
        );
    }

    public showFinalPayout(
        payout: number,
        multiplier: number,
        duration: number,
        finalPause: number,
        onComplete: () => void
    ): void {
        const valueText = this.showMessage(
            multiplier > 1
                ? `JACKPOT x${multiplier.toFixed(2)}!`
                : 'PRÊMIO DO RE-SPIN',
            '0.00',
            BonusThemeConfig.luckyCorn.colors.feature
        );

        valueText.setStyle({
            fontSize: BonusLayoutConfig.luckyCorn.jackpotValueFontSize,
            fontStyle: 'bold',
            color: BonusThemeConfig.luckyCorn.colors.jackpot,
        });

        this.payoutCounter =
            this.scene.tweens.addCounter({
                from: 0,
                to: Math.max(0, payout),
                duration,
                ease: 'Quad.easeOut',
                onUpdate: tween => {
                    const currentValue = tween.getValue() ?? 0;
                    valueText.setText(
                        currentValue.toFixed(2)
                    );
                },
                onComplete: () => {
                    this.payoutCounter = undefined;

                    this.pendingTimer =
                        this.scene.time.delayedCall(
                            finalPause,
                            () => {
                                this.pendingTimer = undefined;
                                this.clearAnnouncement();
                                onComplete();
                            }
                        );
                },
            });
    }

    public clear(): void {
        this.payoutCounter?.stop();
        this.payoutCounter = undefined;

        if (this.pendingTimer) {
            this.scene.time.removeEvent(
                this.pendingTimer
            );

            this.pendingTimer = undefined;
        }

        if (!this.announcement) {
            return;
        }

        this.scene.tweens.killTweensOf(
            this.announcement
        );

        this.announcement.destroy();
        this.announcement = undefined;
    }

    public destroy(): void {
        this.clear();
    }

    private showTimedMessage(
        title: string,
        detail: string,
        color: string,
        duration: number,
        onComplete: () => void
    ): void {
        this.showMessage(
            title,
            detail,
            color
        );

        this.pendingTimer =
            this.scene.time.delayedCall(
                duration,
                () => {
                    this.pendingTimer = undefined;
                    this.clearAnnouncement();
                    onComplete();
                }
            );
    }

    private showMessage(
        title: string,
        detail: string,
        color: string
    ): GameObjects.Text {
        this.clear();

        const { width } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.luckyCorn;
        const theme = BonusThemeConfig.luckyCorn;

        const panel = this.scene.add.rectangle(
            width / 2,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            theme.panel.color,
            theme.panel.alpha
        ).setStrokeStyle(
            theme.panel.strokeWidth,
            theme.panel.strokeColor
        );

        const titleText = this.scene.add.text(
            width / 2,
            layout.title.y,
            title,
            {
                fontFamily: BonusThemeConfig.fontFamily,
                fontSize: layout.title.fontSize,
                color,
                fontStyle: 'bold',
            }
        ).setOrigin(0.5);

        const detailText = this.scene.add.text(
            width / 2,
            layout.detail.y,
            detail,
            {
                fontFamily: BonusThemeConfig.fontFamily,
                fontSize: layout.detail.fontSize,
                color: theme.colors.detail,
            }
        ).setOrigin(0.5);

        this.announcement = this.scene.add.container(
            0,
            0,
            [
                panel,
                titleText,
                detailText,
            ]
        )
            .setDepth(layout.depth)
            .setAlpha(0)
            .setScale(theme.entrance.initialScale);

        this.scene.tweens.add({
            targets: this.announcement,
            alpha: 1,
            scale: 1,
            duration: theme.entrance.duration,
            ease: theme.entrance.ease,
        });

        return detailText;
    }

    private clearAnnouncement(): void {
        if (!this.announcement) {
            return;
        }

        this.scene.tweens.killTweensOf(
            this.announcement
        );

        this.announcement.destroy();
        this.announcement = undefined;
    }
}
