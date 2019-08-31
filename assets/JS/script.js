//GLOBAL HTML ELEMENT REFERENCES
var playerInfo = $("#playerInfo"); //Displays who is playing
var player1 = $("#player1"); //current player status
var player2 = $("#player2");

//GLOBAL VAR STUFF
var numPlayers = NaN;
var yourUsername = "";
var howManyActivePlayers = 0; //0 1 or 2
var whichPlayerYou = 0; //0 for not active, 1 or 2 for active

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
var players = database.ref("onlinePlayers");
var chatBox = database.ref("/chatRoom");
var activePlayers = database.ref("activePlayers");
// Initial Values
var playerName = "";
// Capture Button Click
$("#chooseUsernamethingy").on("click", function(event) {
    yourUsername = $("#usernameField").val();
    $("#usernameField").val("");
    console.log(yourUsername);
    $("#usernameInputForm").hide();

    // If you can add a new active player
    if (howManyActivePlayers < 2) {
        howManyActivePlayers += 1;
        whichPlayerYou = howManyActivePlayers;
        var you = database.ref("/activePlayers/" + yourUsername);
        console.log("New active Player", whichPlayerYou);
    } else {
        var you = database.ref("/onlinePlayers/" + yourUsername);
        //if active players full
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
    // Code for the push
    // dataRef.ref().push({
    //     name: name,
    //     email: email,
    //     age: age,
    //     comment: comment,
    //     dateAdded: firebase.database.ServerValue.TIMESTAMP
    // });
});
// Firebase stuff
players.on("value", function(snapshot) {
    numPlayers = snapshot.numChildren();
});

database.ref().on(
    "child_added",
    function(snapshot) {
        // Log everything that's coming out of snapshot
        console.log(snapshot.val());
    },
    function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    }
);
