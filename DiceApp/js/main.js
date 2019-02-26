// shorthand DOM function
var s = function(sel) {
  return document.querySelector(sel);
};

// dice possibilities as a JS Object
var dice = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six" };

// player objects, initialized
var all = {
  human: [0, 0, 0],
  ai1: [0, 0, 0],
  ai2: [0, 0, 0]
};

// other vars
var dicePstr;
var diceP = new Object();
var currentBids = {
  ai1: [],
  ai2: [],
  human: []
};
var allDice = [];
var ai1Dice = [];
var ai2Dice = [];
var allDiceCount = 0;
var quantity, rank;
var loser = "";
var challenged = 0;
var alert = "#Scoreboard alert";
var oneOut = 0;
var allOut = "";
var player1 = "AI-1";
var player2 = "AI-2";
var player3 = "Human";

/////////////////////////////////////
// main procedures
s("#Bid").addEventListener("click", bid);
s("#Next").addEventListener("click", next);
s("#Challenge").addEventListener("click", challenge);

// probability matrix, read from AJAX
try {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      dicePstr = this.responseText;
      // put in local storage
      localStorage.setItem("prob", dicePstr);
    }
  };
  xhttp.open("GET", "https://www.akeela.tech/media/prob.json", true);
  xhttp.send();
} catch (e) {}

///////////////////////////////////
// functions
////////////////////////////////

function getNames() {
  var str =
    "Welcome to the game! Please enter your name:<br><input name='player3'><p>Name your AI opponents:<br><input name='player1'><br><input name='player2'><br><button id='PlayNew'>Play</button>";
  s("#modal").innerHTML = str;
  s("#modalWrap").classList.toggle("active");
  s("#PlayNew").addEventListener("click", init);
}

function init() {
  diceP = JSON.parse(localStorage.getItem("prob"));

  s("#modalWrap").classList.remove("active");
  flashy("#canvas");

  all = {
    human: [0, 0, 0],
    ai1: [0, 0, 0],
    ai2: [0, 0, 0]
  };
  allDiceCount = 9;

  currentBids = {
    ai1: [],
    ai2: [],
    human: []
  };
  allDice = [];
  ai1Dice = [];
  ai2Dice = [];
  loser = "";
  challenged = 0;
  oneOut = 0;
  allOut = "";

  // pick three random numbers for each player property in object
  chooseDice();

  // load dies into human square
  loadDice();

  // fill player info
  player1 = s("input[name='player1']").value || "AI-1";
  player2 = s("input[name='player2']").value || "AI-2";
  player3 = s("input[name='player3']").value || "You";
  s("#ai1 h2").innerHTML = player1;
  s("#ai2 h2").innerHTML = player2;
  s("#human h2").innerHTML = player3;
  s("#Scoreboard .ai1 player").innerHTML = player1;
  s("#Scoreboard .ai2 player").innerHTML = player2;
  s("#Scoreboard .human player").innerHTML = player3;
  // clear scoreboard, reset game elements
  //
  s("#StartGame").innerHTML = "Reset Game";
  s("#Stuff").classList.remove("hidden");
  s("#Bid").classList.remove("disabled");
  s("#Challenge").classList.remove("disabled");
  s("#Challenge").classList.add("hidden");
  s("#Next").classList.add("hidden");
  s("#StartGame").classList.add("disabled");
  s("#Quantity").focus();

  s(alert).innerHTML = "";

  Object.keys(currentBids).forEach(player => {
    var wh1 = "#Scoreboard ." + player + " quantity";
    var wh2 = "#Scoreboard ." + player + " rank";
    s(wh1).innerHTML = "??";
    s(wh2).innerHTML = "??";
  });

  updateQuantity();
}

