import { GameObjects, Scene } from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';
import { BonusThemeConfig } from '../config/BonusThemeConfig';
import type { HorseRaceResult, HorseRaceRunner } from '../logic/HorseRaceFeature';
import { Money } from '../logic/Money';

/** Interface visual da Corrida de Tratores, isolada das regras de prêmio. */
export class HorseRacePresentation {
    private container?: GameObjects.Container;

    private readonly tractors: GameObjects.Container[] = [];

    private winnerHighlight?: GameObjects.Rectangle;

    private selectionLocked = false;

    constructor(private readonly scene: Scene) {}

    public showSelection(runners: readonly HorseRaceRunner[], onSelect: (id: string) => void): void {
        this.clear();
        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.horseRace.selection;
        const theme = BonusThemeConfig.horseRace;
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, theme.selection.overlayColor, theme.selection.overlayAlpha),
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, theme.selection.headerColor),
            this.scene.add.text(width / 2, layout.header.eyebrowY, 'GRANDE PRÊMIO DA COLHEITA', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.eyebrowFontSize, color: theme.colors.highlight, letterSpacing: layout.header.eyebrowLetterSpacing }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.titleY, 'CORRIDA DE TRATORES', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: theme.colors.primaryText, fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.subtitleY, 'ESCOLHA O SEU CORREDOR', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.subtitleFontSize, color: theme.colors.secondaryText }).setOrigin(0.5),
        ];

        runners.forEach((runner, index) => {
            const x = layout.cards.columns[index % 2];
            const y = layout.cards.firstY + Math.floor(index / 2) * layout.cards.rowGap;
            const card = this.scene.add.rectangle(x, y, layout.cards.width, layout.cards.height, theme.selection.cardColor).setStrokeStyle(theme.selection.cardStrokeWidth, runner.color).setInteractive();
            const tractor = this.createTractor(
                x,
                y + layout.cards.tractorOffsetY,
                runner,
                layout.cards.tractorWidth
            );
            const label = this.scene.add.text(x, y + layout.cards.labelOffsetY, runner.name, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.cards.labelFontSize, color: theme.colors.primaryText, fontStyle: 'bold', align: 'center', wordWrap: { width: layout.cards.labelWidth } }).setOrigin(0.5);
            card.on('pointerdown', () => {
                if (this.selectionLocked) return;
                this.selectionLocked = true;
                onSelect(runner.id);
            });
            card.on('pointerover', () => card.setScale(1.03));
            card.on('pointerout', () => card.setScale(1));
            items.push(card, tractor, label);
        });

        this.container = this.scene.add.container(0, 0, items).setDepth(BonusLayoutConfig.horseRace.depth);
    }

    public playRace(result: HorseRaceResult, segmentDuration: number, onComplete: () => void): void {
        this.clear();
        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.horseRace.race;
        const theme = BonusThemeConfig.horseRace;
        const startX = layout.track.startX;
        const finishX = width - layout.track.finishRight;
        const trackWidth = finishX - startX;
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, theme.race.backgroundColor),
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, theme.race.headerColor),
            this.scene.add.text(width / 2, layout.header.titleY, 'CORRIDA DE TRATORES', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5),
        ];

        const trackBottom = layout.track.firstLaneY +
            (result.runners.length - 0.5) *
                layout.track.laneHeight;

        for (let segment = 1; segment < result.segmentCount; segment++) {
            const x = startX + trackWidth * segment / result.segmentCount;
            items.push(this.scene.add.line(x, 0, 0, layout.track.dividerTop, 0, trackBottom, theme.race.dividerColor, theme.race.dividerAlpha).setLineWidth(theme.race.dividerWidth));
        }

        let completed = 0;
        const tractorItems: GameObjects.Container[] = [];
        result.runners.forEach((runner, index) => {
            const y = layout.track.firstLaneY + index * layout.track.laneHeight;
            items.push(
                this.scene.add.rectangle(width / 2, y, trackWidth + layout.track.laneExtraWidth, layout.track.laneHeight - layout.track.laneInset, theme.race.laneColors[index % theme.race.laneColors.length], theme.race.laneAlpha),
                this.scene.add.text(layout.track.laneLabelX, y, `${index + 1}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.track.laneLabelFontSize, color: theme.colors.secondaryText, fontStyle: 'bold' }).setOrigin(0.5)
            );
            if (runner.id === result.selectedRunnerId) {
                items.push(
                    this.createSelectedIndicator(
                        layout.track.selectedIndicatorX,
                        y,
                        layout.track.selectedIndicatorWidth,
                        layout.track.selectedIndicatorHeight
                    )
                );
            }
            const tractor = this.createTractor(
                startX,
                y,
                runner,
                layout.track.tractorWidth
            );
            this.tractors.push(tractor);
            tractorItems.push(tractor);
            let accumulated = 0;
            const tweens = runner.speeds.map(speed => {
                accumulated += speed;
                return {
                    x: startX + trackWidth * accumulated / result.winningTotal,
                    duration: segmentDuration,
                    ease: 'Sine.easeInOut',
                };
            });
            this.scene.tweens.chain({ targets: tractor, tweens, onComplete: () => { completed++; if (completed === result.runners.length) onComplete(); } });
        });

        // A faixa fica acima do piso, mas abaixo dos tratores em movimento.
        items.push(
            this.createFinishLine(finishX, result.runners.length),
            ...tractorItems
        );
        this.container = this.scene.add.container(0, 0, items).setDepth(BonusLayoutConfig.horseRace.depth);
    }

    public showResult(result: HorseRaceResult, payout: number, onComplete: () => void): void {
        if (!this.container) {
            return;
        }

        const { width } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.horseRace.podium;
        const theme = BonusThemeConfig.horseRace;
        this.showWinnerHighlight(result);
        const items: GameObjects.GameObject[] = [
            this.scene.add.text(width / 2, layout.titleY, 'PÓDIO DA COLHEITA', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.titleFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5),
        ];

        const podiumEntries: Array<{
            block: GameObjects.Rectangle;
            content: GameObjects.GameObject[];
        }> = [];

        [1, 2, 3].forEach(rank => {
            const place = layout.places.find(
                item => item.rank === rank
            );

            if (!place) {
                return;
            }

            const runner = result.runners.find(item => item.rank === place.rank);
            if (!runner) {
                return;
            }

            const baseY = layout.baseY;
            const topY = baseY - place.height;
            const reveal = theme.podium.reveal;
            const block = this.scene.add.rectangle(
                place.x,
                baseY,
                layout.blockWidth,
                place.height,
                place.color
            )
                .setOrigin(0.5, 1)
                .setScale(1, 0)
                .setStrokeStyle(
                    theme.podium.strokeWidth,
                    theme.podium.strokeColor
                );
            const tractor = this.createTractor(
                place.x,
                topY + layout.runner.tractorOffsetY + reveal.contentOffsetY,
                runner,
                layout.runner.tractorWidth
            ).setAlpha(0);
            const rankText = this.scene.add.text(
                place.x,
                topY +
                    layout.runner.rankOffsetY +
                    reveal.contentOffsetY,
                `${place.rank}º`,
                {
                    fontFamily: BonusThemeConfig.fontFamily,
                    fontSize: layout.runner.rankFontSize,
                    color: theme.colors.darkText,
                    fontStyle: 'bold',
                }
            ).setOrigin(0.5).setAlpha(0);
            const content: GameObjects.GameObject[] = [
                tractor,
                rankText,
            ];

            items.push(
                block,
                tractor,
                rankText
            );

            if (runner.id === result.selectedRunnerId) {
                const selectedIndicator =
                    this.createSelectedIndicator(
                        place.x,
                        topY +
                            layout.runner
                                .selectedIndicatorOffsetY +
                            reveal.contentOffsetY,
                        layout.runner.selectedIndicatorWidth,
                        layout.runner.selectedIndicatorHeight,
                        'down'
                    ).setAlpha(0);

                items.push(selectedIndicator);
                content.push(selectedIndicator);
            }

            podiumEntries.push({
                block,
                content,
            });
        });
        const prize = payout > 0 ? `PRÊMIO ${Money.format(payout)}` : 'SEM PREMIAÇÃO';
        const prizeText = this.scene.add.text(width / 2, layout.prizeY, `SEU TRATOR: ${result.selectedRank}º LUGAR\n${prize}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.prizeFontSize, color: payout > 0 ? theme.colors.highlight : theme.colors.primaryText, align: 'center', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0);
        const continueButton = this.scene.add.rectangle(width / 2, layout.continueButton.y, layout.continueButton.width, layout.continueButton.height, theme.podium.buttonColor).setStrokeStyle(theme.podium.buttonStrokeWidth, theme.podium.buttonStrokeColor).setAlpha(0);
        const continueText = this.scene.add.text(width / 2, layout.continueButton.y, 'CONTINUAR', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.continueButton.fontSize, color: theme.colors.primaryText, fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0);
        continueButton.on('pointerdown', () => {
            if (this.selectionLocked) return;
            this.selectionLocked = true;
            this.clear();
            onComplete();
        });
        items.push(
            prizeText,
            continueButton,
            continueText
        );
        this.container.add(items);

        this.animatePodium(
            podiumEntries,
            [prizeText, continueButton, continueText],
            () => continueButton.setInteractive()
        );
    }

    private animatePodium(
        entries: Array<{
            block: GameObjects.Rectangle;
            content: GameObjects.GameObject[];
        }>,
        controls: GameObjects.GameObject[],
        onComplete: () => void
    ): void {
        const reveal =
            BonusThemeConfig.horseRace.podium.reveal;

        if (entries.length === 0) {
            onComplete();

            return;
        }

        const entryDuration =
            reveal.blockDuration +
            reveal.contentDuration +
            reveal.stepDelay;

        entries.forEach((entry, index) => {
            this.scene.tweens.add({
                targets: entry.block,
                scaleY: 1,
                delay: index * entryDuration,
                duration: reveal.blockDuration,
                ease: 'Back.easeOut',
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: entry.content,
                        alpha: 1,
                        y: `-=${reveal.contentOffsetY}`,
                        duration: reveal.contentDuration,
                        ease: 'Sine.easeOut',
                        onComplete: () => {
                            if (index !== entries.length - 1) {
                                return;
                            }

                            this.scene.tweens.add({
                                targets: controls,
                                alpha: 1,
                                duration: reveal.contentDuration,
                                ease: 'Sine.easeOut',
                                onComplete,
                            });
                        },
                    });
                },
            });
        });
    }

    public clear(): void {
        this.tractors.forEach(tractor => this.scene.tweens.killTweensOf(tractor));
        this.tractors.length = 0;
        if (this.winnerHighlight) {
            this.scene.tweens.killTweensOf(this.winnerHighlight);
        }
        this.winnerHighlight = undefined;
        this.selectionLocked = false;
        this.container?.destroy();
        this.container = undefined;
    }

    private createTractor(
        x: number,
        y: number,
        runner: HorseRaceRunner,
        width: number
    ): GameObjects.Container {
        const tractorImage = this.scene.add.image(
            0,
            0,
            runner.textureKey
        ).setDisplaySize(
            width,
            width
        );

        return this.scene.add.container(
            x,
            y,
            [tractorImage]
        );
    }

    /** Marca visualmente o trator escolhido sem adicionar texto à interface. */
    private createSelectedIndicator(
        x: number,
        y: number,
        width: number,
        height: number,
        direction: 'down' | 'right' = 'right'
    ): GameObjects.Triangle {
        const points = direction === 'down'
            ? [0, 0, width, 0, width / 2, height]
            : [0, 0, width, height / 2, 0, height];

        return this.scene.add.triangle(
            x,
            y,
            ...points,
            BonusThemeConfig.horseRace.race
                .selectedIndicatorColor
        ).setOrigin(0.5);
    }

    /** Destaca a pista vencedora sem alterar os tratores congelados. */
    private showWinnerHighlight(result: HorseRaceResult): void {
        const winnerLaneIndex = result.runners.findIndex(
            runner => runner.rank === 1
        );

        if (winnerLaneIndex < 0 || !this.container) {
            return;
        }

        const { width } = this.scene.scale.gameSize;
        const track = BonusLayoutConfig.horseRace.race.track;
        const highlight = BonusThemeConfig.horseRace.race.winnerHighlight;
        const finishX = width - track.finishRight;
        const trackWidth = finishX - track.startX;
        const y = track.firstLaneY +
            winnerLaneIndex * track.laneHeight;

        this.winnerHighlight = this.scene.add.rectangle(
            width / 2,
            y,
            trackWidth + track.laneExtraWidth,
            track.laneHeight - track.laneInset,
            highlight.color,
            0
        ).setStrokeStyle(
            highlight.strokeWidth,
            highlight.color
        );

        const firstTractorIndex =
            this.container.list.indexOf(
                this.tractors[0]
            );

        this.container.addAt(
            this.winnerHighlight,
            Math.max(0, firstTractorIndex)
        );

        this.scene.tweens.add({
            targets: this.winnerHighlight,
            alpha: highlight.minAlpha,
            duration: highlight.duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    /** Cria uma única linha quadriculada com altura baseada nas pistas exibidas. */
    private createFinishLine(x: number, runnerCount: number): GameObjects.Container {
        const track = BonusLayoutConfig.horseRace.race.track;
        const finishLine = track.finishLine;
        const checkerSize = finishLine.checkerSize;
        const top = track.firstLaneY - track.laneHeight / 2 - finishLine.edgeOffset;
        const bottom = track.firstLaneY + (runnerCount - 0.5) * track.laneHeight + finishLine.edgeOffset;
        const height = bottom - top;
        const width = checkerSize * finishLine.columns;
        const cells: GameObjects.Rectangle[] = [];

        for (let rowTop = 0, row = 0; rowTop < height; rowTop += checkerSize, row++) {
            const cellHeight = Math.min(checkerSize, height - rowTop);
            for (let column = 0; column < finishLine.columns; column++) {
                const colorIndex = (row + column) % BonusThemeConfig.horseRace.race.finishCheckerColors.length;
                cells.push(this.scene.add.rectangle(
                    column * checkerSize + checkerSize / 2,
                    rowTop + cellHeight / 2,
                    checkerSize,
                    cellHeight,
                    BonusThemeConfig.horseRace.race.finishCheckerColors[colorIndex]
                ));
            }
        }

        return this.scene.add.container(x - width / 2, top, cells);
    }
}
