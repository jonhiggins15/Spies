/*TODO:
  -Sometimes the auth listener just runs for no reason -> messes with whats hidden and whats there
  -Now it refreshes whole page when new dial is selected. Listeners arn't working but that would be a lot cleaner
  -after page refreshes, the radio button is empty -> should show who you voted for
  -time based on host's timezone instead of each user
  -login button doesnt work when window is snaped to one
  - sign in button should close the modulus
  -optimize jquerry calls -> sometimes I call one after another which is bad for speed and data caps
  -in testing, when I first started the game, name on screen was unassigned but when the screen was refreshed,
    it changed
   */


var config = {
  apiKey: "AIzaSyBjxttr82927G5x1_C-MPvJRQMYKmQ4d3g",
  authDomain: "spies-dcdf2.firebaseapp.com",
  databaseURL: "https://spies-dcdf2.firebaseio.com",
  projectId: "spies-dcdf2",
  storageBucket: "spies-dcdf2.appspot.com",
  messagingSenderId: "989041921995"
};
firebase.initializeApp(config);
const auth = firebase.auth();
var currUser; //returns current user
var uid;  //current user's uid
var alias;  //Then name they go by in the room
var room; //the room name they are in
var email;  //their email (in case they dont have an alias)
var isHost; //True if they created the game
var dbRef = firebase.database().ref().child('rooms'); //refernece to the list of rooms
var isNight = false;
//shouldn't need this lock but the listeners are weird
var rand = ["Matchmaker", "Dead Man's Hand", "Burglar"];
//everything is inside auth listener because all the code relies on knowing what
//user is signed in

$('#waitingRoom').hide();
$('#dayVoteExp').hide();

//this gets all the auth info about the current user, then calls other methods
//to continue setting up the game.  Needs to run before stateRef
auth.onAuthStateChanged(function(user) {
  if (user && user != null) {
    uid = user.uid;
    email = user.email;
    currUser = user;
  } else {
    //user isnt logged in
    window.location.href = 'index.html';
  }
  initialView();
  makeUserList();
});

//Just a function for testing
function toggleNight(){
  alert(isNight);
  isNight = true;
  updateView();
}

function checkPlayerNum(){
  var all = getJson();
  var numPlayers = [];
  for (x in all.rooms[room].players) {
    numPlayers.push(x);
  }
  if (numPlayers.length < 4) {
    document.getElementById("hostStartButton").disabled = true;
    $("#checkNum").css("visibility","visible");
  }
  else {
    document.getElementById("hostStartButton").disabled = false;
  }
}

//creates both dayList (allows people to vote to kill someone), and playerList,
//(so host can see who has jooined the room before they start the game)
function makeUserList() {
  var all = getJson();
  var d = makeVoteList();  //a map with uid's and kill votes
  $('#dayListNames').empty();
  //finds how many votes each player has
  for (x in all.rooms[room].players) {
    var votes;
    if (d[all.rooms[room].players[x].uid] == null) {
      votes = 0;
    } else {
      votes = d[all.rooms[room].players[x].uid];
    }
    $('#playerList .list').append('<li>' + all.rooms[room].players[x].name + '</li>');
    //see who the player voted for
    var currVote = all.rooms[room].players[uid].dayKillVote;
    if(all.rooms[room].players[x].isAlive == true){
      if(currVote == all.rooms[room].players[x].uid){
        //makes the radio buttons pre-checked if currUser voted for that player
        $('#dayListNames').append('<input type="radio" id="radbtn" checked="true" name="player" onclick="vote(this.value)" value='
        + all.rooms[room].players[x].uid + '><label for='
        +all.rooms[room].players[x].uid+'>' + all.rooms[room].players[x].name
        + " " + votes + "</label>");
      }else{
        $('#dayListNames').append('<input type="radio" id="'
        +all.rooms[room].players[x].uid
        +'" name="player" onclick="vote(this.value)" value='
        + all.rooms[room].players[x].uid + '><label for='
        +all.rooms[room].players[x].uid+'>' + all.rooms[room].players[x].name
        + " " + votes + "</label>");
      }
    }
  }
}

//makes a map with the uid as the key and the number of people who voted to
//kill them as the value
function makeVoteList() {
  var all = getJson();
  var dict = {};
  for (x in all.rooms[room].players) {
    if(all.rooms[room].players[x].isAlive == true){
      var kill = all.rooms[room].players[x].dayKillVote;
      if (dict[kill] == null) {
        dict[kill] = 1;
      } else {
        dict[kill] = dict[kill] + 1;
      }
    }
  }
  return dict;
}

function changeRole(role, uid) {
  //role is a string of what the player's role is
  var all = getJson();
  var a = shuffle(rand);
  //for some players, they can either be randomly assigned Dead Man's Hand,
  //matchmaker, or burglar, but there should only be one per game.
  //this elemets is randomized for a little variety each game
  if(role == "random"){
    role = a.pop();
  }
  if (role == "Civilian" || role == "Spy" || role == "Dead Man's Hand") {
    //for civ, spy, Dead Man's Hand nothing needs to be updated besides role
    firebase.database().ref('rooms/' + room + '/players/' + uid).update({
      role: role
    });
  } else {
    //matchmaker, bodyguard, hacker, and burglar need an ablility check
    firebase.database().ref('rooms/' + room + '/players/' + uid).update({
      role: role,
      usedAbility: false
    });
  }

}

