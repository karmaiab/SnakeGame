var FIELD_SIZE_X = 20;
var FIELD_SIZE_Y = 20;
var SNAKE_SPEED = 300;
var snake = [];
var direction = 'y+';
var gameIsRunning = false;
var snake_timer;
var food_timer;
var score = 0;
var lives = 3;  // Начальное количество жизней
var maxLives = 5; // Максимальное количество жизней

function init() {
    prepareGameField();

    var wrap = document.getElementsByClassName('wrap')[0];

    wrap.style.width = '400px';
    document.getElementById('snake-start').addEventListener('click', startGame);
    document.getElementById('snake-renew').addEventListener('click', refreshGame);

    addEventListener('keydown', changeDirection);
}

function prepareGameField() {
    var game_table = document.createElement('table');
    game_table.setAttribute('class', 'game-table');

    for (var i = 0; i < FIELD_SIZE_X; i++) {
        var row = document.createElement('tr');
        row.className = 'game-table-row row-' + i;

        for (var j = 0; j < FIELD_SIZE_Y; j++) {
            var cell = document.createElement('td');
            cell.className = 'game-table-cell cell-' + i + '-' + j;

            row.appendChild(cell);
        }
        game_table.appendChild(row);
    }
    document.getElementById('snake-field').appendChild(game_table);
}

function startGame() {
    gameIsRunning = true;
    respawn();

    snake_timer = setInterval(move, SNAKE_SPEED);
    setTimeout(createFood, 5000);
    setTimeout(createLifeFood, 7000);  // Создаем дополнительное яблоко через 7 секунд
    setTimeout(createDeathFood, 9000); // Создаем яблоко, уменьшающее жизнь через 9 секунд
    updateLivesDisplay();  // Обновить отображение жизней в начале игры
    updateScoreDisplay();
}

function respawn() {
    var start_coord_x = Math.floor(FIELD_SIZE_X / 2);
    var start_coord_y = Math.floor(FIELD_SIZE_Y / 2);

    var snake_head = document.getElementsByClassName('cell-' + start_coord_y + '-' + start_coord_x)[0];
    snake_head.setAttribute('class', snake_head.getAttribute('class') + ' snake-unit');

    var snake_tail = document.getElementsByClassName('cell-' + (start_coord_y - 1) + '-' + start_coord_x)[0];
    snake_tail.setAttribute('class', snake_tail.getAttribute('class') + ' snake-unit');

    snake.push(snake_head);
    snake.push(snake_tail);
}

function move() {
    var snake_head_classes = snake[snake.length - 1].getAttribute('class').split(' ');

    var new_unit;
    var snake_coords = snake_head_classes[1].split('-');
    var coord_y = parseInt(snake_coords[1]);
    var coord_x = parseInt(snake_coords[2]);

    if (direction == 'x-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x - 1))[0];
    }
    else if (direction == 'x+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x + 1))[0];
    }
    else if (direction == 'y+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y - 1) + '-' + (coord_x))[0];
    }
    else if (direction == 'y-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y + 1) + '-' + (coord_x))[0];
    }

    if (!isSnakeUnit(new_unit) && new_unit !== undefined) {
        new_unit.setAttribute('class', new_unit.getAttribute('class') + ' snake-unit');
        snake.push(new_unit);

        if (!haveFood(new_unit) && !haveLifeFood(new_unit) && !haveDeathFood(new_unit)) {
            var removed = snake.splice(0, 1)[0];
            var classes = removed.getAttribute('class').split(' ');

            removed.setAttribute('class', classes[0] + ' ' + classes[1]);
        }
    }
    else {
        loseLife();
    }
}

function isSnakeUnit(unit) {
    return snake.includes(unit);
}

function updateScoreDisplay() {
    var scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
        scoreDisplay.innerText = 'Score: ' + score;
    } else {
        var wrap = document.getElementsByClassName('wrap')[0];
        scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display';
        scoreDisplay.innerText = 'Score: ' + score;
        wrap.appendChild(scoreDisplay);
    }
}


function haveFood(unit) {
    var unit_classes = unit.getAttribute('class').split(' ');

    if(unit_classes.includes('food-unit')) {
        createFood();
        score++;
        updateScoreDisplay();
        checkForBonusFood(); 
        return true;
    }
    return false;
}

