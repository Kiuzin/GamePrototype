import { GameObjects, Scene } from 'phaser';
import { BonusLayoutConfig } from '../config/BonusLayoutConfig';
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
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, 0x07140e, 0.98),
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, 0x153b28),
            this.scene.add.text(width / 2, layout.header.eyebrowY, 'GRANDE PRÊMIO DA COLHEITA', { fontFamily: 'Arial', fontSize: '25px', color: '#ffe06b', letterSpacing: 4 }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.titleY, 'CORRIDA DE TRATORES', { fontFamily: 'Arial', fontSize: '48px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, layout.header.subtitleY, 'ESCOLHA O SEU CORREDOR', { fontFamily: 'Arial', fontSize: '24px', color: '#b9d8bf' }).setOrigin(0.5),
        ];

        runners.forEach((runner, index) => {
            const x = layout.cards.columns[index % 2];
            const y = layout.cards.firstY + Math.floor(index / 2) * layout.cards.rowGap;
            const card = this.scene.add.rectangle(x, y, layout.cards.width, layout.cards.height, 0x173b29).setStrokeStyle(4, runner.color).setInteractive();
            const tractor = this.createTractor(x, y + layout.cards.tractorOffsetY, runner.color, 1.35);
            const label = this.scene.add.text(x, y + layout.cards.labelOffsetY, runner.name, { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: 370 } }).setOrigin(0.5);
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
        const startX = layout.track.startX;
        const finishX = width - layout.track.finishRight;
        const trackWidth = finishX - startX;
        const segmentText = this.scene.add.text(width / 2, layout.header.segmentY, `TRECHO 1 / ${result.segmentCount}`, { fontFamily: 'Arial', fontSize: '24px', color: '#d7edcf', letterSpacing: 2 }).setOrigin(0.5);
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, 0x184c31),
            this.scene.add.rectangle(width / 2, layout.header.y, width, layout.header.height, 0x102d20),
            this.scene.add.text(width / 2, layout.header.titleY, 'CORRIDA DE TRATORES', { fontFamily: 'Arial', fontSize: '39px', color: '#ffe06b', fontStyle: 'bold' }).setOrigin(0.5),
            segmentText,
        ];

        for (let segment = 1; segment < result.segmentCount; segment++) {
            const x = startX + trackWidth * segment / result.segmentCount;
            items.push(this.scene.add.line(x, 0, 0, 270, 0, height - 120, 0xffffff, 0.15).setLineWidth(2));
        }

        let completed = 0;
        result.runners.forEach((runner, index) => {
            const y = layout.track.firstLaneY + index * layout.track.laneHeight;
            items.push(
                this.scene.add.rectangle(width / 2, y, trackWidth + layout.track.laneExtraWidth, layout.track.laneHeight - layout.track.laneInset, index % 2 === 0 ? 0x265e3d : 0x215536, 0.95),
                this.scene.add.text(layout.track.laneLabelX, y, `${index + 1}`, { fontFamily: 'Arial', fontSize: '23px', color: '#d7edcf', fontStyle: 'bold' }).setOrigin(0.5),
                this.scene.add.line(finishX, y, 0, -50, 0, 70, 0xffffff, 0.9).setLineWidth(6)
            );
            const tractor = this.createTractor(startX, y, runner.color, 0.78);
            this.tractors.push(tractor);
            items.push(tractor);
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
        this.container = this.scene.add.container(0, 0, items).setDepth(BonusLayoutConfig.horseRace.depth);
    }

    public showResult(result: HorseRaceResult, payout: number, onComplete: () => void): void {
        this.clear();
        const { width, height } = this.scene.scale.gameSize;
        const layout = BonusLayoutConfig.horseRace.podium;
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, 0x07140e, 0.98),
            this.scene.add.text(width / 2, layout.titleY, 'PÓDIO DA COLHEITA', { fontFamily: 'Arial', fontSize: '46px', color: '#ffe06b', fontStyle: 'bold' }).setOrigin(0.5),
        ];
        layout.places.forEach(place => {
            const runner = result.runners.find(item => item.rank === place.rank);
            if (!runner) return;
            const baseY = layout.baseY;
            const topY = baseY - place.height;
            items.push(
                this.scene.add.rectangle(place.x, baseY - place.height / 2, 235, place.height, place.color).setStrokeStyle(4, 0xffffff),
                this.createTractor(place.x, topY - 55, runner.color, 0.64),
                this.scene.add.text(place.x, topY + 42, `${place.rank}º`, { fontFamily: 'Arial', fontSize: '38px', color: '#102d20', fontStyle: 'bold' }).setOrigin(0.5),
                this.scene.add.text(place.x, topY - 120, runner.name, { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', wordWrap: { width: 230 }, align: 'center' }).setOrigin(0.5)
            );
        });
        const prize = payout > 0 ? `PRÊMIO ${payout.toFixed(2)}` : 'SEM PREMIAÇÃO';
        const continueButton = this.scene.add.rectangle(width / 2, layout.continueButton.y, layout.continueButton.width, layout.continueButton.height, 0xd28b21).setStrokeStyle(3, 0xffe06b).setInteractive();
        const continueText = this.scene.add.text(width / 2, layout.continueButton.y, 'CONTINUAR', { fontFamily: 'Arial', fontSize: '31px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        continueButton.on('pointerdown', () => {
            if (this.selectionLocked) return;
            this.selectionLocked = true;
            this.clear();
            onComplete();
        });
        items.push(
            this.scene.add.text(width / 2, layout.prizeY, `SEU TRATOR: ${result.selectedRank}º LUGAR\n${prize}`, { fontFamily: 'Arial', fontSize: '37px', color: payout > 0 ? '#ffe06b' : '#ffffff', align: 'center', fontStyle: 'bold' }).setOrigin(0.5),
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
            this.scene.add.rectangle(0, 3, 108, 70, color).setStrokeStyle(3, 0xffffff),
            this.scene.add.text(0, 0, '🚜', { fontSize: '68px' }).setOrigin(0.5),
        ]);
        tractor.setScale(scale);
        return tractor;
    }
}
