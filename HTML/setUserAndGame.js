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
  NOTE: try using window.location.assign(). This could fix some issues with page views and other. Doesnt mess with local storage
        so user info should maintain between pages, hopefully.
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
var counter = 0;
var currUser; //returns current user
var uid;  //current user's uid
var alias;  //Then name they go by in the room
var currRoom; //the room name they are in
var email;  //their email (in case they dont have an alias)
var isHost; //True if they created the game
var dbRef = firebase.database().ref().child('rooms'); //refernece to the list of rooms
var locked = true;  //locks the stateRef listener until auth is finished.
var isNight = false;
//shouldn't need this lock but the listeners are weird
var rand = ["matchmaker", "deadMansHand", "burglar"];
//everything is inside auth listener because all the code relies on knowing what
//user is signed in

$('#waitingRoom').hide();

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
  findRoom();
  makeUserList();
  updateAlias();

  currRoom = returnRoom();
  locked = false;

});
//In theory, these listeners should run everytime the game state changes, and
//everytime one of the children of players chenges.  That is not how i actually
//works.


//this is really messy because the listener doesnt seem to work when the value actually changes but
//does run when it's not supposed to and doesnt have the recources to work...
var stateRef = firebase.database().ref('rooms/' + currRoom + '/state');
stateRef.on('value', function(snapshot) {
  //needs this lock otherwise it will run this listener before the auth one
  if (!locked) {
    if (snapshot.val() == "waiting") {
      //waithing for host to start game
      updateAlias();
    } else if (snapshot.val() != null) {
      //hide waiting elements, player is in a running game
      inGameView();
    } else {
      //if it's null, the listener ran before it had the recources it needs
      var all = getJson();
      var room = returnRoom();
      var state = all.rooms[room].state;
      if (state == "ongoing") {
        inGameView();
      } else {
        updateAlias();
      }
    }
  }
});

// firebase.database().ref('rooms/'+currRoom+'/players').on('value',function(snapshot){
//   if (!locked) {
//     if (snapshot.val() == "waiting") {
//       $('#waitingRoom').show();
//       $('#dayList').hide();
//     } else if(snapshot.val() != null) {
//       //hide waiting elements
//       $('#waitingRoom').hide();
//       $('#dayList').show();
//     }
//   }
// });

function toggleNight(){
  isNight = true;
  updateAlias();
}

//sets currRoom to the room the player is currently in
//need to test when the player is in multiple rooms
function findRoom() {
  all = getJson();
  var room = all.users[currUser.uid].room;
  var alias = all.users[currUser.uid].alias;
  $('#currRoom').text("Welcome, " + alias + " you are in room " + room);
  updateAlias();
}

function checkPlayerNum(){
  var all = getJson();
  var room = returnRoom();
  var numPlayers = [];
  for (x in all.rooms[room].players) {
    numPlayers.push(x);
  }
  if (numPlayers.length < 4) {
    document.getElementById("hostStartButton").disabled = true;
    $('#hostButton').append("<b>There needs to be 4 or more players to begin the game </b>");
  }
  else {
    document.getElementById("hostStartButton").disabled = false;
  }
}

//creates both dayList (allows people to vote to kill someone), and playerList,
//(so host can see who has jooined the room before they start the game)
function makeUserList() {
  var all = getJson();
  var room = returnRoom();
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
        $('#dayListNames').append('<input type="radio" checked="true" name="player" onclick="vote(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name + " " + votes);
      }else{
        $('#dayListNames').append('<input type="radio" name="player" onclick="vote(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name + " " + votes);
      }
    }
    //$('#dayList').hide();
  }
  updateAlias();
}

