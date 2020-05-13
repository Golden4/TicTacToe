'use strict';

//класс игрока
class Player {
    constructor(options) {
        this.options = options;
    }

    //сообщить компоненту игры сделать ход по координатам
    gameMoveTo(x, y) {
        return this.options.game.moveTo(this.options.index, x, y);
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

        this.cells = document.querySelectorAll('.gameGrid__cell'); // html разметки клеток
        this.playerMove = options.playerMove || 0; // индекс игрока, который ходит
        this.map = options.map; // o - нолик, 0 - обычный, x - крестик

        //кнопка повторить
        this.restartBtn = document.querySelector('.ticTacToe__restartBtn');
        this.restartBtn.addEventListener('click', this.startGame.bind(this));
        this.restartBtn.style.display = 'none';

        //информация x - крестик, o - нолик
        this.XOInfo = [
            { id: 'X', class: 'gameGrid__cell--x', hoverClass: 'gameGrid__cell--xHover' },
            { id: 'O', class: 'gameGrid__cell--o', hoverClass: 'gameGrid__cell--oHover' }];

        //инициализация игроков
        this.initPlayers(options.playersTemplateIndex);
        this.curPlayerIndex = 0;
        this.state = 'play';
        // обнуление карты
        if (!this.map)
            this.createMap();
    }

    initPlayers(playersTemplateIndex) {
        //шаблон игроков, при необходимости можно написать еще сложность для компьютеров в отдельном классе и добавить в шаблон
        const playersTemplates = [
            { firstPlayer: { comp: Human, options: { name: 'Вы' } }, secondPlayer: { comp: Human, options: { name: 'Компьютер' } } },
            { firstPlayer: { comp: Human, options: {} }, secondPlayer: { comp: Computer, options: {} } }];

        //текущий шаблон
        const playersTemplate = playersTemplates[playersTemplateIndex || 0];
        //шаблон первого игрока
        const firstPlayer = playersTemplate.firstPlayer;
        //шаблон второго игрока
        const secondPlayer = playersTemplate.secondPlayer;

        this.players = [];
        //добавление игроков в массив
        this.players.push(new firstPlayer.comp({ ...firstPlayer.options, cells: this.cells, game: this, index: 0 }));
        this.players.push(new secondPlayer.comp({ ...secondPlayer.options, cells: this.cells, game: this, index: 1 }));

        const event = new CustomEvent('initPlayers', { detail: { players: this.players } });
        document.dispatchEvent(event);
    }

    //получение html разметки клетки по координатам
    getCell(x, y) {
        const index = x * 3 + y % 3;
        return this.cells[index];
    }

    //начать игру
    startGame() {
        this.createMap();
        this.resetAll();
        this.playerMove = 1;
        this.nextMove();
        this.restartBtn.style.display = 'none';

        const event = new CustomEvent('startGame');
        document.dispatchEvent(event);
    }

    resetAll() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].className = 'gameGrid__cell';
        }
        this.state = 'play';
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
    checkDraw() {
        let draw = true;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.map[i][j] == 0) {
                    draw = false;
                    break;
                }
            }
        }

        return draw;
    }
    //проверка на победу
    checkWin(curClass) {
        //победные комбинации
        const winningCombinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

        //перебираем комбинации
        return winningCombinations.some(comb => {
            return comb.every(index => {
                return this.cells[index].classList.contains(curClass);
            })
        });
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
            //меняем класс клетки
            const curClass = this.XOInfo[this.playerMove].class;

            this.getCell(x, y).classList.add(curClass);
            //задаем id карте
            this.map[x][y] = this.XOInfo[this.playerMove].id;

            //выполняем эвент хода игрока
            const event = new CustomEvent('moveTo', { detail: { x, y, id: this.XOInfo[this.playerMove].id, player: this.players[this.playerMove] } });
            document.dispatchEvent(event);

            //проверяем на победу
            if (this.checkWin(curClass)) {
                this.state = 'win';

                if (this.curPlayerIndex == this.playerMove) {
                    //выполняем эвент заврешения игры с результатом победа и с информацией об игроке
                    const event = new CustomEvent('endGame', { detail: { result: 'win', id: this.XOInfo[this.playerMove].id, player: this.players[this.playerMove] } });
                    document.dispatchEvent(event);
                } else {
                    //выполняем эвент заврешения игры с результатом победа и с информацией об игроке
                    const event = new CustomEvent('endGame', { detail: { result: 'lose', id: this.XOInfo[this.playerMove].id, player: this.players[this.playerMove] } });
                    document.dispatchEvent(event);
                }

                this.restartBtn.style.display = 'block';
                //проверка на ничью
            } else if (this.checkDraw()) {
                console.log('draw');
                this.state = 'draw';

                //выполняем эвент заврешения игры с результатом ничья
                const event = new CustomEvent('endGame', { detail: { result: 'draw' } });
                document.dispatchEvent(event);
                this.restartBtn.style.display = 'block';
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
        this.playerMove = (this.playerMove + 1) % this.players.length;
        this.players[this.playerMove].onMove(this);

        //выполняем эвент переход хода
        const nextMoveEvent = new CustomEvent('nextMoveEvent', { detail: { player: this.players[this.playerMove] } });
        document.dispatchEvent(nextMoveEvent);
    }
}

