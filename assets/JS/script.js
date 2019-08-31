//GLOBAL HTML ELEMENT REFERENCES
var playerInfo = $("#playerInfo"); //Displays who is playing
var player1UsernameSpan = $("#player1"); //current player status
var player2UsernameSpan = $("#player2");
var gameStatus = $("#gameStatus");

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
var players = database.ref("players");
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
        choice: null
    });

    //chat room
    var youChat = database.ref("/chatRoom/" + Date.now());
    //disconnect remove user
    you.onDisconnect().remove();
    youChat.onDisconnect().remove();
});
// Firebase stuff
//Setup page
players.on("value", function(snapshot) {
    hasPlayer1 = snapshot.child("1").exists();
    hasPlayer2 = snapshot.child("2").exists();
    activePlayersOnline = snapshot.numChildren();
    if (activePlayersOnline > 0) {
        console.log("ppl playing");
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