//makes a map with the uid as the key and the number of people who voted to
//kill them as the value
function makeVoteList() {
  var all = getJson();
  var dict = {};
  var room = returnRoom();
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

//sets a players role
function changeRole(role, uid) {
  //role is a string of what the player's role is
  var all = getJson();
  var room = returnRoom();
  var a = shuffle(rand);
  //for some players, they can either be randomly assigned deadMansHand,
  //matchmaker, or burglar, but there should only be one per game.
  //this elemets is randomized for a little variety each game
  if(role == "random"){
    role = a.pop();
  }
  if (role == "civ" || role == "spy" || role == "deadMansHand") {
    //for civ, spy, deadMansHand nothing needs to be updated besides role
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
  var room = returnRoom();
  var spyNum = 0;
  var agentsNum = 0;
  //counts the num of spies and agents
  for (x in all.rooms[room].players) {
    if(all.rooms[room].players[x].isAlive == true){
      if(all.rooms[room].players[x].role == "spy"){
        spyNum++;
      }else{
        agentsNum++;
      }
    }
  }
  //alert("spies: "+spyNum+"agents: "+agentsNum);
  if(spyNum > agentsNum){
    //spies can outvote players during the day if there are more spies
    alert("Spies Win!!");
    window.location.assign('endGame.html');
  }else if(spyNum == 0){
    alert("Agents Win!!");
    window.location.assign('endGame.html');
  }
}


function startGame() {
  var room = returnRoom();
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
        changeRole("civ", numPlayers.pop());
      }
    case 12:
        changeRole("spy", numPlayers.pop());
    case 11:
        changeRole("random", numPlayers.pop());
    case 10:
        changeRole("civ", numPlayers.pop());
    case 9:
        changeRole("random", numPlayers.pop());
    case 8:
        changeRole("civ", numPlayers.pop());
    case 7:
        changeRole("bodyguard", numPlayers.pop());
    case 6:
        changeRole("spy", numPlayers.pop());
    case 5:
        changeRole("civ", numPlayers.pop());
    case 4:
        changeRole("random", numPlayers.pop());
    case 3:
        changeRole("civ", numPlayers.pop());
    case 2:
        changeRole("hacker", numPlayers.pop());
    case 1:
        changeRole("spy", numPlayers.pop());
      break;
  }
}

//makes room name what the player wants instead of their email
function setName() {
  var all = getJson();
  var alias = all.users[uid].alias;
  firebase.database().ref('rooms/' + currRoom + '/players/' + uid).update({
    name: alias
  });
  updateAlias();
}

//alias is created, but game hasn't started yet
function startView() {
  var all = getJson();
  $('#currRoom').show();
  $('#currUser').show();
  $('.nameInput').hide();
  $('#playerList').show();
  $('#dayList').hide();
  $('#waitingRoom').show();
  $('#role').hide();
  var room = returnRoom();
  if(all.rooms[room].players[uid].isHost){
    $('#hostStartButton').show();
  }else{
    $('#hostStartButton').hide();
  }

}

//in game
function inGameView() {
  $('#currRoom').hide();
  $('#currUser').hide();
  $('.nameInput').hide();
  $('#playerList').hide();
  $('#dayList').show();
  $('#waitingRoom').hide();
  $('#hostStartButton').hide();
  $('#role').show();
}

//This function makes users pick an alias to identify them to other users, but
//it has mutated to do a bunch of other things too.  Picks what view to use,
//kills somone at the end of the day, and more small stuff
function updateAlias() {
  counter += 1;
  if (alias == email) {
    setName();
    //dont want them to use email as alias
  } else {
    if(counter <= 1){
      startView();
    }
    var all = getJson();
    var room = returnRoom();
    var killName;
    var votes = 0;
    //displays the players role
    checkEndGame();
    $('#role').text(all.rooms[room].players[uid].role);
    var time = new Date();
    if(all.rooms[room].state == "ongoing"){
      if (isNight) {
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
        for (i in dict) {
          if (i != "none") {
            if (votes < dict[i]) {
              votes = dict[i];
              killName = i;
            }
          }
        }
        //this is the only way I could figure out how to remove firebase nodes
        //TODO: make sure this doesnt remove multuple players when night comes
        var roomRef = firebase.database().ref('rooms/' + room + '/players/'+killName);
        if(killName == uid){
          //if the loged-in user is the user that everyone voted to kill,
          //they remove their info when they log in
          alert("dying");
          window.location.assign('death.html');
        }else{
          window.location.assign('night.html');
        }
      }
    }else{
      startView();
    }

      //only the host should be able to start the game once everyone has joined,
      //so this hides the button for all other users
  }
}
  //retruns the r current room name
  function returnRoom() {
    all = getJson();
    return all.users[currUser.uid].room;
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
  function signOut() {
    firebase.auth().signOut();
  }

  //votes for a player to kill
  function vote(user) {
    firebase.database().ref('rooms/' + currRoom + '/players/' + uid).update({
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
