'use strict';
import { ComputerEasy, ComputerProfi } from './Computers.js';
import Human from './Human.js';

// компонент игры
//незавсимый компонент без привязки к dom,
//при происхождении события, вызывается эвент
export default class GameTicTacToe {
    constructor(options) {
        this.playerMove = 0; // индекс игрока, который ходит
        this.map = []; // o - нолик, 0 - обычный, x - крестик
        this.gameCount = 0; //количество сыгранных игр
        this.playersTemplateIndex = 1;

        //шаблоны игроков, при необходимости можно написать еще сложность для компьютеров в отдельном классе и добавить в шаблон
        this.playersTemplates = [
            { firstPlayer: { comp: Human, options: { name: 'Игрок 1' } }, secondPlayer: { comp: Human, options: { name: 'Игрок 2' } } },
            { firstPlayer: { comp: Human, options: { name: 'Игрок' } }, secondPlayer: { comp: ComputerEasy, options: { name: 'Легкий компьютер' } } },
            { firstPlayer: { comp: Human, options: { name: 'Игрок' } }, secondPlayer: { comp: ComputerProfi, options: { name: 'Средний компьютер', maxDepth: 1 } } },
            { firstPlayer: { comp: Human, options: { name: 'Игрок' } }, secondPlayer: { comp: ComputerProfi, options: { name: 'Сложный компьютер' } } }];
        // { firstPlayer: { comp: ComputerEasy, options: { name: 'Легкий компьютер' } }, secondPlayer: { comp: ComputerProfi, options: { name: 'Сложный компьютер' } } },
        // { firstPlayer: { comp: ComputerEasy, options: { name: 'Легкий компьютер 1' } }, secondPlayer: { comp: ComputerProfi, options: { name: 'Легкий компьютер 2' } } },
        // { firstPlayer: { comp: ComputerProfi, options: { name: 'Сложный компьютер 1' } }, secondPlayer: { comp: ComputerProfi, options: { name: 'Сложный компьютер 2' } } }];

        //информация x - крестик, o - нолик
        this.XOInfo = [
            { id: 1, value: 'X' },
            { id: -1, value: 'O' }];
        this.curPlayerIndex = 0;
        this.state = 'play';
        // обнуление карты
        if (!this.map)
            this.createMap();
    }

    //инциализация игроков, playersTemplateIndex - индекс шаблона
    initPlayers(playersTemplateIndex) {
        //текущий шаблон
        const playersTemplate = this.playersTemplates[playersTemplateIndex || 0];
        //шаблон первого игрока
        const firstPlayer = playersTemplate.firstPlayer;
        //шаблон второго игрока
        const secondPlayer = playersTemplate.secondPlayer;
        //массив игроков
        this.players = [];
        //добавление игроков в массив
        this.players.push(new firstPlayer.comp({ ...firstPlayer.options, game: this, index: 0 }));
        this.players.push(new secondPlayer.comp({ ...secondPlayer.options, game: this, index: 1 }));

        const event = new CustomEvent('initPlayers', { detail: { players: this.players } });
        document.dispatchEvent(event);
    }

