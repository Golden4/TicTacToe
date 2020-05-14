'use strict';
//класс игрока
export default class Player {
    constructor(options) {
        this.options = options;
        this.options.needHover = false; // нужно ли подсвечивать при наведении мыши на клетку
    }

    //сообщить компоненту игры сделать ход по координатам
    gameMoveTo(x, y) {
        return this.options.game.moveTo(this.options.index, x, y);
    }

    //при переходе хода на игрока
    onMove() {

    }
}