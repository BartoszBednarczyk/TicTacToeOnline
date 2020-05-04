// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCftNLJX-1KzMg8cVtwzqp8kYI8KUPxSHU",
    authDomain: "tictactoe-55d7e.firebaseapp.com",
    databaseURL: "https://tictactoe-55d7e.firebaseio.com",
    projectId: "tictactoe-55d7e",
    storageBucket: "tictactoe-55d7e.appspot.com",
    messagingSenderId: "81145643514",
    appId: "1:81145643514:web:88746559dde8e379c46443"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var databaseListener;

var roomNumber = 0;
var yourSign = 0;
var currentTurn = 0;
var board = 0;
var win = 0;
var nextGame = 0;
var unsubscribe = null;

var confettiSettings = { target: 'my-canvas' };
var confetti = new ConfettiGenerator(confettiSettings);

function createGame(){
    document.getElementById("menu").style.display = 'none';
    document.getElementById("createGame").style.display = 'block';

    //Check first empty room and set the game

    database.ref().once('value').then(function(snapshot){
        number = snapshot.numChildren();
        var i = 1;
        while(snapshot.child(i).exists()){
            i++;
        }
        roomNumber = i;
        database.ref(roomNumber).set({
            "players": "1",
            "turn": "X",
            "board": [0,0,0,0,0,0,0,0,0],
            "nextGame": "0"
        });
        document.getElementById("roomID").innerHTML = roomNumber;

        //Listener waiting for 2 players
        database.ref(roomNumber).on('value', function playerListener(snapshot){
            
            if(snapshot.child("players").val() == "2"){
            database.ref(roomNumber).off();
            yourSign = "X";
            game();
            }
        }); //; added here
    });
    

}

function backToMenuFromCreating(){
    document.getElementById("menu").style.display = 'block';
    document.getElementById("createGame").style.display = 'none';
    document.getElementById("roomID").innerHTML = "Waiting for room...";
    
    //Check if room has been created and delete it

    if (roomNumber != 0){
        database.ref(roomNumber).once('value').then(function(snapshot){
            if (snapshot.exists()){
                database.ref(roomNumber).remove();
                roomNumber = 0;
            }
        });
    } 
}

function backToMenuFromJoining(){
    document.getElementById("menu").style.display = 'block';
    document.getElementById("joinGame").style.display = 'none';
}


function joinGame(){
    document.getElementById("menu").style.display = 'none';
    document.getElementById("joinGame").style.display = 'block';

    yourSign = "O";
}

function checkID(){
    var inputValue = 0;
    inputValue = document.getElementById("inputCode").value;
    if (inputValue == ""){inputValue=0}
    database.ref().once('value').then(function(snapshot){
    if(snapshot.child(inputValue).exists())
    {
        if(snapshot.child(inputValue+"/players").val()=="1"){
            yourSign = "O";
            database.ref(inputValue).update({
                "players": "2"
            });
            roomNumber = inputValue;
            game();
        }
        else {
            alert("There's already 2 players!");
        }
    }
    else{
        alert("This room doesn't exist");
    }
    });
}

function game(){
 
    document.getElementById("createGame").style.display = 'none';
    document.getElementById("joinGame").style.display = 'none';
    document.getElementById("game").style.display = 'grid';
    document.getElementById("divider").style.display="block";
    document.getElementById("playAgain").style.display="none";
    document.getElementById("winPane").style.display = "none";
    win=0;
    board = [0,0,0,0,0,0,0,0,0];
    database.ref(roomNumber).update({
        "board": [0,0,0,0,0,0,0,0,0]
    });
    if (yourSign == "X"){
        document.getElementById("yourSign").innerHTML = "❌";
    }
    else if (yourSign == "O"){
        document.getElementById("yourSign").innerHTML = "⭕️";
    }
    else{
        alert("Something went wrong. Please refresh the page and try again!");
    }
    
    
    unsubscribe = database.ref(roomNumber).on('value', function test(snapshot){
        if (win==0){
            currentTurn = snapshot.child("turn").val();
            board = snapshot.child("board").val();
            switch (currentTurn)
            {
                case "X":
                    document.getElementById("turn").innerHTML = "❌";
                    break;
                case "O":
                    document.getElementById("turn").innerHTML = "⭕️";
                    break;
            }
            
            for (var i = 0; i < 9; i++){
                switch (board[i]){
                    case 0:
                        document.getElementById("btn"+i).innerHTML = "";
                        break;
                    case "X":
                        document.getElementById("btn"+i).innerHTML = "❌";
                        break;
                    case "O":
                        document.getElementById("btn"+i).innerHTML = "⭕️";
                        break;
                }
            }
            checkWinState();
        }
    
        if(win==1){
            document.getElementById("divider").style.display="none";
            document.getElementById("playAgain").style.display="block";
            
        } else if (win==2){
            if(snapshot.child("nextGame").val()=="2"){
                database.ref(roomNumber).update({
                    "board": [0,0,0,0,0,0,0,0,0]
                });
                
                win=0;
                document.getElementById("my-canvas").style.display = "none";
                confetti.clear();
                nextGame = 0;
                
                document.getElementById("createGame").style.display = 'none';
                document.getElementById("joinGame").style.display = 'none';
                document.getElementById("game").style.display = 'grid';
                document.getElementById("divider").style.display="block";
                document.getElementById("playAgain").style.display="none";
                document.getElementById("winPane").style.display = "none";
                clearParams();
            }
        }
    });
}

