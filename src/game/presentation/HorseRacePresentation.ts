import { GameObjects, Scene, Time } from 'phaser';
import type { HorseRaceResult, HorseRaceRunner } from '../logic/HorseRaceFeature';

/** Tela modal e animação da Corrida de Colheitadeiras. */
export class HorseRacePresentation {

    horsespace = 160;

    private container?: GameObjects.Container;

    private readonly tractors: GameObjects.Container[] = [];

    private pendingTimer?: Time.TimerEvent;

    

    private selectionLocked = false;

    constructor(private readonly scene: Scene) {}

    public showSelection(runners: readonly HorseRaceRunner[], onSelect: (id: string) => void): void {
        this.clear();
        const { width, height } = this.scene.scale.gameSize;
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, 0x08150f, 0.96),
            this.scene.add.text(width / 2, 220, 'CORRIDA DE COLHEITADEIRAS', { fontFamily: 'Arial', fontSize: '46px', color: '#ffe06b', fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, 285, 'ESCOLHA SEU CORREDOR', { fontFamily: 'Arial', fontSize: '26px', color: '#ffffff' }).setOrigin(0.5),
        ];
        runners.forEach((runner, index) => {
            const y = 470 + index * this.horsespace;
            const button = this.scene.add.rectangle(width / 2, y, 780, 160, runner.color).setStrokeStyle(4, 0xffffff).setInteractive();
            const label = this.scene.add.text(width / 2, y, `🚜  ${runner.name}`, { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
            button.on('pointerdown', () => {
                if (this.selectionLocked) {
                    return;
                }

                this.selectionLocked = true;
                onSelect(runner.id);
            });
            items.push(button, label);
        });
        this.container = this.scene.add.container(0, 0, items).setDepth(500);
    }

    public playRace(result: HorseRaceResult, segmentDuration: number, onComplete: () => void): void {
        this.clear();
        const { width, height } = this.scene.scale.gameSize;
        const startX = 120;
        const trackWidth = width - 240;
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, 0x163c29),
            this.scene.add.text(width / 2, 130, 'CORRIDA DE COLHEITADEIRAS', { fontFamily: 'Arial', fontSize: '42px', color: '#ffe06b', fontStyle: 'bold' }).setOrigin(0.5),
        ];
        let completed = 0;
        const winnerTotal = result.runners[0].totalSpeed;
        result.runners.forEach((runner, index) => {
            const y = 390 + index * this.horsespace;
            items.push(this.scene.add.line(width / 2, y, startX, 0, width - 120, 0, 0xffffff, 0.5).setLineWidth(3));
            const tractor = this.scene.add.container(startX, y, [
                this.scene.add.rectangle(0, 0, 145, 78, runner.color).setStrokeStyle(3, 0xffffff),
                this.scene.add.text(0, 0, '🚜', { fontSize: '50px' }).setOrigin(0.5),
            ]);

            this.tractors.push(tractor);
            items.push(tractor);
            let distance = 0;
            const tweens = runner.speeds.map(speed => {
                distance += speed;
                return { x: startX + trackWidth * distance / winnerTotal, duration: segmentDuration, ease: 'Sine.easeInOut' };
            });
            this.scene.tweens.chain({
                targets: tractor,
                tweens,
                onComplete: () => {
                    completed++;

                    if (completed === result.runners.length) {
                        onComplete();
                    }
                },
            });
        });
        this.container = this.scene.add.container(0, 0, items).setDepth(500);
    }

    public showResult(result: HorseRaceResult, payout: number, duration: number, onComplete: () => void): void {
        this.clear();
        const { width, height } = this.scene.scale.gameSize;
        const prize = payout > 0 ? `PRÊMIO: ${payout.toFixed(2)}` : 'SEM PREMIAÇÃO';
        const items: GameObjects.GameObject[] = [
            this.scene.add.rectangle(width / 2, height / 2, width, height, 0x08150f, 0.96),
            this.scene.add.text(width / 2, 280, 'RESULTADO DA CORRIDA', { fontFamily: 'Arial', fontSize: '42px', color: '#ffe06b', fontStyle: 'bold' }).setOrigin(0.5),
            this.scene.add.text(width / 2, 360, 'PÓDIO FINAL', { fontFamily: 'Arial', fontSize: '30px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5),
        ];

        const podium = [
            { rank: 2, x: 270, height: 210, color: 0xc0c0c0 },
            { rank: 1, x: 540, height: 310, color: 0xffd54a },
            { rank: 3, x: 810, height: 145, color: 0xcd7f32 },
        ];

        podium.forEach(place => {
            const runner = result.runners.find(item => item.rank === place.rank);
            if (!runner) {
                return;
            }

            const baseY = 1190;
            const topY = baseY - place.height;
            items.push(
                this.scene.add.rectangle(place.x, baseY - place.height / 2, 220, place.height, place.color).setStrokeStyle(4, 0xffffff),
                this.scene.add.rectangle(place.x, topY - 62, 150, 72, runner.color).setStrokeStyle(3, 0xffffff),
                this.scene.add.text(place.x, topY - 62, `${place.rank}º`, { fontFamily: 'Arial', fontSize: '34px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5),
                this.scene.add.text(place.x, topY - 125, runner.name, { fontFamily: 'Arial', fontSize: '19px', color: '#ffffff', align: 'center', wordWrap: { width: 230 } }).setOrigin(0.5)
            );
        });

        items.push(
            this.scene.add.text(width / 2, 1450, `${result.selectedRank}º LUGAR\n${prize}`, { fontFamily: 'Arial', fontSize: '44px', color: payout > 0 ? '#ffe06b' : '#ffffff', align: 'center', fontStyle: 'bold' }).setOrigin(0.5)
        );

        this.container = this.scene.add.container(0, 0, items).setDepth(500);
        this.pendingTimer = this.scene.time.delayedCall(duration, () => {
            this.pendingTimer = undefined;
            this.clear();
            onComplete();
        });
    }

    public clear(): void {
        if (this.pendingTimer) {
            this.scene.time.removeEvent(this.pendingTimer);
            this.pendingTimer = undefined;
        }

        this.tractors.forEach(tractor => {
            this.scene.tweens.killTweensOf(tractor);
        });

        this.tractors.length = 0;
        this.selectionLocked = false;
        this.container?.destroy();
        this.container = undefined;
    }
}
