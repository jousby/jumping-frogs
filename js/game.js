
// ----------------------------------------------------------------- Game Types

Direction = {
    LEFT : 0,
    RIGHT : 1
}

Move = {
    STEP: 1,
    JUMP: 2
}

function Frog(id, direction) {
  this.id = id;
  this.direction = direction;
}

//---------------------------------------------------------------- Game Globals

var gameBoard;  

//------------------------------------------------------------------- Game Init

$(document).ready(function() {

  $('#gameBoardRow').hide();
  $('#gameControls').hide();
  
  $('#resetButton').click(function() { 
    location.reload(); 
  });
  
  // get the number of frogs and start game when user hits 'start'.
  $('#startGameForm').submit(function (evt) {
    evt.preventDefault();
    
    var numberOfFrogs = $('#numberOfFrogsInput').val();
    
    // These validation rules are enforced by the numerical input field in
    // html 5. This is just in case we are on an older browser. 
    var numerical = !isNaN(numberOfFrogs);    
    var positiveEven = false;
    if (numerical) positiveEven = (numberOfFrogs > 0) && (numberOfFrogs % 2 == 0); 
        
    if (positiveEven) {
      startGame(numberOfFrogs);      
    }
    else {
      alert("Number of frogs needs to be an even number > 0");
    }
    
  });
  
});

// ------------------------------------------------------------- Game Mechanics 
  
function startGame(numberOfFrogs) {
  // remove start game form
  $('#gameStartRow').remove();
  
  // build game board
  initGameBoard(numberOfFrogs);
  
  // show game board div
  $('#gameBoardRow').show();
  $('#gameControls').show();
}

function initGameBoard(numberOfFrogs) {
  gameBoard = new Array(numberOfFrogs + 1);
  
  // populate board with right facing frogs
  for (var i = 0; i < numberOfFrogs / 2; i++) {
    gameBoard[i] = new Frog(i, Direction.RIGHT);
  }
  
  // populate board with left facing frogs
  for (var i = (numberOfFrogs / 2) + 1; i <= numberOfFrogs; i++) {
    gameBoard[i] = new Frog(i, Direction.LEFT);
  }  
  
  createGameBoardView();
}

/**
 * Find the position of the specified frog on the game board.
 * 
 * @param frogId 
 * @returns {Number} the game board position
 */
function frogPosition(frogId) {
  for (var i = 0; i < gameBoard.length; i++) {
    var currentFrog = gameBoard[i];    
    if (currentFrog != null && currentFrog.id == frogId) {
      return i;
    }
  }
}

/**
 * Find the empty game board position into which a frog can jump.
 * 
 * @param frogId 
 * @returns {Number} the game board position
 */
function emptyPosition() {
  for (var i = 0; i < gameBoard.length; i++) {
    var currentFrog = gameBoard[i];    
    if (currentFrog == null) {
      return i;
    }
  }
}
/**
 * If the specified frog can legally get to the empty position then move him 
 * there.
 * 
 * Update the game view afterwards
 * 
 * @param frogId
 */
function moveFrog(frogId) {
  var frogPos = frogPosition(frogId);
  var frog = gameBoard[frogPos];
  
  // check to see if the empty position is one 
  // of the possible moves for this frog
  var emptyPos = emptyPosition();
  var validMove = isMoveable(frogPos, emptyPos);
  
  if (validMove) {
    gameBoard[emptyPos] = frog;
    gameBoard[frogPos] = null;
  }
  
  updateGameBoardView(frogPos, emptyPos);
  
  hasGameReachedAnEndState();
}

function hasGameReachedAnEndState() {
  if (!hasValidMoves()) {
    if (hasReachedWinningPosition())
      displayWinMessage();
    else {
      displayLoseMessage();
    }
  }
  else {
    applyMoveableStyling();
  }
}

function hasValidMoves() {
  var hasMoves = false;
  var emptyPos = emptyPosition();
  
  var possibleMoves = [emptyPos - Move.STEP, emptyPos - Move.JUMP, emptyPos + Move.STEP, emptyPos + Move.JUMP];
  
  for (var i = 0; i < possibleMoves.length && !hasMoves; i++) {
    if (isMoveable(possibleMoves[i], emptyPos)) {
      hasMoves = true;
    }
  }
  
  return hasMoves;
}

