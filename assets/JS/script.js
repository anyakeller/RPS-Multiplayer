//GLOBAL HTML ELEMENT REFERENCES
var playerInfo = $("#playerInfo"); //Displays who is playing
var player1UsernameSpan = $("#player1"); //current player status
var player2UsernameSpan = $("#player2");
var gameStatus = $("#gameStatus");
var player1game = $("#player1game");
var player2game = $("#player2game");
var roundNum = $("#roundNum");

//GLOBAL VAR STUFF
var yourUsername = "Default Potato";
var activePlayersOnline = 0; //0 1 or 2
var whichPlayerYou = 0; //0 for not active, 1 or 2 for active
var hasPlayer1 = false;
var hasPlayer2 = false;
var whoBeatsWho = { paper: "rock", scissors: "paper", rock: "scissors" };
var optns = ["rock", "paper", "scissors"];
var optnsText = [
    "Hardened Potato",
    "Thin Ink-Friendly Potato",
    "Sharp Potato for Cutting"
];

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
var players = database.ref("/players/");
var specatators = database.ref("spectators");
var roundInfo = database.ref("/roundInfo");
roundInfo.set({ roundNumber: 0, roundStatus: true });
// Initial Values
var playerName = "";

roundInfo.on("value", function(snapshot) {
    if (snapshot.val().roundStatus === true) {
        roundNum.text(snapshot.val().roundNumber);
    }
});

// On username submit
$("#chooseUsernamethingy").on("click", function(event) {
    usernameInput = $("#usernameField").val();
    if (usernameInput.trim() !== "") {
        yourUsername = usernameInput;
    }
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
        $("#whichPlayerNum").text("You are player number " + whichPlayerYou);
    } else {
        var you = database.ref("/spectators/" + yourUsername);
    }
    // create your databse data
    you.set({
        name: yourUsername,
        playernum: whichPlayerYou,
        wins: 0,
        losses: 0,
        ties: 0,
        choice: "",
        dumbChoiceName: "",
        playerReady: true
    });

    // Update username Display
    playerInfo.text("Your Username: " + yourUsername);

    //chat room
    var youChat = database.ref("/chatRoom/" + Date.now());

    //disconnect remove user

    you.onDisconnect().remove();
    youChat.onDisconnect().remove();
});

