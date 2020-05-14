'use strict';

//визуальная информация игры,
//занимается созданием и обновлением dom, подписываясь на события Game
//информация об игре, с историями игр
export default class GameVisualInfo {
    constructor(game) {
        this.game = game; // ссылка на игру
        this.gamesListElem = []; // список истории игр
        this.gameMessagesElem = document.querySelector('.gameMessages'); // ссобщения
        this.bottomMsgElem = document.querySelector('.bottomMessage__message'); // сообщение снизу поля
        this.scoreElem = document.querySelector('.ticTacToe__score'); // счет
        this.createRestartBtn(game); // создание кнопки повтора
        this.createGameModeSelector(game); // создание селектора игоровогых режимов

        this.cellsElem = document.querySelectorAll('.gameGrid__cell'); // html разметки клеток

        //подписываемся на события
        document.addEventListener('startGame', (e) => {
            this.onStartGame(e.detail);
        });
        document.addEventListener('restartGame', (e) => {
            this.onRestartGame(e.detail);
        });
        document.addEventListener('moveTo', (e) => {
            this.onMoveTo(e.detail);
        });
        document.addEventListener('nextMove', (e) => {
            this.onNextMove(e.detail);
        });
        document.addEventListener('endGame', (e) => {
            this.onEndGame(e.detail);
        });
        document.addEventListener('initPlayers', (e) => {
            this.onInitPlayers(e.detail);
        });
    }

    createGameModeSelector(game) {
        this.modeSelectorElem = document.querySelector('.ticTacToe__gameModeSelector');

        const selectElem = document.createElement('select');

        let gameModeOptions = ``;
        for (let i = 0; i < game.playersTemplates.length; i++) {
            const temp = game.playersTemplates[i];
            gameModeOptions += `<option value="${i}" ${game.playersTemplateIndex == i ? 'selected' : ''}>${temp.firstPlayer.options.name} vs ${temp.secondPlayer.options.name}</option>`
        }

        selectElem.innerHTML = gameModeOptions;
        this.modeSelectorElem.innerHTML = '';
        this.modeSelectorElem.appendChild(selectElem);

        selectElem.addEventListener("change", (e) => { game.playersTemplateIndex = e.target.value; game.startGame(); });

    }

    createRestartBtn(game) {
        //кнопка повторить
        this.restartBtn = document.querySelector('.ticTacToe__restartBtn');
        this.restartBtn.addEventListener('click', game.restartGame.bind(game));
        this.restartBtn.style.display = 'none';
    }

    //получение html разметки клетки по координатам
    getCell(x, y) {
        const index = x * 3 + y % 3;
        return this.cellsElem[index];
    }

    onInitPlayers(info) {
        this.playersScore = [];

        for (let i = 0; i < info.players.length; i++) {
            this.playersScore.push({ playerName: info.players[i].options.name, score: 0 });
        }

        this.updateScoreElem();
    }

    //прибавить сче для игрока с индексом
    addScore(playerIndex) {
        this.playersScore[playerIndex].score++;
        this.updateScoreElem();
    }

    updateScoreElem() {
        this.scoreElem.innerHTML = `Счет: (${this.playersScore[0].playerName}) <strong>${this.playersScore[0].score} : ${this.playersScore[1].score}</strong> (${this.playersScore[1].playerName})`;
    }

    onStartGame(info) {
        this.clearGameHistory();
        this.onRestartGame(info);
    }

    onRestartGame(info) {
        //создание контейнера в дом
        const containerElem = document.createElement('div');
        containerElem.classList.add('gameMessages__containerElem');
        this.gameMessagesElem.prepend(containerElem);

        //создание заголовка дом
        const titleElem = document.createElement('div');
        titleElem.classList.add('gameMessages__title');
        titleElem.innerHTML = 'Игра ' + (this.gamesListElem.length + 1);
        containerElem.appendChild(titleElem);

        //создаем дом истории игр
        this.gamesListElem.push({ titleElem, messages: [], containerElem });

        //очистка клеток
        for (let i = 0; i < this.cellsElem.length; i++) {
            this.cellsElem[i].className = 'gameGrid__cell';
        }

        this.restartBtn.style.display = 'none';//скрываем кнопку повторить
    }

    clearGameHistory() {
        this.gameMessagesElem.innerHTML = '';
        this.gamesListElem = [];
    }

    onNextMove(info) {
        //если текущему игроку требуется подсветка клеток, включаем подсветку
        this.needXOHoverOnCell(info.player.options.needHover);

        this.bottomMsgElem.innerHTML = `Делает ход ${info.XOInfo.value} (${info.player.options.name})`;
    }

    onMoveTo(info) {
        const message = `${info.player.options.name} сделал ход ${info.XOInfo.value} (${info.x + 1},${info.y + 1})`;

        let curClass = 'gameGrid__cell--o';
        if (this.game.getXOInfoForCurrentMovePlayer().value == 'X') {
            curClass = 'gameGrid__cell--x'
        }
        this.getCell(info.x, info.y).classList.add(curClass);
        this.addMessage(message);
    }

    onEndGame(info) {
        let message = '';
        const game = this.gamesListElem[this.gamesListElem.length - 1];

        if (info.result != 'draw') {

            //при победе
            if (info.result == 'win') {
                game.titleElem.classList.add('gameMessages__title--win');
                // при поражении
            } else if (info.result == 'lose') {
                game.titleElem.classList.add('gameMessages__title--lose');
            }

            message = `Победитель: ${info.player.options.name} (${info.XOInfo.value})`

            //подсветить победные клетки
            for (let i = 0; i < info.winningCombination.length; i++) {
                this.getCell(info.winningCombination[i].x, info.winningCombination[i].y).classList.add('gameGrid__cell--highlight');
            }

            //добавляем к счету
            this.addScore(info.player.options.index);

            //если ничья
        } else {
            message = 'Ничья!';
            game.titleElem.classList.add('gameMessages__title--draw');
        }

        //показываем кнопку повтора
        this.restartBtn.style.display = 'block';
        //отключаем подсветку
        this.needXOHoverOnCell(false);

        game.titleElem.innerHTML += ': ' + message;
        this.bottomMsgElem.innerHTML = message;

        this.addMessage(message);
    }

    //добавить сообщение в историю игр
    addMessage(message) {
        const game = this.gamesListElem[this.gamesListElem.length - 1];
        game.messages.push(message);
        const messageElem = document.createElement('div');
        messageElem.classList.add('gameMessages__message');
        messageElem.innerHTML = message;
        game.containerElem.appendChild(messageElem);
    }

    //нужно ли подствечивать клетку
    needXOHoverOnCell(need) {
        //ищем сетку
        const gameGridElem = document.querySelector('.gameGrid');
        //присваимаем класс
        gameGridElem.className = 'gameGrid';

        //если нужно подсветить
        if (need) {
            //добавляем класс в клетку
            let hoverClass = 'gameGrid--o';
            if (this.game.getXOInfoForCurrentMovePlayer().value == "X") {
                hoverClass = 'gameGrid--x';
            }
            gameGridElem.classList.add(hoverClass);
        }
    }
}