let score = 0;

let dragOffsetX = 0;
let dragOffsetY = 0;

const size = 8;

let board = [];

let selectedPiece = null;
let selectedElement = null;

let dragging = false;
let ghostCells = [];
let dragClone = null;


const shapes = [
[[1,1,1,1]],
[[1,1],[1,1]],
[[1,0],[1,1]],
[[1,1,1],[0,1,0]],
[[1,1,0],[0,1,1]],
[[1],[1],[1]],
[[1,1,1]]
];



// START

function startGame(){

document.getElementById("homeScreen").classList.add("hidden");

document.getElementById("gameScreen").classList.remove("hidden");

document.getElementById("gameOverScreen").classList.add("hidden");

score=0;

createBoard();

generatePieces();

updateScore();

}



// BOARD

function createBoard(){

let boardDiv=document.getElementById("board");

boardDiv.innerHTML="";

board=[];


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




// PIECES

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



piece.addEventListener("mousedown",()=>{

startDrag(shape,piece);

});


piece.addEventListener("touchstart",(e)=>{

e.preventDefault();

startDrag(shape,piece);

dragClone=piece.cloneNode(true);

dragClone.style.position="fixed";
dragClone.style.opacity=".8";
dragClone.style.pointerEvents="none";

document.body.appendChild(dragClone);


moveDrag(e.touches[0]);


},{passive:false});



area.appendChild(piece);


}


}



function drawPiece(piece,shape){

piece.innerHTML="";

piece.style.display="grid";

piece.style.gridTemplateColumns =
`repeat(${shape[0].length},25px)`;


shape.forEach(row=>{

row.forEach(block=>{


let b=document.createElement("div");

b.className =
block ? "miniBlock":"emptyBlock";


piece.appendChild(b);


});


});


}





// DRAG

function startDrag(shape,piece){

selectedPiece = shape;

selectedElement = piece;

dragging = true;


// center the piece correctly

dragOffsetX = Math.floor(shape[0].length / 2);

dragOffsetY = Math.floor(shape.length / 2);

}



document.addEventListener("mousemove",(e)=>{

if(dragging){

moveDrag(e);

}

});



document.addEventListener("mouseup",(e)=>{

if(dragging){

dropPiece(e);

}

});




document.addEventListener("touchmove",(e)=>{

if(dragging){

e.preventDefault();

moveDrag(e.touches[0]);

}

},{passive:false});



document.addEventListener("touchend",(e)=>{

if(dragging){

dropPiece(e.changedTouches[0]);

}

});







function moveDrag(pos){


if(dragClone){

dragClone.style.left =
pos.clientX-40+"px";

dragClone.style.top =
pos.clientY-40+"px";

}


let target =
document.elementFromPoint(
pos.clientX,
pos.clientY
);


if(target && target.classList.contains("cell")){


showGhost(
Number(target.dataset.row),
Number(target.dataset.col)
);


}


}






function dropPiece(pos){


let target =
document.elementFromPoint(
pos.clientX,
pos.clientY
);



if(target && target.classList.contains("cell")){


placePiece(
Number(target.dataset.row),
Number(target.dataset.col)
);


}



if(dragClone){

dragClone.remove();

dragClone=null;

}


clearGhost();


dragging=false;


}






// PLACE

function placePiece(row,col){

if(!selectedPiece)
return;


row -= dragOffsetY;

col -= dragOffsetX;


if(!canPlace(row,col,selectedPiece)){

clearGhost();

return;

}



for(let r=0;r<selectedPiece.length;r++){

for(let c=0;c<selectedPiece[r].length;c++){


if(selectedPiece[r][c]){

board[row+r][col+c]=1;

}


}

}


score+=10;

refresh();

  removePiece();

clearLines();

updateScore();


setTimeout(function(){

    checkGameOver();

},100);


}






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





// GHOST

function showGhost(row,col){

clearGhost();


row -= dragOffsetY;

col -= dragOffsetX;


if(!canPlace(row,col,selectedPiece))
return;



for(let r=0;r<selectedPiece.length;r++){

for(let c=0;c<selectedPiece[r].length;c++){


if(selectedPiece[r][c]){


let cell=document.querySelectorAll(".cell")
[(row+r)*size+(col+c)];


cell.classList.add("ghostBlock");

ghostCells.push(cell);


}

}

}


}



function clearGhost(){

ghostCells.forEach(c=>{

c.classList.remove("ghostBlock");

});


ghostCells=[];

}





// REMOVE

function removePiece(){

    if(selectedElement){
        selectedElement.remove();
    }


    selectedPiece = null;
    selectedElement = null;



    setTimeout(function(){

        let remaining =
        document.querySelectorAll(".piece").length;


        if(remaining === 0){

            generatePieces();

        }

    }, 50);

}

// CLEAR

function clearLines(){

let clear=[];


for(let r=0;r<size;r++){

if(board[r].every(x=>x)){

clear.push(["r",r]);

}

}


for(let c=0;c<size;c++){

let full=true;

for(let r=0;r<size;r++){

if(!board[r][c]) full=false;

}


if(full) clear.push(["c",c]);

}



clear.forEach(x=>{


if(x[0]=="r"){

for(let c=0;c<size;c++)
board[x[1]][c]=0;

}


else{

for(let r=0;r<size;r++)
board[r][x[1]]=0;

}


score+=100;


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





function checkGameOver(){

let pieces=document.querySelectorAll(".piece");


for(let p of pieces){

for(let r=0;r<size;r++){

for(let c=0;c<size;c++){

if(canPlace(r,c,p.shape))
return;

}

}

}



document.getElementById("finalScore").innerText=score;

document.getElementById("gameOverScreen").classList.remove("hidden");


}





function restartGame(){

document.getElementById("gameOverScreen").classList.add("hidden");

startGame();

}



function updateScore(){

document.getElementById("score").innerText=score;

}



function openSettings(){

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