function haveLifeFood(unit) {
    var unit_classes = unit.getAttribute('class').split(' ');

    if(unit_classes.includes('life-food-unit')) {
        createLifeFood();
        if (lives < maxLives) {
            lives++;
        }
        updateLivesDisplay();
        return true;
    }
    return false;
}

function haveDeathFood(unit) {
    var unit_classes = unit.getAttribute('class').split(' ');

    if(unit_classes.includes('death-food-unit')) {
        createDeathFood();
        loseLife();
        return true;
    }
    return false;
}

function createFood() {
    var foodCreated = false;

    while(!foodCreated) {
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        var food_cell_classes = food_cell.getAttribute('class').split(' ');

        if (!food_cell_classes.includes('snake-unit')) {
            var classes = '';
            for (var i = 0; i < food_cell_classes.length; i++) {
                classes += food_cell_classes[i] + ' ';
            }

            food_cell.setAttribute('class', classes + 'food-unit');
            foodCreated = true;
        }
    }
}

function createLifeFood() {
    var foodCreated = false;

    while(!foodCreated) {
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        var food_cell_classes = food_cell.getAttribute('class').split(' ');

        if (!food_cell_classes.includes('snake-unit') && !food_cell_classes.includes('food-unit')) {
            var classes = '';
            for (var i = 0; i < food_cell_classes.length; i++) {
                classes += food_cell_classes[i] + ' ';
            }

            food_cell.setAttribute('class', classes + 'life-food-unit');
            foodCreated = true;
        }
    }
}

function createDeathFood() {
    var foodCreated = false;

    while(!foodCreated) {
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        var food_cell_classes = food_cell.getAttribute('class').split(' ');

        if (!food_cell_classes.includes('snake-unit') && !food_cell_classes.includes('food-unit') && !food_cell_classes.includes('life-food-unit')) {
            var classes = '';
            for (var i = 0; i < food_cell_classes.length; i++) {
                classes += food_cell_classes[i] + ' ';
            }

            food_cell.setAttribute('class', classes + 'death-food-unit');
            foodCreated = true;
        }
    }
}

function checkForBonusFood() {
    if (score >= 10 && score % 10 === 0) {
        createBonusFood();
    }
}

function createBonusFood() {
    var foodCreated = false;

    while(!foodCreated) {
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        var food_cell_classes = food_cell.getAttribute('class').split(' ');

        if (!food_cell_classes.includes('snake-unit') && !food_cell_classes.includes('food-unit') && !food_cell_classes.includes('life-food-unit') && !food_cell_classes.includes('death-food-unit') && !food_cell_classes.includes('bonus-food-unit')) {
            var classes = '';
            for (var i = 0; i < food_cell_classes.length; i++) {
                classes += food_cell_classes[i] + ' ';
            }

            food_cell.setAttribute('class', classes + 'bonus-food-unit');
            foodCreated = true;
        }
    }
}

function haveBonusFood(unit) {
    var unit_classes = unit.getAttribute('class').split(' ');

    if(unit_classes.includes('bonus-food-unit')) {
        score += 2;
        updateScoreDisplay(); // Обновление отображения очков
        createBonusFood();
        return true;
    }
    return false;
}

function changeDirection(e) {
    switch (e.keyCode) {
        case 37:
            if (direction != 'x+') {
                direction = 'x-'
            }
            break;
        case 38:
            if (direction != 'y-') {
                direction = 'y+'
            }
            break;
        case 39:
            if (direction != 'x-') {
                direction = 'x+'
            }
            break;
        case 40:
            if (direction != 'y+') {
                direction = 'y-'
            }
            break;
    }
}

function loseLife() {
    lives--;
    updateLivesDisplay();
    if (lives > 0) {
        respawn();  // Воскресить змею
    } else {
        finishTheGame();
    }
}

function updateLivesDisplay() {
    document.getElementById('lives-display').innerText = 'Lives: ' + lives;
}

function finishTheGame() {
    gameIsRunning = false;
    clearInterval(snake_timer);
    alert('Game Over! Your score: ' + score.toString());
}

function refreshGame() {
    location.reload();
}

window.onload = init;
