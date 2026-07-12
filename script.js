let score = 0;
let board = [];
let selectedPiece = null;
let selectedElement = null;
let dragging = false;
let ghost = [];
let soundOn = true;

const size = 8;

const sounds = {
    place: new Audio("place.mp3"),
    clear: new Audio("clear.mp3"),
    gameover: new Audio("gameover.mp3"),
    click: new Audio("click.mp3")
};


function sfx(name){
    if(soundOn && sounds[name]){
        sounds[name].currentTime = 0;
        sounds[name].play().catch(()=>{});
    }
}



const shapes = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[1,0],[1,0],[1,1]],
    [[1,1,1],[0,1,0]],
    [[1,1,0],[0,1,1]],
    [[1],[1],[1]],
    [[1,1,1]]
];



// START

function startGame(){

    sfx("click");

    homeScreen.classList.add("hidden");
    settingsScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");
    gameOverScreen.classList.add("hidden");

    score = 0;

    createBoard();
    generatePieces();

    updateScore();
}





function createBoard(){

    board = [];

    boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";


    for(let r=0;r<size;r++){

        board[r]=[];

        for(let c=0;c<size;c++){

            let cell=document.createElement("div");

            cell.className="cell";

            cell.dataset.row=r;
            cell.dataset.col=c;

            boardDiv.appendChild(cell);

            board[r][c]=0;
        }
    }
}




// CREATE PIECES

function generatePieces(){

    let area=document.getElementById("pieces");

    area.innerHTML="";


    for(let i=0;i<3;i++){

        let shape =
        shapes[Math.floor(Math.random()*shapes.length)];


        let piece=document.createElement("div");

        piece.className="piece";

        piece.shape=shape;


        drawPiece(piece,shape);


        piece.onmousedown=()=>grab(piece,shape);


        piece.ontouchstart=(e)=>{

            e.preventDefault();

            grab(piece,shape);

        };


        area.appendChild(piece);

    }
}





function drawPiece(piece,shape){

    piece.innerHTML="";

    piece.style.gridTemplateColumns =
    `repeat(${shape[0].length},22px)`;


    shape.forEach(row=>{

        row.forEach(block=>{

            let b=document.createElement("div");

            b.className =
            block ? "miniBlock":"emptyBlock";

            piece.appendChild(b);

        });

    });

}





// DRAG START

function grab(piece,shape){

    selectedPiece = shape;
    selectedElement = piece;
    dragging = true;

}





document.addEventListener("mousemove",e=>{

    if(dragging)
        move(e);

});



document.addEventListener("touchmove",e=>{

    if(dragging){

        e.preventDefault();

        move(e.touches[0]);

    }

},{passive:false});



document.addEventListener("mouseup",e=>{

    if(dragging)
        drop(e);

});



document.addEventListener("touchend",e=>{

    if(dragging)
        drop(e.changedTouches[0]);

});
// DRAG MOVE

function move(pos){

    let cell =
    document.elementFromPoint(
        pos.clientX,
        pos.clientY
    );


    if(cell && cell.classList.contains("cell")){

        showGhost(
            Number(cell.dataset.row),
            Number(cell.dataset.col)
        );

    }

}





function drop(pos){

    let cell =
    document.elementFromPoint(
        pos.clientX,
        pos.clientY
    );


    if(cell && cell.classList.contains("cell")){

        place(
            Number(cell.dataset.row),
            Number(cell.dataset.col)
        );

    }


    clearGhost();

    dragging=false;

}





// GHOST

function showGhost(row,col){

    clearGhost();


    row -= Math.floor(selectedPiece.length/2);
    col -= Math.floor(selectedPiece[0].length/2);


    if(!canPlace(row,col,selectedPiece))
        return;


    for(let r=0;r<selectedPiece.length;r++){

        for(let c=0;c<selectedPiece[r].length;c++){

            if(selectedPiece[r][c]){

                let cell =
                document.querySelectorAll(".cell")
                [(row+r)*size+(col+c)];


                cell.classList.add("ghostBlock");

                ghost.push(cell);

            }
        }
    }

}



function clearGhost(){

    ghost.forEach(c=>
        c.classList.remove("ghostBlock")
    );

    ghost=[];

}





// CHECK

function canPlace(row,col,shape){

    for(let r=0;r<shape.length;r++){

        for(let c=0;c<shape[r].length;c++){

            if(shape[r][c]){

                if(
                    row+r<0 ||
                    col+c<0 ||
                    row+r>=size ||
                    col+c>=size ||
                    board[row+r][col+c]
                ){
                    return false;
                }

            }

        }

    }

    return true;

}





// PLACE

function place(row,col){

    row -= Math.floor(selectedPiece.length/2);
    col -= Math.floor(selectedPiece[0].length/2);


    if(!canPlace(row,col,selectedPiece))
        return;


    for(let r=0;r<selectedPiece.length;r++){

        for(let c=0;c<selectedPiece[r].length;c++){

            if(selectedPiece[r][c])
                board[row+r][col+c]=1;

        }

    }


    sfx("place");

    score+=10;


    selectedElement.remove();

    selectedPiece=null;


    clearLines();

    refresh();

    updateScore();


    if(document.querySelectorAll(".piece").length===0)
        generatePieces();


    setTimeout(checkGameOver,100);

}





// CLEAR LINES

function clearLines(){

    let rows=[];
    let cols=[];


    for(let r=0;r<size;r++){

        if(board[r].every(x=>x))
            rows.push(r);

    }


    for(let c=0;c<size;c++){

        let full=true;

        for(let r=0;r<size;r++){

            if(!board[r][c])
                full=false;

        }


        if(full)
            cols.push(c);

    }



    if(rows.length || cols.length){

        sfx("clear");

        score +=
        (rows.length+cols.length)*100;

    }



    rows.forEach(r=>{

        for(let c=0;c<size;c++)
            board[r][c]=0;

    });


    cols.forEach(c=>{

        for(let r=0;r<size;r++)
            board[r][c]=0;

    });

}





function refresh(){

    document.querySelectorAll(".cell")
    .forEach((cell,i)=>{

        let r=Math.floor(i/size);
        let c=i%size;


        cell.classList.toggle(
            "placedBlock",
            board[r][c]
        );

    });

}





// GAME OVER

function checkGameOver(){

    let pieces =
    document.querySelectorAll(".piece");


    for(let p of pieces){

        for(let r=0;r<size;r++){

            for(let c=0;c<size;c++){

                if(canPlace(r,c,p.shape))
                    return;

            }

        }

    }



    sfx("gameover");


    finalScore.innerText=score;

    gameOverScreen.classList.remove("hidden");

}





function restartGame(){

    gameOverScreen.classList.add("hidden");

    startGame();

}





// SCORE

function updateScore(){

    scoreDisplay =
    document.getElementById("score");

    scoreDisplay.innerText=score;

}





// SETTINGS

function openSettings(){

    sfx("click");

    homeScreen.classList.add("hidden");

    settingsScreen.classList.remove("hidden");

}



function goHome(){

    settingsScreen.classList.add("hidden");

    gameScreen.classList.add("hidden");

    homeScreen.classList.remove("hidden");

}



function openPrivacy(){

    window.location.href="privacy.html";

}



function openTerms(){

    window.location.href="terms.html";

}



function toggleSound(){

    soundOn=!soundOn;

    sfx("click");

}
