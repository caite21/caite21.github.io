// globals
let isCompeting = false;
let score = 0;
let level = 0;
const board_len = 4;
const step = 25;
let square_arr = [];
let inactive_sqrs = [];
let next_location = [];
const square_elements  = Array.from(document.getElementsByClassName('square'));
const square_colours = {2: "rgb(219, 209, 180)", 
                        4: "rgb(220, 202, 143)", 
                        8: "rgb(232, 177, 105)",  
                        16: "rgb(246, 145, 108)", 
                        32: "rgb(249, 146, 168)", 
                        64: "rgb(212, 152, 227)",
                        128: "rgb(153, 170, 255)", 
                        256: "rgb(136, 220, 201)", 
                        512: "rgb(172, 220, 116)", 
                        1024: "rgb(239, 97, 97)",
                        2048: "rgb(198, 71, 145)",
                        4096: "rgb(76, 92, 197)",
                        8192: "rgb(61, 161, 62)",
                        16384: "rgb(159, 8, 8)",
                        32768: "rgb(220, 181, 23)",
                        65536: "rgb(108, 0, 126)",
                        'white':  "rgb(243, 235, 211)"  
                        };
// initialize page
refresh_lists();
level = getCookie('level') || 0;
document.getElementById("level").innerHTML = level; 
document.getElementById("score_header").innerHTML = getCookie('username'); 
if (level >= 10) document.documentElement.style.setProperty('--title-color', square_colours[2**level]);