function checkEndGame(){
  var all = getJson();
  var spyNum = 0;
  var agentsNum = 0;
  //counts the num of spies and agents
  if(all.rooms[room].state == "ongoing"){
    for (x in all.rooms[room].players) {
      if(all.rooms[room].players[x].isAlive == true){
        if(all.rooms[room].players[x].role == "Spy"){
          spyNum++;
        }else{
          agentsNum++;
        }
      }
    }
    if(spyNum > agentsNum){
      //spies can outvote players during the day if there are more spies
      window.location.assign('endGame.html');
    }else if(spyNum == 0){
      window.location.assign('endGame.html');
    }
  }
}

function startGame() {
  firebase.database().ref('rooms/' + room).update({
    state: "ongoing"
  });
  inGameView();
  //puts uid's in array and shuffles them
  var all = getJson();
  var numPlayers = [];
  for (x in all.rooms[room].players) {
    numPlayers.push(x);
  }
  numPlayers = shuffle(numPlayers);
  //this case statement assigns roles bassed off the number of players.
  //rand is either matchmaker, dead man's hand, or theif
  switch (numPlayers.length) {
    default:
      //this is supposed to add a civ for each player after 12 but
      //hasn't been tested and will also need to add spies occasionally
      while (numPlayers.length > 12) {
        changeRole("Civilian", numPlayers.pop());
      }
    case 12:
        changeRole("Spy", numPlayers.pop());
    case 11:
        changeRole("random", numPlayers.pop());
    case 10:
        changeRole("Civilian", numPlayers.pop());
    case 9:
        changeRole("random", numPlayers.pop());
    case 8:
        changeRole("Civilian", numPlayers.pop());
    case 7:
        changeRole("Bodyguard", numPlayers.pop());
    case 6:
        changeRole("Spy", numPlayers.pop());
    case 5:
        changeRole("Civilian", numPlayers.pop());
    case 4:
        changeRole("random", numPlayers.pop());
    case 3:
        changeRole("Civilian", numPlayers.pop());
    case 2:
        changeRole("Hacker", numPlayers.pop());
    case 1:
        changeRole("Spy", numPlayers.pop());
      break;
  }
  updateView();
}

function setName() {
  var all = getJson();
  var alias = all.users[uid].alias;
  firebase.database().ref('rooms/' + room + '/players/' + uid).update({
    name: alias
  });
  updateAlias();
}

//alias is created, but game hasn't started yet
function startView() {
  var all = getJson();
  $('#dayList').hide();
  $('#waitingRoom').show();
  $('#role').hide();
  $('#dayVoteExp').hide();
  if(all.rooms[room].players[uid].isHost){
    $('#hostStartButton').show();
    $('#waitingForHost').hide();
    $('#playerList').show();
    $('#playerListExp').show();
    checkPlayerNum();
  }else{
    $('#hostStartButton').hide();
    $('#waitingForHost').show();
    $('#playerList').hide();
    $('#playerListExp').hide();
  }
}

//in game
function inGameView() {
  var all = getJson();
  var k = all.rooms[room].lastKill;
  $('#dayVoteExp').show();
  $('#playerList').hide();
  $('#dayList').show();
  $('#waitingRoom').hide();
  $('#hostStartButton').hide();
  $('#role').show();
  if(k != null){
    $('#lastKill').text(all.rooms[room].players[k].name + " Was killed in the night");
  }
}


function initialView(){
  var all = getJson();
  var alias = all.users[uid].alias;
  room = all.users[uid].room;
  firebase.database().ref('rooms/' + room + '/players/' + uid).update({
    name: alias
  });
  $('#currRoom').text("Welcome " + alias + " you are in room " + room);
  if(!all.rooms[room].players[uid].isAlive){
    window.location.assign('death.html');
  }
  updateView();
}

function updateView(){
  var all = getJson();
  var state = all.rooms[room].state;
  if(state == "waiting"){
    startView();
  }else if (state == "ongoing") {
    var time = new Date();
      // if (time.getHours() > 17 || time.getHours() < 5) {
      if(isNight){
        //this means it's night
        var dict = {};
        for (x in all.rooms[room].players) {
          var kill = all.rooms[room].players[x].dayKillVote;
          if (dict[kill] == null) {
            dict[kill] = 1;
          } else {
            dict[kill] = dict[kill] + 1;
          }
        }
        var votes = 0;
        var killName = "";
        for (i in dict) {
          if (i != "none") {
            if (votes < dict[i]) {
              votes = dict[i];
              killName = i;
            }
          }
        }
        if(killName == uid){
          //if the loged-in user is the user that everyone voted to kill,
          //they remove their info when they log in
          window.location.assign('death.html');
        }else{
          firebase.database().ref('rooms/' + room + '/players/' + killName).update({
            isAlive: false
          });
          firebase.database().ref('rooms/' + room).update({
            lastKill: killName
          });
          alert("isAlive bug!");
          window.location.assign('night.html');

        }
      }else{
      checkEndGame();
      inGameView();
    }
    $('#role').text(all.rooms[room].players[uid].role);
  }else if (state == "over") {
    window.location.assign('endGame.html');
  }
}

//returns a JSON of the database using REST API
function getJson() {
  var xhttp = new XMLHttpRequest();

  //TODO: IMPORTANT: before putting this on the website, change rules and put some
  //form of authentication in the url
  xhttp.open("GET", "https://spies-dcdf2.firebaseio.com/.json?print=pretty", false);
  xhttp.send();
  var response = JSON.parse(xhttp.responseText);
  return response;
}
//user signed out and alias redirects them to index.html
function leaveGame() {
  window.location.assign('index.html');
}

//votes for a player to kill
function vote(user) {
  firebase.database().ref('rooms/' + room + '/players/' + uid).update({
    dayKillVote: user
  });
  //need to reload to see the updated vote tallys
  location.reload();
}

//Shuffles array of uid's
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

//uses REST api to get the whole firebase database and make it an object, which is returned
