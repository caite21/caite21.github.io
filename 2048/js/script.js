// globals
let score = 0;
const board_len = 4;
const step = 25;
let square_arr = [];
let inactive_sqrs = [];
let next_location = [];
const square_elements  = Array.from(document.getElementsByClassName('square'));
const square_colours = {2: "rgb(219, 209, 180)", 
                        4: "rgb(220, 202, 143)", 
                        8: "rgb(232, 180, 112)",  
                        16: "rgb(242, 157, 117)", 
                        32: "rgb(244, 147, 175)", 
                        64: "rgb(217, 158, 217)",
                        128: "rgb(174, 152, 236)", 
                        256: "rgb(118, 194, 190)", 
                        512: "rgb(164, 188, 122)", 
                        1024: "rgb(239, 97, 97)"};

                        

function activate_test_grid() {
    let value_arr =[[2, 16, 4, 1024],
                    [2, 8, 256, 128],
                    [4, 2, 4, 64],
                    [0, 512, 16, 32]];

    for (let row = 0; row < board_len; row++) {
        for (let col = 0; col < board_len; col++) {
            if (value_arr[row][col] != 0) {
                activate(row, col, value_arr[row][col]);
            }
        }
    }
}

function animate(elem, CSS_class_name) {
    // clear all animations
    elem.classList.remove('appear');
    elem.classList.remove('merge');
    elem.classList.remove('indicate');
    void elem.offsetWidth;
    elem.classList.add(CSS_class_name);
}

function activate(row, col, value) {
    let sqr = inactive_sqrs.pop();
    square_arr[row][col] = sqr;
    sqr.active= true;
    sqr.value= value;

    sqr.elem.style.top = `${row * step}%`;
    sqr.elem.style.left = `${col * step}%`;
    sqr.elem.style.backgroundColor =  square_colours[value];
    sqr.elem.innerHTML = `${value}`;
    sqr.elem.style.visibility = 'visible';
    animate(sqr.elem, 'appear'); 
}

function deactivate(sqr) {
    sqr.active = false;
    inactive_sqrs.push(sqr);
    sqr.value = 0; 
    sqr.elem.classList.remove('slide');
    sqr.elem.style.visibility = 'hidden';
}

function display_positions() {
    for (let row = 0; row < board_len; row++) {
        for (let col = 0; col < board_len; col++) {
            let sqr = square_arr[row][col];
            if (sqr != null) {
                sqr.elem.style.top = `${row * step}%`;
                sqr.elem.style.left = `${col * step}%`;
                sqr.elem.innerHTML = `${sqr.value}`;
                sqr.elem.style.visibility = 'visible';
            }
        }
    }
}

