//GLOBAL HTML ELEMENT REFERENCES
var playerInfo = $("#playerInfo"); //Displays who is playing
var player1UsernameSpan = $("#player1"); //current player status
var player2UsernameSpan = $("#player2");
var gameStatus = $("#gameStatus");
var player1game = $("#player1game");
var player2game = $("#player2game");

//GLOBAL VAR STUFF
var yourUsername = "";
var activePlayersOnline = 0; //0 1 or 2
var whichPlayerYou = 0; //0 for not active, 1 or 2 for active
var hasPlayer1 = false;
var hasPlayer2 = false;

// Firebase
var config = {
    apiKey: "AIzaSyBgDcIGqs-x3FcDfVp5ED6H0dRQcUbRGTo",
    authDomain: "defaultsandbox.firebaseapp.com",
    databaseURL: "https://defaultsandbox.firebaseio.com",
    projectId: "defaultsandbox",
    storageBucket: "",
    messagingSenderId: "705283076455",
    appId: "1:705283076455:web:533ea7eb9e1330e2"
};

// Initialize Firebase
firebase.initializeApp(config);
var database = firebase.database();
// Database var references
var chatBox = database.ref("/chatRoom");
var players = database.ref("/players");
var specatators = database.ref("spectators");
// Initial Values
var playerName = "";

// On username submit
$("#chooseUsernamethingy").on("click", function(event) {
    yourUsername = $("#usernameField").val();
    $("#usernameField").val("");
    console.log(yourUsername);
    $("#usernameInputForm").hide();

    // If you can add a new active player
    if (activePlayersOnline < 2) {
        activePlayersOnline += 1;
        if (hasPlayer1) {
            whichPlayerYou = 2;
        } else {
            whichPlayerYou = 1;
        }

        console.log("New active Player", whichPlayerYou);
        var you = database.ref("/players/" + whichPlayerYou);
    } else {
        var you = database.ref("/spectators/" + yourUsername);
    }
    // create your databse data
    you.set({
        name: yourUsername,
        playernum: whichPlayerYou,
        wins: 0,
        losses: 0,
        choice: "none",
        dumbChoiceName: "none"
    });

    // Update username Display
    playerInfo.text("Your Username: " + yourUsername);

    //chat room
    var youChat = database.ref("/chatRoom/" + Date.now());

    //disconnect remove user
    setupPlayerGame(whichPlayerYou);
    you.onDisconnect().remove();
    youChat.onDisconnect().remove();
});

// Firebase stuff
//Setup page
players.on("value", function(snapshot) {
    //if value changes because player disconnect
    hasPlayer1 = snapshot.child("1").exists();
    hasPlayer2 = snapshot.child("2").exists();
    // if there were more than one player, check to see if they left
    if (activePlayersOnline > 0) {
        if (!hasPlayer1) {
            playerDisconnect(1);
        }
        if (!hasPlayer2) {
            playerDisconnect(2);
        }
    }

    //setup
    activePlayersOnline = snapshot.numChildren();
    if (activePlayersOnline > 0) {
        if (hasPlayer1 && !hasPlayer2) {
            var player1UserName = snapshot.child("1").val().name;
            player1UsernameSpan.text("Player 1: " + player1UserName);
        } else if (hasPlayer2 && !hasPlayer1) {
            var player2userName = snapshot.child("2").val().name;
            player2UsernameSpan.text("Player 2: " + player2userName);
        } else {
            var player1UserName = snapshot.child("1").val().name;
            player1UsernameSpan.text("Player 1: " + player1UserName);
            var player2userName = snapshot.child("2").val().name;
            player2UsernameSpan.text("Player 2: " + player1UserName);
        }
    }
});

database.ref().on(
    "child_added",
    function(snapshot) {
        // Log everything that's coming out of snapshot
        // console.log(snapshot.val());
    },
    function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    }
);

//sets up player click options
function setupPlayerGame(playerNum) {
    var optns = ["rock", "paper", "scissors"];
    var optnsText = [
        "Hardened Potato",
        "Thin Ink-Friendly Potato",
        "Sharp Potato for Cutting"
    ];

    // prompt text
    var promptText = $("<h5>");
    promptText.text("Pick your poison... or potato");
    if (playerNum == 1) {
        player1game.append(promptText);
    } else {
        player2game.append(promptText);
    }

    // Display Player Choice btns
    for (var i = 0; i < optns.length; i++) {
        var playerChoiceBtn = $("<button>");
        playerChoiceBtn.addClass("btn btn-secondary btn-lg btn-block");
        playerChoiceBtn.attr("data_optn", optns[i]);
        playerChoiceBtn.attr("data_dumbOptnName", optnsText[i]);
        playerChoiceBtn.attr("data_whichPlayerOptns", playerNum.toString());
        playerChoiceBtn.text(optnsText[i]);
        playerChoiceBtn.on("click", function() {
            // console.log($(this).attr("data_optn"));
            var yourChoice = $(this).attr("data_optn");
            database
                .ref("/players/" + $(this).attr("data_whichPlayerOptns"))
                .update({ choice: yourChoice });
            var dumbChoiceName = $(this).attr("data_optn");
            database
                .ref("/players/" + $(this).attr("data_whichPlayerOptns"))
                .update({ dumbChoiceName: $(this).attr("data_dumbOptnName") });
            // degbug log the choice in database
            // database
            //     .ref("/players/" + playerNum.toString())
            //     .once("value")
            //     .then(function(snapshot) {
            //         console.log(snapshot.val().choice);
            //     });
            // function for when player makes choice
            playerChoose(playerNum, yourChoice, dumbChoiceName);
        });
        if (playerNum == 1) {
            player1game.append(playerChoiceBtn);
        } else {
            player2game.append(playerChoiceBtn);
        }
    }
}

//when player makes choice
function playerChoose(playerNum, choice, dumbChoiceName) {
    // display choice made div

    var yourChoiceText = $("<h4>");
    yourChoiceText.text("You chose " + choice);

    console.log("Player " + playerNum + " chose " + dumbChoiceName);

    if (playerNum == 1) {
        player1game.empty();
        player1game.append(yourChoiceText);
    } else {
        player2game.empty();
        player2game.append(yourChoiceText);
    }
}

// when player disconnects remove player display
function playerDisconnect(playerNum) {
    if (playerNum == 1) {
        player1game.empty();
        player1UsernameSpan.text("Waiting for player to join...");
    } else {
        player2game.empty();
        player2UsernameSpan.text("Waiting for player to join...");
    }
}
