'use strict';

//класс игрока
class Player {
    constructor(options) {
        this.game = options.game; // ссылка на на главный компонент игры
        this.index = options.index; // индекс игрока
    }

    //сообщить компоненту игры сделать ход по координатам
    gameMoveTo(x, y) {
        return this.game.moveTo(this.index, x, y);
    }

    //при переходе хода на игрока
    onMove() {

    }
}

//класс пользователя
class Human extends Player {
    constructor(options) {
        super(options);
        //подписываемся на события клика по клетке
        for (let i = 0; i < options.cells.length; i++) {
            options.cells[i].addEventListener('click', () => { this.onCellClick(Math.floor(i / 3), i % 3); });
        }
    }

    //при нажатии на клетку
    onCellClick(x, y) {
        this.gameMoveTo(x, y);
    }

    //при переходе хода на пользователя
    onMove(game) {
        console.log('Human');
    }
}

//класс компьютера
class Computer extends Player {
    constructor(options) {
        super(options);
    }

    //при переходе хода на компьютера
    onMove(game) {
        console.log('computer');
    }
}

// компонент игры
class Game {
    constructor(options) {
        this.initPlayers(options.playersTemplateIndex);

        this.cells = document.querySelectorAll('.gameGrid__cell'); // html разметки клеток
        this.playerMove = options.playerMove || 1; // индекс игрока, который ходит
        this.map = options.map; // o - нолик, 0 - обычный, x - крестик


        //информация x - крестик, o - нолик
        this.XOInfo = [
            { id: 'x', class: 'gameGrid__cell--x', hoverClass: 'gameGrid__cell--xHover' },
            { id: 'o', class: 'gameGrid__cell--o', hoverClass: 'gameGrid__cell--oHover' }];

        // обнуление карты
        if (!this.map)
            this.createMap();
    }

    initPlayers(playersTemplateIndex) {
        //шаблон игроков, при необходимости можно написать еще сложность для компьютеров в отдельном классе и добавить в шаблон
        const playersTemplate = [
            { firstPlayer: { comp: Human, options: {} }, secondPlayer: { comp: Human, options: {} } },
            { firstPlayer: { comp: Human, options: {} }, secondPlayer: { comp: Computer, options: {} } }];

        //текущий шаблон
        const playersTemplate = playersTemplate[playersTemplateIndex || 0];
        //шаблон первого игрока
        const firstPlayer = playersTemplate.firstPlayer;
        //шаблон второго игрока
        const secondPlayer = playersTemplate.secondPlayer;

        this.players = [];
        //добавление игроков в массив
        this.players.push(new firstPlayer.comp({ ...firstPlayer.options, cells: this.cells, game: this, index: 0 }));
        this.players.push(new secondPlayer.comp({ ...secondPlayer.options, cells: this.cells, game: this, index: 1 }));
    }

    //получение html разметки клетки по координатам
    getCell(x, y) {
        const index = x * 3 + y % 3;
        return this.cells[index];
    }

    //начать игру
    startGame() {
        this.createMap();
        this.nextMove();
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

    //проверка на победу
    checkWin() {

        const winningCombinations = 

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
        if (this.playerMove != index)
            return false;

        //может ли пойти игрок по координатам
        if (this.canMoveTo(x, y)) {
            //меняем класс клетки
            this.getCell(x, y).classList.add(this.XOInfo[this.playerMove].class);
            //задаем id карте
            this.map[x][y] = this.XOInfo[this.playerMove].id;

            if (!this.checkWin()) {
                this.nextMove();
            }

            return true;
        }
        return false;
    }

    //следующий ход
    nextMove() {
        this.playerMove = (this.playerMove + 1) % this.players.length;
        this.players[this.playerMove].onMove(this);
        console.log(this.players[this.playerMove]);
    }
}

//статистика игры
class GameStatistics {
    constructor() {

    }
}

//--------------------------------------------------------------------------------------------------------------------------
//индекс текущего шаблона
//доступные шаблоны
//0 - игрок против игрока
//1 - игрок против компьютера
const playersTemplateIndex = 0;
//создание новой игры
const game = new Game({ playersTemplateIndex });
//начать игру
game.startGame();