function display_move() {
    while (next_location.length > 0) {
        let l  = next_location.pop();
        let sqr = l[0];
        let y = l[1];
        let x = l[2];
        
        sqr.elem.classList.add('slide');
        sqr.elem.style.left = `${x * step}%`;
        sqr.elem.style.top = `${y * step}%`;
        sqr.elem.style.backgroundColor =  square_colours[sqr.value];
        sqr.elem.innerHTML = `${sqr.value}`;

        if (!sqr.active) {
            deactivate(sqr);
        }
    }
    document.getElementById("score").innerHTML = `${score}`; 
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function up() {
    movement = false;
    for (let col = 0; col < board_len; col++) {
        let j = 0;
        for (let i = 1; i < board_len; i++) {
            if (square_arr[i][col] != null) {
                moved = false;
                while (!moved && j != i) {
                    if (square_arr[j][col] == null) {
                        // move to empty spot
                        next_location.push([square_arr[i][col], j, col]);
                        square_arr[j][col] = square_arr[i][col];
                        square_arr[i][col] = null;
                        moved = true;
                        movement = true;
                    }
                    else if (square_arr[i][col].value == square_arr[j][col].value) {
                        // merge with spot
                        square_arr[j][col].value *= 2;
                        square_arr[i][col].active = false;
                        next_location.push([square_arr[i][col], j, col]);
                        next_location.push([square_arr[j][col], j, col]);
                        animate(square_arr[j][col].elem, 'merge');
                        score += square_arr[j][col].value;
                        square_arr[i][col] = null;
                        j++;
                        moved = true;
                        movement = true;
                    } 
                    else {
                        // spot is blocked by different value block
                        j++;
                    }
                }
            }
        }
    }
    display_move();
    return movement;
}

function down() {
    movement = false;
    for (let col = 0; col < board_len; col++) {
        let j = board_len - 1;
        for (let i = board_len - 2; i >= 0; i--) {
            if (square_arr[i][col] != null) {
                moved = false;
                while (!moved && j != i) {
                    if (square_arr[j][col] == null) {
                        // move to empty spot
                        next_location.push([square_arr[i][col], j, col]);
                        square_arr[j][col] = square_arr[i][col];
                        square_arr[i][col] = null;
                        moved = true;
                        movement = true;
                    }
                    else if (square_arr[i][col].value == square_arr[j][col].value) {
                        // merge with spot
                        square_arr[j][col].value *= 2;
                        square_arr[i][col].active = false;
                        next_location.push([square_arr[i][col], j, col]);
                        next_location.push([square_arr[j][col], j, col]);
                        animate(square_arr[j][col].elem, 'merge');
                        score += square_arr[j][col].value;
                        square_arr[i][col] = null;
                        j--;
                        moved = true;
                        movement = true;
                    }
                    else {
                        // spot is blocked by different value block
                        j--;
                    }
                }
            }
        }
    }
    display_move();
    return movement;
}

function left() {
    movement = false;
    for (let row = 0; row < board_len; row++) {
        let j = 0;
        for (let i = 1; i < board_len; i++) {
            if (square_arr[row][i] != null) {
                moved = false;
                while (!moved && j != i) {
                    if (square_arr[row][j] == null) {
                        // move to empty spot
                        next_location.push([square_arr[row][i], row, j]);
                        square_arr[row][j] = square_arr[row][i];
                        square_arr[row][i] = null;
                        moved = true;
                        movement = true;
                    }
                    else if (square_arr[row][i].value == square_arr[row][j].value) {
                        // merge 
                        square_arr[row][j].value *= 2;
                        square_arr[row][i].active = false;
                        next_location.push([square_arr[row][i], row, j]);
                        next_location.push([square_arr[row][j], row, j]);
                        animate(square_arr[row][j].elem, 'merge');
                        score += square_arr[row][j].value;
                        square_arr[row][i] = null;
                        j++;
                        moved = true;
                        movement = true;
                    }
                    else {
                        // spot is blocked by different value block
                        j++;
                    }
                }
            }
        }
    }
    display_move();
    return movement;
}

function right() {
    movement = false;
    for (let row = 0; row < board_len; row++) {
        let j = board_len - 1;
        for (let i = board_len - 2; i >= 0; i--) {
            if (square_arr[row][i] != null) {
                moved = false;
                while (!moved && j != i) {
                    if (square_arr[row][j] == null) {
                        // move to empty spot
                        next_location.push([square_arr[row][i], row, j]);
                        square_arr[row][j] = square_arr[row][i];
                        square_arr[row][i] = null;
                        moved = true;
                        movement = true;
                    }
                    else if (square_arr[row][i].value == square_arr[row][j].value) {
                        // merge 
                        square_arr[row][j].value *= 2;
                        square_arr[row][i].active = false;
                        next_location.push([square_arr[row][i], row, j]);
                        next_location.push([square_arr[row][j], row, j]);
                        animate(square_arr[row][j].elem, 'merge');
                        score += square_arr[row][j].value;
                        square_arr[row][i] = null;
                        j--;
                        moved = true;
                        movement = true;
                    }
                    else {
                        // spot is blocked by different value block
                        j--;
                    }
                }
            }
        }
    }
    display_move();
    return movement;
}

function generate_new() {
    // number of inactive squares to choose from
    let rand_index = Math.floor(Math.random() * inactive_sqrs.length);
    let count  = 0;
    for (let row = 0; row < board_len; row++) {
        for (let col = 0; col < board_len; col++) {
            if (square_arr[row][col] == null) {
                if (count == rand_index) {
                    // value is 2 or 10% chance of being 4 
                    let rand_value = 2;
                    if (Math.random() < 0.1) rand_value = 4;
                    activate(row, col, rand_value);
                    return;
                }
                count++;
            }
        }
    }
}

function loseCondition() {
    if (inactive_sqrs.length == 0) {
        // check if move is possible

        // check if horizontal move is possible
        for (let row = 0; row < board_len; row++) {
            let val = null;
            for (let col = 0; col < board_len; col++) {
                if (square_arr[row][col].value == val) {
                    return false;
                } else {
                    val = square_arr[row][col].value;
                }
            }
        }
        // check if vertical move is possible
        for (let col = 0; col < board_len; col++) {
            let val = null;
            for (let row = 0; row < board_len; row++) {
                if (square_arr[row][col].value == val) {
                    return false;
                } else {
                    val = square_arr[row][col].value;
                }
            }
        }
        return true;
    }
    return false;
}

function play() {
    // reset
    square_arr = [];
    inactive_sqrs = [];
    next_location = [];
    // initialize block elements
    let count_elems = 0;
    for (let row = 0; row < board_len; row++) {
        let row_arr = [];
        for (let col = 0; col < board_len; col++) {
            let sqr = {active: false, value: 0, elem: square_elements[count_elems]};
            inactive_sqrs.push(sqr)
            row_arr[col] = null;
            count_elems++;
        }
        square_arr[row] = row_arr;
    }

    animate( document.getElementById("main_menu"), 'hide_menu');
    animate( document.getElementById("game_over_menu"), 'hide_menu');
    setTimeout(() => {
        document.getElementById("main_menu").style.visibility = "hidden";
        document.getElementById("game_over_menu").style.visibility = "hidden";
    }, 180);
    setTimeout(() => {
        // activate_test_grid();
        // display_positions();
        generate_new();
        generate_new();
    }, 300);

}


// main
// activate(0,0,4);
// generate_new();
// generate_new();

document.getElementById("demo").innerHTML = "Started";   

document.addEventListener('DOMContentLoaded', () => {
    let ms = 50;
    let isMoving = false;

    document.addEventListener('keydown', async (event) => {
        if (isMoving) return; 
        
        blockMoved = false;
        isMoving = true;
        switch(event.key) {
            case 'ArrowUp':
                blockMoved = up();
                break;
            case 'ArrowDown':
                blockMoved = down();
                break;
            case 'ArrowLeft':
                blockMoved = left();
                break;
            case 'ArrowRight':
                blockMoved = right();
                break;
            default:
                break;
        }
        // reset_for_next_move();
        await sleep(ms);
        if (blockMoved) {
            generate_new();
            if (loseCondition()) {
                animate(document.getElementById("game_over_menu"), 'appear');
                document.getElementById("game_over_menu").style.visibility = "visible";
                document.getElementById("game_over_score").innerHTML = score;
                game_over_score
            }
            // check lose condition
            // update score 
        }

        isMoving = false;
    });
});