// Firebase stuff
//Setup page
players.on("value", function(playerSnap) {
    //if value changes because player disconnect
    hasPlayer1 = playerSnap.child("1").exists();
    hasPlayer2 = playerSnap.child("2").exists();
    // if there were more than one player, check to see if they left
    if (activePlayersOnline > 0) {
        if (!hasPlayer1) {
            playerDisconnect(1);
        }
        if (!hasPlayer2) {
            playerDisconnect(2);
        }
    }
    activePlayersOnline = playerSnap.numChildren();

    //if value change was player choosing rps
    if (hasPlayer1) {
        var player1var = playerSnap.child("1");
        if (whichPlayerYou != 1 && player1var.val().choice !== "") {
            player1game.text("Player 1 has made their choice");
        }
    }
    if (hasPlayer2) {
        var player2var = playerSnap.child("2");
        if (whichPlayerYou != 2 && player2var.val().choice !== "") {
            player2game.text("Player 2 has made their choice");
        }
    }
    // console.log("yeet"); //this really doesn't help with debugging

    // when both players have chosen, do win logic
    // IDK why it runs this twice but I can't fix it
    if (hasPlayer1 && hasPlayer2) {
        if (
            playerSnap.child("1").val().playerReady &&
            playerSnap.child("2").val().playerReady
        ) {
            database.ref("/roundInfo").update({
                roundStatus: true
            });
            gameStatus.text("Game started. Players choosing.");
            setupPlayerGame(whichPlayerYou);
            if (whichPlayerYou == 1) {
                player2game.text("player choosing");
            } else {
                player1game.text("player choosing");
            }
        } else {
            database
                .ref("/roundInfo/")
                .once("value")
                .then(
                    (function(playerSnap) {
                        return function(roundInfo) {
                            var roundStatus = roundInfo.val().roundStatus;
                            if (roundStatus) {
                                var player1Choice = playerSnap.child("1").val()
                                    .choice;
                                var player2Choice = playerSnap.child("2").val()
                                    .choice;

                                if (
                                    player1Choice !== "" &&
                                    player2Choice !== ""
                                ) {
                                    database.ref("/roundInfo").update({
                                        roundStatus: false,
                                        roundNumber:
                                            roundInfo.val().roundNumber + 1
                                    });

                                    // Winner logic
                                    var winner = whoWins(
                                        player1Choice,
                                        player2Choice
                                    );
                                    console.log(winner + " won");

                                    if (winner == 0) {
                                        gameStatus.text("It's a Tie");
                                        database.ref("/players/1").update({
                                            ties:
                                                playerSnap.child("1").val()
                                                    .ties + 1
                                        });
                                        database.ref("/players/2").update({
                                            ties:
                                                playerSnap.child("2").val()
                                                    .ties + 1
                                        });
                                    } else if (winner == 1) {
                                        gameStatus.text("Player 1 wins!");
                                        database.ref("/players/1").update({
                                            wins:
                                                playerSnap.child("1").val()
                                                    .wins + 1
                                        });
                                        database.ref("/players/2").update({
                                            losses:
                                                playerSnap.child("2").val()
                                                    .losses + 1
                                        });
                                    } else {
                                        gameStatus.text("Player 2 wins!");
                                        database.ref("/players/1").update({
                                            losses:
                                                playerSnap.child("1").val()
                                                    .losses + 1
                                        });
                                        database.ref("/players/2").update({
                                            wins:
                                                playerSnap.child("2").val()
                                                    .wins + 1
                                        });
                                    }
                                    //Start next game button
                                    var startNextGameBtn = $("<button>");
                                    startNextGameBtn.addClass(
                                        "btn btn-secondary btn-lg btn-block"
                                    );
                                    startNextGameBtn.text("Start Next Round");
                                    var otherPlayerReady = playerSnap
                                        .child("2")
                                        .val().playerReady;
                                    startNextGameBtn.on(
                                        "click",
                                        (function(otherPlayerReady) {
                                            return function() {
                                                database
                                                    .ref(
                                                        "/players/" +
                                                            whichPlayerYou
                                                    )
                                                    .update({
                                                        choice: ""
                                                    });
                                                gameStatus.empty();
                                                gameStatus.text(
                                                    "Waiting for other player to confirm begin"
                                                );
                                                database
                                                    .ref(
                                                        "/players/" +
                                                            whichPlayerYou
                                                    )
                                                    .update({
                                                        playerReady: true
                                                    });
                                                console.log(otherPlayerReady);
                                            };
                                        })(otherPlayerReady)
                                    );
                                    gameStatus.append(startNextGameBtn);
                                }
                            }
                        };
                    })(playerSnap)
                );
        }
    }
});

// check who wins helper function
// returns 0 for tie, 1 or 2 for winner
function whoWins(player1Choice, player2Choice) {
    if (player1Choice === player2Choice) {
        return 0;
    } else if (whoBeatsWho[player1Choice] === player2Choice) {
        return 1;
    } else {
        return 2;
    }
}

players.on(
    "child_added",
    function(snapshot) {
        // Log everything that's coming out of snapshot
        // console.log(snapshot.val());
        //setup

        if (snapshot.val().playernum == 1) {
            // console.log("player 1 and no player 2");
            var player1UserName = snapshot.val().name;
            player1UsernameSpan.text("Player 1: " + player1UserName);
        } else {
            var player2UserName = snapshot.val().name;
            player2UsernameSpan.text("Player 2: " + player2UserName);
        }
    },
    function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    }
);

//sets up player click options
function setupPlayerGame(playerNum) {
    database.ref("/players/" + playerNum).update({ choice: "" });
    // prompt text
    var promptText = $("<h5>");
    promptText.text("Pick your poison... or potato");
    if (playerNum == 1) {
        player1game.empty();
        player1game.append(promptText);
    } else {
        player2game.empty();
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
        // when player makes choice
        playerChoiceBtn.on("click", function() {
            // console.log($(this).attr("data_optn"));
            var yourChoice = $(this).attr("data_optn");

            // update your choice in databse
            database
                .ref("/players/" + $(this).attr("data_whichPlayerOptns"))
                .update({ choice: yourChoice });
            var dumbChoiceName = $(this).attr("data_dumbOptnName");
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
    database.ref("/players/" + whichPlayerYou).update({
        playerReady: false
    });
    var yourChoiceText = $("<h4>");
    yourChoiceText.text("You chose " + dumbChoiceName);

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
    if (playerNum != whichPlayerYou && playerNum == 1) {
        player1game.empty();
        player1UsernameSpan.text("Waiting for player to join...");

        player2game.empty();
    } else {
        player2game.empty();
        player2UsernameSpan.text("Waiting for player to join...");

        player1game.empty();
    }
    // database.ref("/players/" + playerNum).update({ choice: "" });
}