function bid() {
  allDice = [];
  ai1Dice = [];
  ai2Dice = [];
  quantity = parseInt(s("#Quantity").value);
  rank = parseInt(s("#Rank").value);
  currentBids.human = [quantity, rank];
  // above we have info about the player's bid, and need AI1 to decide whether
  // to challenge or to raise the bid by rank or quanity. Probability threshold
  // needs to know how many dice are on the table and what AI1's dice are.

  // iterate to see how many dice are still on the table
  var boop = 0;

  for (var key in all) {
    for (var i = 0; i < all[key].length; i++) {
      if (all[key][i] != "") {
        allDice.push(all[key][i]);
        if (key == "ai1") {
          ai1Dice.push(all[key][i]);
        }
        if (key == "ai2") {
          ai2Dice.push(all[key][i]);
        }
      }
      allDiceCount = boop;
      boop++;
    }
  }

  // check bid against probability threshold
  if (allOut != "ai1") {
    checkProbability("ai1", boop);
  }

  // now deal with AI2
  if (challenged == 0 && allOut != "ai2") {
    checkProbability("ai2", boop);
  }

  // write bids to scoreboard
  Object.keys(currentBids).forEach(player => {
    var wh1 = "#Scoreboard ." + player + " quantity";
    var wh2 = "#Scoreboard ." + player + " rank";
    s(wh1).innerHTML = currentBids[player][0];
    s(wh2).innerHTML = currentBids[player][1];
  });
  // make it flash!
  s("#Challenge").classList.remove("hidden");
  flashy(".right");
}

function challenge(e) {
  if (!e.er) {
    if (allOut === "ai2") {
      var challenger = "human";
      var challengee = "ai1";
    } else {
      var challenger = "human";
      var challengee = "ai2";
    }
  } else {
    var challenger = e.er;
    var challengee = e.ee;
  }

  var quantity = currentBids[challengee][0];
  var rank = currentBids[challengee][1];
  var name = s("#" + challenger + " h2").innerHTML;
  var name2 = s("#" + challengee + " h2").innerHTML;

  // use rank to loop over allDice and load var
  var count = 0;
  for (i = 0; i < allDice.length; i++) {
    if (allDice[i] === rank) {
      count++;
    }
  }
  if (quantity > count) {
    loser = challengee;
    message = name + " challenged " + name2 + " and WON";
    s(alert).innerHTML = message;
  } else {
    loser = challenger;
    message = name + " challenged " + name2 + " and LOST";
    s(alert).innerHTML = message;
  }

  removeDie();
  s("#Bid").classList.add("disabled");
  s("#Challenge").classList.add("disabled");
  s("#Next").classList.remove("hidden");
  s("#Next").focus();
}

function next() {
  currentBids = {
    ai1: [],
    ai2: [],
    human: []
  };
  allDice = [];
  ai1Dice = [];
  ai2Dice = [];
  loser = "";
  challenged = 0;

  // re-roll
  chooseDice();
  // load dies into human square
  loadDice();

  // reset buttons visually
  s("#Bid").classList.remove("disabled");
  s("#Challenge").classList.remove("disabled");
  s("#Challenge").classList.add("hidden");
  s("#Next").classList.add("hidden");
  s("#Quantity").focus();
  // clear scoreboard
  //
  s(alert).innerHTML = "";

  Object.keys(currentBids).forEach(player => {
    var wh1 = "#Scoreboard ." + player + " quantity";
    var wh2 = "#Scoreboard ." + player + " rank";
    s(wh1).innerHTML = "??";
    s(wh2).innerHTML = "??";
  });
}

function reinit() {
  s("#modalWrap").classList.toggle("active");
  getNames();
  updateQuantity();
}

function keepPlaying() {
  s("#modalWrap").classList.toggle("active");
  next();
  updateQuantity();
}
/////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////
function chooseDice() {
  for (var key in all) {
    for (var i = 0; i < all[key].length; i++) {
      var rand = Math.floor(Math.random() * 6 + 1);
      all[key][i] = rand;
    }
  }
}