    //получение доступных для хода точек
    getAvaibleToMovePoints() {
        let points = [];
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                if (this.canMoveTo(x, y)) {
                    points.push({ x, y });
                }
            }
        }

        return points;
    }

    //получение информации об X или O для текущего игрока, который ходит
    getXOInfoForCurrentMovePlayer() {
        return this.XOInfo[this.xoIndex];
    }

    //получение информации об X или O для противника
    getXOInfoForOpponentMovePlayer() {
        return this.XOInfo[(this.xoIndex + 1) % this.XOInfo.length];
    }

    //начать игру
    startGame() {
        this.initPlayers(this.playersTemplateIndex);//инициализация игроков
        this.state = 'play'; // измение состояниие компонента
        this.gameCount = 0;
        this.reset();
        //вызываем эвент начала игры
        const event = new CustomEvent('startGame');
        document.dispatchEvent(event);
    }

    reset() {
        this.createMap(); // очистка карты
        this.playerMove = ((this.gameCount + 1) % 2);//индекс игрока, кто первым ходит
        this.xoIndex = 1;//в начале хода ставится 1 - X или 0 - О
        this.gameCount++;//увеличиваем кол-во игр
        this.nextMove();//передаем ход
    }

    restartGame() {
        this.state = 'play'; // измение состояниие компонента
        this.reset();
        //вызываем эвент рестарта игры
        const event = new CustomEvent('restartGame');
        document.dispatchEvent(event);
    }

    //инциализация и обнуление карты
    createMap() {
        this.map = [];
        for (let i = 0; i < 3; i++) {
            this.map[i] = [];
            for (let j = 0; j < 3; j++) {
                this.map[i][j] = 0;
            }
        }
    }

    //проверка на ничью
    checkDraw(map) {
        let draw = true;
        //пробежаться по карте и проверить доступные для хода клетки
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (map[i][j] == 0) {
                    draw = false;
                    break;
                }
            }
        }

        return draw;
    }

    //проверка на победу, возврщает комбинацию победы или false
    checkWin(XOId, map) {

        //по строкам
        for (let i = 0; i < 3; i++) {
            if (map[i][0] == XOId && map[i][1] == XOId && map[i][2] == XOId) {
                return [{ x: i, y: 0 }, { x: i, y: 1 }, { x: i, y: 2 }];
            }
        }

        //по столбцам
        for (let i = 0; i < 3; i++) {
            if (map[0][i] == XOId && map[1][i] == XOId && map[2][i] == XOId) {
                return [{ x: 0, y: i }, { x: 1, y: i }, { x: 2, y: i }];
            }
        }

        //по диагонали
        if (map[0][0] == XOId && map[1][1] == XOId && map[2][2] == XOId) {
            return [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }];
        }

        //по обратной диагонали
        if (map[2][0] == XOId && map[1][1] == XOId && map[0][2] == XOId) {
            return [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }];
        }

        return false;
    }

    //можно ли сделать ход на клетку по координатам
    canMoveTo(x, y) {
        if (this.map[x][y] == 0)
            return true;
        return false;
    }

    //сделать ход по координатам, index - индекс игрока, который хочет сделать ход
    moveTo(index, x, y) {
        //если индекс не совпадает с игроком, который ходит, не позволяем сделать ход
        if (this.playerMove != index || this.state != 'play')
            return false;

        //может ли пойти игрок по координатам
        if (this.canMoveTo(x, y)) {
            //задаем id карте
            this.map[x][y] = this.XOInfo[this.xoIndex].id;

            //выполняем эвент хода игрока
            const event = new CustomEvent('moveTo', { detail: { x, y, XOInfo: this.XOInfo[this.xoIndex], player: this.players[this.playerMove] } });
            document.dispatchEvent(event);

            //проверяем на победу
            const winningCombination = this.checkWin(this.XOInfo[this.xoIndex].id, this.map);

            //если комбинации победы есть
            if (winningCombination) {
                this.state = 'win';

                if (this.curPlayerIndex == this.playerMove) {
                    //выполняем эвент заврешения игры с результатом победа и с информацией об игроке
                    const event = new CustomEvent('endGame', { detail: { result: 'win', XOInfo: this.XOInfo[this.xoIndex], player: this.players[this.playerMove], winningCombination } });
                    document.dispatchEvent(event);
                } else {
                    //выполняем эвент заврешения игры с результатом проигрыш и с информацией о победившем игроке
                    const event = new CustomEvent('endGame', { detail: { result: 'lose', XOInfo: this.XOInfo[this.xoIndex], player: this.players[this.playerMove], winningCombination } });
                    document.dispatchEvent(event);
                }

                //проверка на ничью
            } else if (this.checkDraw(this.map)) {

                this.state = 'draw';

                //выполняем эвент заврешения игры с результатом ничья
                const event = new CustomEvent('endGame', { detail: { result: 'draw' } });
                document.dispatchEvent(event);
            } else {
                //следующий ход
                this.nextMove();
            }

            return true;
        }
        return false;
    }

    //следующий ход
    nextMove() {

        this.playerMove = (this.playerMove + 1) % this.players.length; // изменяем индекс на индекс следующего игрока
        this.players[this.playerMove].onMove(this); // сообщаем игроку о переходе хода
        this.xoIndex = (this.xoIndex + 1) % this.XOInfo.length; // изменяем индекс x или o

        //выполняем эвент переход хода
        const nextMoveEvent = new CustomEvent('nextMove', { detail: { XOInfo: this.XOInfo[this.xoIndex], player: this.players[this.playerMove] } });
        document.dispatchEvent(nextMoveEvent);
    }
}