function isMoveable(pos, emptyPos) {
  var moveable = false;
  
  if (pos >= 0 && pos < gameBoard.length && pos != emptyPos) {
    var frog = gameBoard[pos];

    var possibleMoves;
    if (frog.direction == Direction.LEFT)
      possibleMoves = [pos - Move.STEP, pos - Move.JUMP];
    else 
      possibleMoves = [pos + Move.STEP, pos + Move.JUMP];    

    moveable = possibleMoves.indexOf(emptyPos) != -1;
  }
  
  return moveable;
}

function hasReachedWinningPosition() {  
  var winning = true;
  var numberOfFrogs = gameBoard.length - 1;
  
  for (var i = 0; i < numberOfFrogs / 2; i++) {
    if (gameBoard[i] == null || gameBoard[i].direction === Direction.RIGHT) {
      winning = false;
      break;
    }
  }
  
  if (winning) {
    for (var i = (numberOfFrogs / 2) + 1; i <= numberOfFrogs; i++) {
      if (gameBoard[i] == null || gameBoard[i].direction === Direction.LEFT) {
        winning = false;
        break;
      }
    } 
    
  }
  
  return winning;
}

//------------------------------------------------------------------- Game View

/** 
 * Called whenever the underlying game board model changes to update the display
 */ 
function createGameBoardView() {
  for (var i = 0; i < gameBoard.length; i++) {
    var currentFrog = gameBoard[i];
        
    var newListItem = 
      $('<li>' +
          '<p class="frogHolder">' + 
            '<img class="frog" src="img/frog-circle-right.png" alt="right facing frog">' +
          '</p>' + 
        '</li>');    
    
    if (currentFrog == null) {
      applyEmptyStyling(newListItem);
    } 
    else {
      applyFrogStyling(newListItem, currentFrog);
    }    
    
    $('#frogs').append(newListItem);    
  }   
  
  applyMoveableStyling();
}

function updateGameBoardView(newEmptyPos, newFrogPos) {  
  var emptyListItem = $('ul li:nth-child(' + (newEmptyPos+1) + ')');
  var frogListItem = $('ul li:nth-child(' + (newFrogPos+1) + ')');
  
  applyEmptyStyling(emptyListItem);
  
  var frog = gameBoard[newFrogPos];
  applyFrogStyling(frogListItem, frog);
}

function cleanListItem(listItem) {
  listItem.removeAttr('id');
  
  var image = listItem.find('img');  
  image.removeClass('frog'); 
  image.removeClass('leftFrog'); 
}

function applyEmptyStyling(listItem) {
  cleanListItem(listItem);
  
  var image = listItem.find('img');
  
  image.attr('src', 'img/circle.png');
  image.attr('alt', 'empty position');
}

function applyFrogStyling(listItem, frog) {
  cleanListItem(listItem);

  listItem.attr('id', frog.id);
  
  var image = listItem.find('img');
  
  image.addClass('frog'); 
  
  if (frog.direction === Direction.LEFT) {
    image.attr('src', 'img/frog-circle-left.png');
    image.attr('alt', 'left facing frog');
  }
  else {
    image.attr('src', 'img/frog-circle-right.png');
    image.attr('alt', 'right facing frog');       
  }
}

function applyMoveableStyling() {
  $('#frogs li').removeClass('moveable');
  $('#frogs li').unbind('click');
  
  var emptyPos = emptyPosition();
  $('#frogs li').each(function(pos, li) {
    if (isMoveable(pos, emptyPos))
      $(li).addClass('moveable');
  }); 
  
  // re setup event listeners for frog elements
  $('.moveable').click(function() {    
    moveFrog(this.id);
  });
}

function displayWinMessage() {
  $('#frogListHolder').append('<p> Congratulations. You Win. </p>');
  $('#resetButton').text('New Game');
}

function displayLoseMessage() {
  $('#frogListHolder').append('<p> No more valid moves. </br> Please try again. </p>');
  $('#resetButton').text('New Game');
}