function loadDice() {
  for (var key in all) {
    if (allOut != key) {
      s("#" + key + " .dice").innerHTML =
        "<i class='fas fa-dice-d6'></i><i class='fas fa-dice-d6'></i><i class='fas fa-dice-d6'></i>";
    }
    for (var i = 0; i < all[key].length; i++) {
      if (key === "human") {
        var fas = "fas fa-dice-" + dice[all[key][i]];
        var n = i + 1;
        s("#" + key + " .dice i:nth-child(" + n + ")").className = fas;
      }
      if (all[key].length < 3) {
        s("#" + key + " .dice i:nth-child(3)").className = "";
      }
      if (all[key].length < 2) {
        s("#" + key + " .dice i:nth-child(2)").className = "";
      }
      if (all[key].length < 1) {
        s("#" + key + " .dice i:nth-child(1)").className = "";
      }
    }
  }
}

function showAllDice() {
  for (var key in all) {
    for (var i = 0; i < all[key].length; i++) {
      var fas = "on fas fa-dice-" + dice[all[key][i]];
      var n = i + 1;
      s("#" + key + " .dice i:nth-child(" + n + ")").className = fas;
    }
  }
}

function removeDie() {
  // show dies
  showAllDice();

  // remove a die from loser
  all[loser].pop();

  // if a player has all empty, they are out! message this and determine whether/how to keep playing
  checkEmpty();
  updateQuantity();
}

function checkEmpty() {
  var btn1 =
    "<br><button id='PlayAgain' onclick='reinit()'>Play Again</button>";
  var btn2 =
    "<br><button id='KeepPlaying' onclick='keepPlaying()'>Keep Playing</button>";
  if (!all[loser].length) {
    if (loser == "human") {
      var str = "You've lost all your dice!";
      str += btn1;
      s("#modal").innerHTML = str;
      s("#modalWrap").classList.toggle("active");
    } else if (loser == "ai1") {
      var str = player1 + " is out!";
      if (oneOut == 1) {
        str += btn1;
      } else {
        str += btn2;
      }
      s("#modal").innerHTML = str;
      s("#modalWrap").classList.toggle("active");
      oneOut = 1;
    } else {
      var str = player2 + " is out!";
      if (oneOut == 1) {
        str += btn1;
      } else {
        str += btn2;
      }
      s("#modal").innerHTML = str;
      s("#modalWrap").classList.toggle("active");
      oneOut = 1;
    }
    allOut = loser;
    // get rid of loser's dice
    var str2 = "#" + allOut + " .dice";
    s(str2).innerHTML = "";
  }
}

function checkProbability(which, boop) {
  // check bid against probability threshold
  // if probability threshold is too low, AI1 challenges
  // then factor in AI1's knowledge of her own dice:
  // iterate through ai1Dice and compare them to rank.
  // then if it matches, subtract one from probability threshold
  var whichDice;
  if (which == "ai1") {
    whichDice = ai1Dice;
  } else {
    whichDice = ai2Dice;
  }
  var prob = quantity;

  Object.keys(whichDice).forEach(key => {
    if (whichDice[key] === rank) {
      prob--;
    }
    // but don't let it hit 0
    if (prob <= 0) {
      prob = 1;
    }
  });

  // now here's our probability threshold
  var pt = diceP[boop][prob];
  if (pt > 20) {
    quantity++;
  } else if (pt > 10) {
    rank++;
  }

  // remember max can't exceed quantity and rank limits...
  if (rank > 6) {
    rank = 1;
  }
  if (pt <= 10 || quantity > boop) {
    if (which == "ai1") {
      var a = "ai1";
      var b = "human";
      var c = 1;
    } else {
      var a = "ai2";
      if (allOut == "ai1") {
        var b = "human";
      } else {
        var b = "ai1";
      }
      var c = 2;
    }
    challenge({ er: a, ee: b });
    challenged = c;
  } else {
    // AI1 bids the best probability between higher rank vs quantity
    currentBids[which] = [quantity, rank];
  }
}

function updateQuantity() {
  // make quantity box match current number on table
  s("#Quantity").innerHTML = "";
  for (i = 1; i <= allDiceCount; i++) {
    var node = document.createElement("option");
    var textnode = document.createTextNode(i);
    node.appendChild(textnode);
    s("#Quantity").appendChild(node);
  }
}

function flashy(which) {
  s(which).classList.add("highlight");
  setTimeout(function() {
    s(which).classList.remove("highlight");
  }, 2000);
}
