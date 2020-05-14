'use strict';

import GameTicTacToe from './GameTicTacToe.js';
import GameVisualInfo from './GameVisualInfo.js';

//создание новой игры "крестики нолики"
//незавсимый компонент без привязки к dom,
//при происхождении события, вызывается эвент
const game = new GameTicTacToe();

//визуальная информация игры,
//занимается созданием и обновлением dom, подписываясь на события GameTicTacToe
const gameVisualInfo = new GameVisualInfo(game);

//начать игру
game.startGame();