function activate_test_grid() {
    let value_arr =[[2, 2, 4, 8],
                    [16, 32, 64, 128],
                    [256, 512, 1024, 2048],
                    [4096, 8192, 16384, 32768]];

    for (let row = 0; row < board_len; row++) {
        for (let col = 0; col < board_len; col++) {
            if (value_arr[row][col] != 0) {
                activate(row, col, value_arr[row][col]);
            }
        }
    }
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

function animate(elem, CSS_class_name) {
    // clear all animations
    elem.classList.remove('appear');
    elem.classList.remove('merge');
    elem.classList.remove('mergeMed');
    elem.classList.remove('mergeLarge');
    elem.classList.remove('indicate');
    elem.classList.remove('hide_menu');
    elem.classList.remove('open_menu');

    void elem.offsetWidth;
    elem.classList.add(CSS_class_name);
}

function adjust_large_sqr(sqr) {
    if (sqr.value < 1000) return;

    if (sqr.value >= 10000) {
        sqr.elem.classList.add('square_5_digits');
    }
    else if (sqr.value >= 1000) {
        sqr.elem.classList.add('square_4_digits');
    }
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
    adjust_large_sqr(sqr);
    sqr.elem.style.visibility = 'visible';
    animate(sqr.elem, 'appear'); 
}

function deactivate(sqr) {
    sqr.active = false;
    inactive_sqrs.push(sqr);
    sqr.value = 0; 
    sqr.elem.className = 'square';
    sqr.elem.style.visibility = 'hidden';
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
        adjust_large_sqr(sqr);

        if (!sqr.active) {
            deactivate(sqr);
        }
    }
    document.getElementById("score").innerHTML = `${score}`; 
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function update_level() {
    level++;
    setCookie('level', level);
    document.getElementById("level").innerHTML = level; 
    if (level >= 10) document.documentElement.style.setProperty('--title-color', square_colours[2**level]);

    }

function merge(sqr1, sqr2) {
    sqr1.value *= 2;
    sqr2.active = false;

    if (sqr1.value < 2048) {
        animate(sqr1.elem, 'merge');
    } else if (sqr1.value < 10000) {
        animate(sqr1.elem, 'mergeMed');
    } else if (sqr1.value < 100000) {
        animate(sqr1.elem, 'mergeLarge');
    } 

    score += sqr1.value;
    if (sqr1.value > 2**level) {
        update_level();
    }
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
                        merge(square_arr[j][col], square_arr[i][col]);
                        next_location.push([square_arr[i][col], j, col]);
                        next_location.push([square_arr[j][col], j, col]);
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
                        merge(square_arr[j][col], square_arr[i][col]);
                        next_location.push([square_arr[i][col], j, col]);
                        next_location.push([square_arr[j][col], j, col]);
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
                        merge(square_arr[row][j], square_arr[row][i]);
                        next_location.push([square_arr[row][i], row, j]);
                        next_location.push([square_arr[row][j], row, j]);
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
                        merge(square_arr[row][j], square_arr[row][i]);
                        next_location.push([square_arr[row][i], row, j]);
                        next_location.push([square_arr[row][j], row, j]);
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

function openMenu() {
    document.getElementById('main_menu').style.display = 'block';
    document.getElementById('scores_menu').style.display = 'none';
    animate(document.getElementById('main_menu'), 'open_menu');
}

function openScoresMenu() {
    document.getElementById('scores_menu').style.display = 'block';
    document.getElementById('main_menu').style.display = 'none';
    animate(document.getElementById('scores_menu'), 'open_menu');
}

function setCookie(name, value) {
    expires = "; expires=Thu, 1 Jan 2026 12:00:00 GMT";
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function refresh_lists() {
    document.getElementById('top_score_1').innerHTML = getCookie('top_score_1');    
    document.getElementById('top_score_2').innerHTML = getCookie('top_score_2');
    document.getElementById('top_score_3').innerHTML = getCookie('top_score_3');

    document.getElementById('demo').innerHTML = getCookie('username');
}

function save_score() {
    if (isCompeting) {

    }

    let score1 = getCookie('top_score_1');
    let score2 = getCookie('top_score_2');
    let score3 = getCookie('top_score_3');

    if (score > score1) {
        setCookie('top_score_1', score);
        setCookie('top_score_2', score1);
        setCookie('top_score_3', score2);
    } else if (score > score2) {
        setCookie('top_score_2', score);
        setCookie('top_score_3', score2);
    } else if (score > score3) {
        setCookie('top_score_3', score);
    } 
    refresh_lists();
}
   

function openCompeteMenu() {
    document.getElementById('compete_menu').style.visibility = 'visible';
    let username = getCookie("username");
    if (username == "") {
        set_username();
        username = getCookie("username");
    }
    document.getElementById("username").innerHTML = username;
    animate(document.getElementById('compete_menu'), 'open_menu');
}

function play() {
    // reset
    score = 0;
    level = 0;
    square_arr = [];
    inactive_sqrs = [];
    next_location = [];
    // initialize block elements
    let count_elems = 0;
    for (let row = 0; row < board_len; row++) {
        let row_arr = [];
        for (let col = 0; col < board_len; col++) {
            let sqr = {elem: square_elements[count_elems]};
            row_arr[col] = null;
            count_elems++;
            deactivate(sqr);
        }
        square_arr[row] = row_arr;
    }

    // todo: better function to handle closing all menus
    animate( document.getElementById("main_menu"), 'hide_menu');
    animate( document.getElementById("game_over_menu"), 'hide_menu');
    animate( document.getElementById("compete_menu"), 'hide_menu');

    document.getElementById("score").innerHTML = score;
    document.getElementById('game_border').focus();

    if (isCompeting) { 

    } else {
        document.getElementById("score_header").innerHTML = ``;
    }
    setTimeout(() => {
        document.getElementById("main_menu").style.display = 'none';
        document.getElementById("scores_menu").style.display = 'none';
        document.getElementById("game_over_menu").style.visibility = "hidden";
        document.getElementById("compete_menu").style.visibility = "hidden";

        document.getElementById('play_button').innerHTML = 'New Game';
    }, 180);
    setTimeout(() => {
        // initial game state
        // activate_test_grid(); display_positions();
        generate_new();
        generate_new();
    }, 300);

}

function set_username() {
    user = prompt("Please enter your name:","");
    if (user != "" && user != null) {
        setCookie("username", user);
        refresh_lists();
    }
}

function compete_play() {
    let username = document.getElementById("username").innerHTML; 
    if (username != "") {
        document.getElementById("score_header").innerHTML = `${username}'s `;
        isCompeting = true;
        play();
    }
    else {
        animate(document.getElementById("set_username_button"), 'merge');
    }
}

function stopCompeting() {
    document.getElementById("score_header").innerHTML = ``;
    isCompeting = false;
}

function game_over() {
    animate(document.getElementById("game_over_menu"), 'appear');
    document.getElementById("game_over_menu").style.visibility = "visible";
    document.getElementById("game_over_score").innerHTML = score;
    save_score();
    stopCompeting();
}




let ms = 50;
let isMoving = false;
let startX = 0;
let startY = 0;
let container = document.getElementById('game_border');

// keyboard events
container.addEventListener('keydown', async (event) => {
    event.preventDefault();
    if (isMoving) return; 
    
    blockMoved = false;
    isMoving = true;
    
    if (event.key == 'ArrowUp' || event.key == 'w') blockMoved = up();
    else if (event.key == 'ArrowDown' || event.key == 's') blockMoved = down();
    else if (event.key == 'ArrowLeft' || event.key == 'a') blockMoved = left();
    else if (event.key == 'ArrowRight' || event.key == 'd') blockMoved = right();

    await sleep(ms);
    if (blockMoved) {
        generate_new();
        if (loseCondition()) {
            game_over();
        }
    }
    isMoving = false;
});

// swipe events
container.addEventListener('touchstart', function(event) {
    if (event.touches.length === 1) { // only handles single touch
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        startTime = new Date().getTime(); 
    }
});
container.addEventListener('touchmove', function(event) {
    event.preventDefault();
});
container.addEventListener('touchend', async function(event) {
    if (event.changedTouches.length === 1) { 
        if (isMoving) return; 

        blockMoved = false;
        isMoving = true;
        let endX = event.changedTouches[0].clientX;
        let endY = event.changedTouches[0].clientY;
        let deltaX = endX - startX;
        let deltaY = endY - startY;
        let elapsedTime = new Date().getTime() - startTime;

        // Thresholds
        let threshold = 30; // min distance for a swipe
        let allowedTime = 1000; // max time for a swipe

        if (elapsedTime <= allowedTime) {
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= threshold) {
                if (deltaX > 0) {
                    blockMoved = right();
                } else {
                    blockMoved = left();
                }
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) >= threshold) {
                if (deltaY > 0) {
                    blockMoved = down();
                } else {
                    blockMoved = up();
                }
            }
        }
        await sleep(ms);
        if (blockMoved) {
            generate_new();
            if (loseCondition()) {
                game_over();
            }
        }
        isMoving = false;
    }
});