//информация об игры
class GameInfo {
    constructor(options) {
        this.gamesList = [];
        this.gameMassages = document.querySelector('.gameMessages');
        document.addEventListener('startGame', (e) => {
            this.onStartGame(e.detail);
        });
        document.addEventListener('moveTo', (e) => {
            this.onMoveTo(e.detail);
        });
        document.addEventListener('endGame', (e) => {
            this.onEndGame(e.detail);
        });
        document.addEventListener('initPlayers', (e) => {
            this.onInitPlayers(e.detail);
        });
    }

    onInitPlayers(info) {
        this.playersScore = [];

        for (let i = 0; i < info.players.length; i++) {
            this.playersScore.push({ playerName: info.players[i].options.name, score: 0 });
        }
        this.updateScore();
    }

    addScore(playerIndex) {
        this.playersScore[playerIndex].score++;
        this.updateScore();
    }

    updateScore() {
        document.querySelector('.ticTacToe__score').innerHTML = `Счет: (${this.playersScore[0].playerName}) <strong>${this.playersScore[0].score} : ${this.playersScore[1].score}</strong> (${this.playersScore[1].playerName})`;
    }

    onStartGame(info) {
        //создание контейнера в дом
        const container = document.createElement('div');
        container.classList.add('gameMessages__container');
        this.gameMassages.prepend(container);

        //создание заголовка дом
        const title = document.createElement('div');
        title.classList.add('gameMessages__title');
        title.innerHTML = 'Игра ' + (this.gamesList.length + 1);
        container.appendChild(title);

        //создаем сообщение "игра"
        this.gamesList.push({ title, messages: [], container });
        console.log(this.gamesList);
    }

    onMoveTo(info) {
        const message = `${info.player.options.name}: ${info.id} (${info.x + 1},${info.y + 1})`;
        this.addMessage(message);
    }

    onEndGame(info) {
        let message = '';
        const game = this.gamesList[this.gamesList.length - 1];
        if (info.result == 'win') {
            message = `Победитель: ${info.player.options.name} (${info.id})`
            game.title.classList.add('gameMessages__title--win');

            //добавляем к счету
            this.addScore(info.player.options.index);
        } else if (info.result == 'lose') {
            message = `Победитель: ${info.player.options.name} (${info.id})`
            game.title.classList.add('gameMessages__title--lose');

            //добавляем к счету
            this.addScore(info.player.options.index);
        } else if (info.result == 'draw') {
            message = 'Ничья!';
            game.title.classList.add('gameMessages__title--draw');
        }

        game.title.innerHTML += ': ' + message;

        this.addMessage(message);
    }

    addMessage(message) {
        const game = this.gamesList[this.gamesList.length - 1];
        game.messages.push(message);
        const messageElem = document.createElement('div');
        messageElem.classList.add('gameMessages__message');
        messageElem.innerHTML = message;
        game.container.appendChild(messageElem);
    }
}

//--------------------------------------------------------------------------------------------------------------------------
//информация об игре
const gameInfo = new GameInfo();

//индекс текущего шаблона
//доступные шаблоны
//0 - игрок против игрока
//1 - игрок против компьютера
const playersTemplateIndex = 0;
//создание новой игры
const game = new Game({ playersTemplateIndex });
//начать игру
game.startGame();