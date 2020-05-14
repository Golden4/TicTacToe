'use strict';
import Player from './Player.js';
//класс пользователя
export default class Human extends Player {
    constructor(options) {
        super(options);
        this.options.needHover = true; // не нужно подсвечивать при наведении мыши на клетку

        const cells = document.querySelectorAll('.gameGrid__cell'); // html разметки клеток
        //подписываемся на события клика по клетке
        for (let i = 0; i < cells.length; i++) {
            cells[i].addEventListener('click', () => { this.onCellClick(Math.floor(i / 3), i % 3); });
        }
    }

    //при нажатии на клетку
    onCellClick(x, y) {
        this.gameMoveTo(x, y);
    }

    //при переходе хода на пользователя
    onMove(game) {

    }
}