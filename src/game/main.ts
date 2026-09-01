import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { SlotMachine } from './scenes/SlotMachine';
import { CANVAS, Game, Scale } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { GameConfig } from './config/GameConfig';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: CANVAS,
    width: GameConfig.screen.width,
    height: GameConfig.screen.height,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        SlotMachine,
    ],
};

const startGame = (parent: string): Game => {
    return new Game({ ...config, parent });
};

export default startGame;
