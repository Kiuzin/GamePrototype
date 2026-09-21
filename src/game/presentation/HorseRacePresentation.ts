import { GameObjects, Scene } from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';
import { BonusThemeConfig } from '../config/BonusThemeConfig';
import type { HorseRaceResult, HorseRaceRunner } from '../logic/HorseRaceFeature';

/** Interface visual da Corrida de Tratores, isolada das regras de prêmio. */
export class HorseRacePresentation {
    private container?: GameObjects.Container;

    private readonly tractors: GameObjects.Container[] = [];

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
            const tractor = this.createTractor(x, y + layout.cards.tractorOffsetY, runner.color, layout.cards.tractorScale);
            const label = this.scene.add.text(x, y + layout.cards.labelOffsetY, runner.name, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.cards.labelFontSize, color: theme.colors.primaryText, fontStyle: 'bold', align: 'center', wordWrap: { width: layout.cards.labelWidth } }).setOrigin(0.5);
            card.on('pointerdown', () => {
                if (this.selectionLocked) return;
                this.selectionLocked = true;
                onSelect(runner.id);
            });
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
        const segmentText = this.scene.add.text(width / 2, layout.header.segmentY, `TRECHO 1 / ${result.segmentCount}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.segmentFontSize, color: theme.colors.secondaryText, letterSpacing: layout.header.segmentLetterSpacing }).setOrigin(0.5);
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, theme.race.backgroundColor),
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, theme.race.headerColor),
            this.scene.add.text(width / 2, layout.header.titleY, 'CORRIDA DE TRATORES', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.header.titleFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5),
            segmentText,
        ];

        for (let segment = 1; segment < result.segmentCount; segment++) {
            const x = startX + trackWidth * segment / result.segmentCount;
            items.push(this.scene.add.line(x, 0, 0, layout.track.dividerTop, 0, height - layout.track.dividerBottomOffset, theme.race.dividerColor, theme.race.dividerAlpha).setLineWidth(theme.race.dividerWidth));
        }

        let completed = 0;
        const tractorItems: GameObjects.Container[] = [];
        result.runners.forEach((runner, index) => {
            const y = layout.track.firstLaneY + index * layout.track.laneHeight;
            items.push(
                this.scene.add.rectangle(width / 2, y, trackWidth + layout.track.laneExtraWidth, layout.track.laneHeight - layout.track.laneInset, theme.race.laneColors[index % theme.race.laneColors.length], theme.race.laneAlpha),
                this.scene.add.text(layout.track.laneLabelX, y, `${index + 1}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.track.laneLabelFontSize, color: theme.colors.secondaryText, fontStyle: 'bold' }).setOrigin(0.5)
            );
            const tractor = this.createTractor(startX, y, runner.color, layout.track.tractorScale);
            this.tractors.push(tractor);
            tractorItems.push(tractor);
            let accumulated = 0;
            const tweens = runner.speeds.map((speed, segment) => {
                accumulated += speed;
                return {
                    x: startX + trackWidth * accumulated / result.winningTotal,
                    duration: segmentDuration,
                    ease: 'Sine.easeInOut',
                    onStart: () => segmentText.setText(`TRECHO ${segment + 1} / ${result.segmentCount}`),
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
        this.clear();
        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.horseRace.podium;
        const theme = BonusThemeConfig.horseRace;
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, theme.podium.overlayColor, theme.podium.overlayAlpha),
            this.scene.add.text(width / 2, layout.titleY, 'PÓDIO DA COLHEITA', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.titleFontSize, color: theme.colors.highlight, fontStyle: 'bold' }).setOrigin(0.5),
        ];
        layout.places.forEach(place => {
            const runner = result.runners.find(item => item.rank === place.rank);
            if (!runner) return;
            const baseY = layout.baseY;
            const topY = baseY - place.height;
            items.push(
                this.scene.add.rectangle(place.x, baseY - place.height / 2, layout.blockWidth, place.height, place.color).setStrokeStyle(theme.podium.strokeWidth, theme.podium.strokeColor),
                this.createTractor(place.x, topY + layout.runner.tractorOffsetY, runner.color, layout.runner.tractorScale),
                this.scene.add.text(place.x, topY + layout.runner.rankOffsetY, `${place.rank}º`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.runner.rankFontSize, color: theme.colors.darkText, fontStyle: 'bold' }).setOrigin(0.5),
                this.scene.add.text(place.x, topY + layout.runner.nameOffsetY, runner.name, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.runner.nameFontSize, color: theme.colors.primaryText, wordWrap: { width: layout.runner.nameWidth }, align: 'center' }).setOrigin(0.5)
            );
        });
        const prize = payout > 0 ? `PRÊMIO ${payout.toFixed(2)}` : 'SEM PREMIAÇÃO';
        const continueButton = this.scene.add.rectangle(width / 2, layout.continueButton.y, layout.continueButton.width, layout.continueButton.height, theme.podium.buttonColor).setStrokeStyle(theme.podium.buttonStrokeWidth, theme.podium.buttonStrokeColor).setInteractive();
        const continueText = this.scene.add.text(width / 2, layout.continueButton.y, 'CONTINUAR', { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.continueButton.fontSize, color: theme.colors.primaryText, fontStyle: 'bold' }).setOrigin(0.5);
        continueButton.on('pointerdown', () => {
            if (this.selectionLocked) return;
            this.selectionLocked = true;
            this.clear();
            onComplete();
        });
        items.push(
            this.scene.add.text(width / 2, layout.prizeY, `SEU TRATOR: ${result.selectedRank}º LUGAR\n${prize}`, { fontFamily: BonusThemeConfig.fontFamily, fontSize: layout.prizeFontSize, color: payout > 0 ? theme.colors.highlight : theme.colors.primaryText, align: 'center', fontStyle: 'bold' }).setOrigin(0.5),
            continueButton,
            continueText
        );
        this.container = this.scene.add.container(0, 0, items).setDepth(BonusLayoutConfig.horseRace.depth);
    }

    public clear(): void {
        this.tractors.forEach(tractor => this.scene.tweens.killTweensOf(tractor));
        this.tractors.length = 0;
        this.selectionLocked = false;
        this.container?.destroy();
        this.container = undefined;
    }

    private createTractor(x: number, y: number, color: number, scale: number): GameObjects.Container {
        const tractor = this.scene.add.container(x, y, [
            this.scene.add.rectangle(0, BonusThemeConfig.horseRace.tractor.bodyY, BonusThemeConfig.horseRace.tractor.bodyWidth, BonusThemeConfig.horseRace.tractor.bodyHeight, color).setStrokeStyle(BonusThemeConfig.horseRace.tractor.strokeWidth, BonusThemeConfig.horseRace.podium.strokeColor),
            this.scene.add.text(0, 0, BonusThemeConfig.horseRace.tractor.emoji, { fontSize: BonusThemeConfig.horseRace.tractor.emojiFontSize }).setOrigin(0.5),
        ]);
        tractor.setScale(scale);
        return tractor;
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