function clearParams(){
    database.ref(roomNumber).update({
        "board": [0,0,0,0,0,0,0,0,0],
        "nextGame": "0"
    });
}




function playAgain(){
    if(win==1)
    {
        
        database.ref(roomNumber).once('value').then(function(snapshot){
            nextGame = snapshot.child("nextGame").val();
            
            document.getElementById("playAgain").innerHTML = "Ready";
            if (nextGame == "0"){
                database.ref(roomNumber).update({"nextGame": "1"});
                win=2;
                
            }
            else if (nextGame == "1")
            {
                database.ref(roomNumber).update({"nextGame": "2"});
                win=2;
               
            }
        });
    }
}

function checkWinState(){
if ((board[0]=="X" && board[1]=="X" && board[2]=="X") || (board[3]=="X" && board[4]=="X" && board[5]=="X")
|| (board[6]=="X" && board[7]=="X" && board[8]=="X") || (board[0]=="X" && board[3]=="X" && board[6]=="X")
|| (board[1]=="X" && board[4]=="X" && board[7]=="X") || (board[2]=="X" && board[5]=="X" && board[8]=="X")
|| (board[0]=="X" && board[4]=="X" && board[8]=="X") || (board[2]=="X" && board[4]=="X" && board[6]=="X"))
{
    if(yourSign=="X")
    {
        confettiSettings = { target: 'my-canvas' };
        confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        document.getElementById("my-canvas").style.display = "block";
        document.getElementById("winPane").innerHTML = "WIN";
        document.getElementById("winPane").style.display = "flex";
    }
    else {
        confettiSettings = { target: 'my-canvas',
        colors: [[132,132,130], [77,77,78], [37,35,33], [27,27,27]] };
        confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        document.getElementById("my-canvas").style.display = "block";

        document.getElementById("winPane").innerHTML = "LOSE";
        document.getElementById("winPane").style.display = "flex";
    }
    win=1;
}
else if ((board[0]=="O" && board[1]=="O" && board[2]=="O") || (board[3]=="O" && board[4]=="O" && board[5]=="O")
|| (board[6]=="O" && board[7]=="O" && board[8]=="O") || (board[0]=="O" && board[3]=="O" && board[6]=="O")
|| (board[1]=="O" && board[4]=="O" && board[7]=="O") || (board[2]=="O" && board[5]=="O" && board[8]=="O")
|| (board[0]=="O" && board[4]=="O" && board[8]=="O") || (board[2]=="O" && board[4]=="O" && board[6]=="O"))
{
    win=1;
    if(yourSign=="O")
    {
        confettiSettings = { target: 'my-canvas'};
        confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        document.getElementById("my-canvas").style.display = "block";
        document.getElementById("winPane").innerHTML = "WIN";
        document.getElementById("winPane").style.display = "flex";
        
    }
    else {
        confettiSettings = { target: 'my-canvas',
        colors: [[132,132,130], [77,77,78], [37,35,33], [27,27,27]] };
        confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        document.getElementById("my-canvas").style.display = "block";
        document.getElementById("winPane").innerHTML = "LOSE";
        document.getElementById("winPane").style.display = "flex";
    }
    win=1;

    
}
else if(board[0] != 0 && board[1] != 0 && board[2] != 0 && board[3] != 0 && board[4] != 0 && board[5] != 0 && board[6] != 0 && board[7] != 0 && board[8] != 0 && board[9] != 0){
        document.getElementById("winPane").innerHTML = "DRAW";
        document.getElementById("winPane").style.display = "flex";
win=1;
    
}
}

function pressButton(num){
    if (win==0){
        if (yourSign == currentTurn){
            if(board[num] == 0)
            {
                database.ref(roomNumber).update({"nextGame": "0"});
                board[num] = yourSign;
                document.getElementById("btn"+num).innerHTML = (yourSign=="X")? "❌":"⭕️";
                database.ref(roomNumber).update({"board": board});
                switch (currentTurn)
                {
                    case "X":
                        currentTurn = "O";
                        database.ref(roomNumber).update({"turn": "O"});
                        break;
                    case "O":
                        currentTurn = "X";
                        database.ref(roomNumber).update({"turn": "X"});
                        break;
                }
            }
            else{
                alert("This place is already taken!");
            }
        }
        else {
            alert("Not your turn!")
        }
    } else{
        alert("Game is over!")
        
    }
    
}