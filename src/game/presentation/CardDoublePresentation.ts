import { GameObjects, Scene, Tweens } from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';
import { BonusThemeConfig } from '../config/BonusThemeConfig';
import { FeatureConfig } from '../config/FeatureConfig';
import type {
    CardDoubleCard,
    CardDoubleRound,
    CardGuess,
} from '../logic/CardDoubleFeature';

/** Interface visual do bônus Dobra de Cartas. */
export class CardDoublePresentation {
    private container?: GameObjects.Container;

    private payoutCounter?: Tweens.Tween;

    private selectionLocked = false;

    public constructor(private readonly scene: Scene) {}

    public showRound(
        round: CardDoubleRound,
        onGuess: (guess: CardGuess) => void,
        onContinue: () => void,
        onCashOut: () => void,
        onLost: () => void
    ): void {
        this.clear();

        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.cardDouble;
        const theme = BonusThemeConfig.cardDouble;
        const isAwaitingGuess = round.status === 'awaitingGuess';
        const isLost = round.status === 'lost';
        const feedback = this.getFeedback(round);

        const overlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            theme.overlay.color,
            theme.overlay.alpha
        ).setInteractive();

        const items: GameObjects.GameObject[] = [
            overlay,
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, theme.headerColor),
            this.scene.add.text(width / 2, layout.header.titleY, 'DOBRA DE CARTAS', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.prizeY, `PRÊMIO EM JOGO: ${round.currentPayout.toFixed(2)}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.prizeFontSize, color: theme.colors.primaryText, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.deckY, `CARTAS RESTANTES: ${round.remainingCardCount}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.deckFontSize, color: theme.colors.secondaryText }).setOrigin(0.5),
            this.createCard(round.revealedCard),
            this.scene.add.text(width / 2, layout.prompt.y, feedback.text, { fontFamily: BonusThemeConfig.fontFamily, fontSize: feedback.fontSize, color: feedback.color, fontStyle: 'bold', align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5),
        ];

        this.container = this.scene.add.container(0, 0, items).setDepth(layout.depth);

        if (isAwaitingGuess) {
            this.addButton(layout.buttons.leftX, layout.buttons.firstY, 'MENOR QUE 7', theme.buttons.secondaryColor, () => onGuess('lower'));
            this.addButton(layout.buttons.rightX, layout.buttons.firstY, 'MAIOR QUE 7', theme.buttons.primaryColor, () => onGuess('higher'));
            this.addButton(width / 2, layout.buttons.cashoutY, 'NÃO JOGAR · FICAR COM O PRÊMIO', theme.buttons.cashoutColor, onCashOut);
            return;
        }

        if (isLost) {
            this.addButton(width / 2, layout.buttons.cashoutY, 'CONTINUAR', theme.buttons.cashoutColor, onLost);
            return;
        }

        this.addButton(width / 2, layout.buttons.secondY, round.status === 'won' ? 'DOBRAR NOVAMENTE' : 'TENTAR NOVAMENTE', theme.buttons.primaryColor, onContinue);
        this.addButton(width / 2, layout.buttons.cashoutY, 'FICAR COM O PRÊMIO', theme.buttons.cashoutColor, onCashOut);
    }

    public showFinal(
        basePayout: number,
        totalPayout: number,
        onComplete: () => void
    ): void {
        this.clear();

        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.cardDouble;
        const theme = BonusThemeConfig.cardDouble;
        const totalText = this.scene.add.text(width / 2, layout.feedback.finalY, basePayout.toFixed(2), { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.feedback.finalFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5);

        const overlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            theme.overlay.color,
            theme.overlay.alpha
        ).setInteractive();

        this.container = this.scene.add.container(0, 0, [
            overlay,
            this.scene.add.text(width / 2, layout.header.titleY, 'PRÊMIO DOBRADO!', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: theme.colors.win, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.prompt.y, `${basePayout.toFixed(2)}  →  ${totalPayout.toFixed(2)}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.feedback.fontSize, color: theme.colors.secondaryText }).setOrigin(0.5),
            totalText,
        ]).setDepth(layout.depth);

        this.payoutCounter = this.scene.tweens.addCounter({
            from: basePayout,
            to: totalPayout,
            duration: FeatureConfig.cardDouble.finalDisplayDuration,
            ease: 'Quad.easeOut',
            onUpdate: tween => totalText.setText((tween.getValue() ?? 0).toFixed(2)),
            onComplete: () => {
                this.payoutCounter = undefined;
                this.addButton(width / 2, layout.buttons.cashoutY, 'RECOLHER PRÊMIO', theme.buttons.cashoutColor, onComplete);
            },
        });
    }

    public clear(): void {
        this.payoutCounter?.stop();
        this.payoutCounter = undefined;
        this.selectionLocked = false;
        this.container?.destroy();
        this.container = undefined;
    }

    private createCard(card?: CardDoubleCard): GameObjects.Container {
        const layout = BonusLayoutConfig.cardDouble.card;
        const theme = BonusThemeConfig.cardDouble.card;
        const isRevealed = card !== undefined;
        const cardColor = isRevealed ? theme.color : theme.backColor;
        const objects: GameObjects.GameObject[] = [
            this.scene.add.rectangle(0, 0, layout.width, layout.height, cardColor).setStrokeStyle(theme.strokeWidth, theme.strokeColor),
        ];

        if (!card) {
            objects.push(this.scene.add.text(0, 0, '?', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.questionFontSize, color: BonusThemeConfig.cardDouble.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5));
        } else {
            const color = card.color === 'red'
                ? BonusThemeConfig.cardDouble.colors.redCard
                : BonusThemeConfig.cardDouble.colors.blackCard;
            objects.push(
                this.scene.add.text(-layout.rankOffsetX, -layout.rankOffsetY, card.rank, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.rankFontSize, color, fontStyle: 'bold' }).setOrigin(0.5),
                this.scene.add.text(layout.rankOffsetX, layout.rankOffsetY, card.rank, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.rankFontSize, color, fontStyle: 'bold' }).setOrigin(0.5).setAngle(180),
                this.scene.add.text(0, layout.suitOffsetY, card.suit, { fontSize: layout.suitFontSize, color }).setOrigin(0.5),
            );
        }

        return this.scene.add.container(layout.x, layout.y, objects);
    }

    private getFeedback(round: CardDoubleRound): { text: string; color: string; fontSize: string } {
        const colors = BonusThemeConfig.cardDouble.colors;

        switch (round.status) {
            case 'won':
                return { text: 'ACERTOU! O PRÊMIO DOBROU.', color: colors.win, fontSize: BonusLayoutConfig.cardDouble.feedback.fontSize };
            case 'tie':
                return { text: 'SAIU 7. EMPATE — TENTE DE NOVO OU RECOLHA.', color: colors.highlight, fontSize: BonusLayoutConfig.cardDouble.prompt.fontSize };
            case 'lost':
                return { text: 'ESCOLHA ERRADA. VOCÊ PERDEU TODO O PRÊMIO.', color: colors.loss, fontSize: BonusLayoutConfig.cardDouble.feedback.fontSize };
            default:
                return { text: 'A CARTA VIRADA É MAIOR OU MENOR QUE 7?', color: colors.primaryText, fontSize: BonusLayoutConfig.cardDouble.prompt.fontSize };
        }
    }

    private addButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
        const layout = BonusLayoutConfig.cardDouble.buttons;
        const theme = BonusThemeConfig.cardDouble;
        const button = this.scene.add.rectangle(x, y, layout.width, layout.height, color).setStrokeStyle(theme.buttons.strokeWidth, theme.buttons.strokeColor).setInteractive();
        const text = this.scene.add.text(x, y, label, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.fontSize, color: theme.colors.primaryText, fontStyle: 'bold', align: 'center', wordWrap: { width: layout.width - 25 } }).setOrigin(0.5);

        button.on('pointerdown', () => {
            if (this.selectionLocked) {
                return;
            }

            this.selectionLocked = true;
            onClick();
        });

        this.container?.add([button, text]);
    }
}
