'use strict';
import Player from './Player.js';

//класс легкого компьютера
export class ComputerEasy extends Player {
    constructor(options) {
        super(options);
    }

    //при переходе хода на компьютера
    onMove(game) {
        //таймер
        setTimeout(() => {
            //получаем доступные клетки для хода
            const avaibleToMovePoints = game.getAvaibleToMovePoints();
            //выбираем индекс случайной доступной клетки
            const pointIndex = Math.floor(Math.random() * avaibleToMovePoints.length);
            //ходим
            this.gameMoveTo(avaibleToMovePoints[pointIndex].x, avaibleToMovePoints[pointIndex].y);
        }, 500);
    }
}

export class ComputerProfi extends Player {
    constructor(options) {
        super(options);
        this.maxDepth = options.maxDepth || 1000;
    }

    //при переходе хода на компьютера
    onMove(game) {
        //таймер
        setTimeout(() => {
            this.findMove(game);
        }, 500);
    }

    //найти ход
    findMove(game) {

        //айди x и o , для текущего игрока и протиника
        const curXOId = game.getXOInfoForCurrentMovePlayer().id;
        const opponentXOId = game.getXOInfoForOpponentMovePlayer().id;

        let map = game.map.slice(); //создаюм копию карты
        let movePoint; // точка куда сделаем ход

        //если X
        if (curXOId == 1) {

            //ищем максимум
            let bestScore = -Infinity;
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if (map[x][y] == 0) {

                        //времеено ставим в точку маркер
                        map[x][y] = curXOId;

                        //в минимакс алгоритме ищем по минимуму
                        //прогоняем по алгоритму, получаем очки, в случае, если сделать такой ход
                        const score = this.minimax(game, curXOId, opponentXOId, map, 0, this.maxDepth, false);
                        //обнуляем поставленный маркер
                        map[x][y] = 0;

                        //если счет больше чем лучший счет
                        if (score > bestScore || score == bestScore && Math.random() > 0.8) {
                            bestScore = score;
                            //запоминаем точку куда должны пойти
                            movePoint = { x, y };
                        }
                    }
                }
            }

            //Если О
        } else {
            //ищем минимум
            let bestScore = Infinity;
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if (map[x][y] == 0) {

                        map[x][y] = curXOId;

                        //в минимакс алгоритме ищем по максимому
                        const score = this.minimax(game, opponentXOId, curXOId, map, 0, this.maxDepth, true);
                        map[x][y] = 0;

                        //если счет меньше чем лучший счет
                        if (score < bestScore || score == bestScore && Math.random() > 0.8) {
                            bestScore = score;
                            //запоминаем точку куда должны пойти
                            movePoint = { x, y };
                        }
                    }
                }
            }
        }

        //ходим по точке
        this.gameMoveTo(movePoint.x, movePoint.y);
    }

    minimax(game, curXOId, opponentXOId, map, depth, maxDepth, isMaximize) {

        if (depth > maxDepth) {
            return 0;
        }

        //проверка на победу игрока
        if (game.checkWin(curXOId, map)) {
            return curXOId;
        }

        //проверка на победу соперника
        if (game.checkWin(opponentXOId, map)) {
            return opponentXOId;
        }
        //проверка на ничью
        if (game.checkDraw(map)) {
            return 0;
        }

        //ищем максимум
        if (isMaximize) {
            //выбор выгодного нам хода
            let bestScore = -Infinity;
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if (map[x][y] == 0) {
                        //времеено ставим в точку маркер
                        map[x][y] = curXOId;
                        //прогоняем по алгоритму, получаем очки, в случае, если сделать такой ход
                        const score = this.minimax(game, curXOId, opponentXOId, map, depth + 1, maxDepth, false);
                        //обнуляем поставленный маркер
                        map[x][y] = 0;

                        //выбираем максимальное знвчение
                        bestScore = Math.max(bestScore, score);
                    }
                }
            }
            return bestScore;
            //ищем минимум
        } else {
            //выбор противника не выгодного нам хода
            let bestScore = Infinity;
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if (map[x][y] == 0) {
                        map[x][y] = opponentXOId;
                        const score = this.minimax(game, curXOId, opponentXOId, map, depth + 1, maxDepth, true);
                        map[x][y] = 0;
                        //выбираем минмальное знвчение
                        bestScore = Math.min(bestScore, score);
                    }
                }
            }
            return bestScore;
        }
    }
}