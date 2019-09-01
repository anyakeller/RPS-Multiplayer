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

// Capture Button Click
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
    you.set({
        name: yourUsername,
        playernum: whichPlayerYou,
        wins: 0,
        losses: 0,
        choice: "none"
    });

    //chat room
    var youChat = database.ref("/chatRoom/" + Date.now());
    //disconnect remove user
    you.onDisconnect().remove();
    youChat.onDisconnect().remove();
    if (activePlayersOnline == 2) {
        setupPlayerGame();
    }
});
// Firebase stuff
//Setup page
players.on("value", function(snapshot) {
    hasPlayer1 = snapshot.child("1").exists();
    hasPlayer2 = snapshot.child("2").exists();
    activePlayersOnline = snapshot.numChildren();
    if (activePlayersOnline > 0) {
        if (hasPlayer1 && !hasPlayer2) {
            var player1UserName = snapshot.child("1").val().name;

            player1UsernameSpan.text(player1UserName);
        } else if (hasPlayer2 && !hasPlayer1) {
            var player2userName = snapshot.child("2").val().name;
            player2UsernameSpan.text(player2userName);
        } else {
            var player1UserName = snapshot.child("1").val().name;
            player1UsernameSpan.text(player1UserName);
            var player2userName = snapshot.child("2").val().name;
            player2UsernameSpan.text(player2userName);
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
function setupPlayerGame() {
    var optns = ["rock", "paper", "scissors"];
    var optnsText = [
        "Hardened Potato",
        "Thin Ink-Friendly Potato",
        "Sharp Potato for Cutting"
    ];
    for (var i = 0; i < optns.length; i++) {
        var playerChoiceBtn = $("<button>");
        playerChoiceBtn.addClass("btn btn-secondary btn-lg btn-block");
        playerChoiceBtn.attr("data_optn", optns[i]);
        playerChoiceBtn.attr("data_whichPlayerOptns", "1");
        playerChoiceBtn.text(optnsText[i]);
        playerChoiceBtn.on("click", function() {
            // console.log($(this).attr("data_optn"));
            var yourChoice = $(this).attr("data_optn");
            database.ref("/players/1").update({ choice: yourChoice });
            database
                .ref("/players/1")
                .once("value")
                .then(function(snapshot) {
                    console.log(snapshot.val().choice);
                });
        });
        player1game.append(playerChoiceBtn);
    }
    for (var i = 0; i < optns.length; i++) {
        var playerChoiceBtn = $("<button>");
        playerChoiceBtn.addClass("btn btn-secondary btn-lg btn-block");
        playerChoiceBtn.attr("data_optn", optns[i]);
        playerChoiceBtn.attr("data_whichPlayerOptns", "2");
        playerChoiceBtn.text(optnsText[i]);
        playerChoiceBtn.on("click", function() {
            // playerChoose(2, thisOptn);
            // console.log(thisOptn);
        });
        player2game.append(playerChoiceBtn);
    }
}

//when player makes choice
function playerChoose(playerNum, choice) {
    var playerGameChoiceDiv = $("<div>");

    if (playerNum == 1) {
        console.log(players.child("1"));
        player1game.empty();
    } else {
        console.log(players.child("2"));
        player2game.empty();
    }
}
