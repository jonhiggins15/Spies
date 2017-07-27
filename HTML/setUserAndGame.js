/*TODO:
  -Sometimes the auth listener just runs for no reason -> messes with whats hidden and whats there
  -Now it refreshes whole page when new dial is selected. Listeners arn't working but that would be a lot cleaner
  -after page refreshes, the radio button is empty -> should show who you voted for
  -time based on host's timezone instead of each user
  -optimize jquerry calls -> sometimes I call one after another which is bad for speed and data caps
  -in index.html you teh login button doesnt work on thin screens
  -login button should close module (also index.html)
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
var currUser;
var uid;
var alias;
var currRoom;
var email;
var isHost;
var dbRef = firebase.database().ref().child('rooms');
var locked = true;
var rand = ["matchmaker", "deadMansHand", "burglar"];
//everything is inside auth listener because all the code relies on knowing what
//user is signed in

$('#waitingRoom').hide(); //TODO: This might not work when a new game is created

auth.onAuthStateChanged(function(user) {
  if (user && user != null) {
    uid = user.uid;
    email = user.email;
    // $('#currUser').text(user.displayName);
    currUser = user;
  } else {
    window.location.href = 'index.html';
  }
  findRoom();
  makeUserList();
  updateAlias();

  currRoom = returnRoom();
  locked = false;

});
//this is really messy because the listener doesnt seem to work when the value actually changes but
//does run when it's not supposed to and doesnt have teh recources to work...
var stateRef = firebase.database().ref('rooms/' + currRoom + '/state');
stateRef.on('value', function(snapshot) {
  //needs this lock otherwise it will run this listener before the auth one
  if (!locked) {
    if (snapshot.val() == "waiting") {
      updateAlias();
    } else if (snapshot.val() != null) {
      //hide waiting elements
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


function findRoom() {
  all = getJson();
  for (i in all.rooms) {
    for (x in all.rooms[i].players) {
      if (currUser.uid == x) {
        currRoom = i;
        alias = all.rooms[i].players[currUser.uid].name;
        isHost = all.rooms[i].players[currUser.uid].isHost;
        $('#currRoom').text("Welcome, " + alias + " you are in room " + i);
      }
    }
  }
  updateAlias();
}

function makeUserList() {
  var all = getJson();
  var room = returnRoom();
  var d = makeVoteList();
  $('#dayListNames').empty();
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
    if(currVote == all.rooms[room].players[x].uid){
      $('#dayListNames').append('<input type="radio" checked="true" name="player" onclick="vote(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name + " " + votes);
    }else{
      $('#dayListNames').append('<input type="radio" name="player" onclick="vote(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name + " " + votes);
    }
    $('#dayList').hide();
  }
  updateAlias();
}

function makeVoteList() {
  var all = getJson();
  var dict = {};
  var room = returnRoom();
  for (x in all.rooms[room].players) {
    var kill = all.rooms[room].players[x].dayKillVote;
    if (dict[kill] == null) {
      dict[kill] = 1;
    } else {
      dict[kill] = dict[kill] + 1;
    }

  }
  console.log(dict);
  return dict;
}

function changeRole(role, uid) {
  //role is a string of what the player's role is
  var all = getJson();
  var room = returnRoom();
  var a = shuffle(rand);
  if(role == "random"){
    role = a.pop();
    alert(role);
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
  for (x in all.rooms[room].players) {
    if(all.rooms[room].players[x].role == "spy"){
      spyNum++;
    }else{
      agentsNum++;
    }
  }
  if(spyNum > agentsNum){
    alert("Spies Win!!");
  }else if(spyNum == 0){
    alert("Agents Win!!");
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

function setName() {
  var alias = $('#aliasInput').val();
  firebase.database().ref('rooms/' + currRoom + '/players/' + uid).update({
    name: alias
  });
  updateAlias();
}

function needAliasView() {
  $('#currRoom').hide();
  $('#currUser').hide();
  $('.nameInput').show();
  $('#playerList').hide();
  $('#dayList').hide();
  $('#waitingRoom').show();
  $('#hostStartButton').hide();
  $('#role').hide();
}

function startView() {
  $('#currRoom').show();
  $('#currUser').show();
  $('.nameInput').hide();
  $('#playerList').show();
  $('#dayList').hide();
  $('#waitingRoom').show();
  $('#role').hide();
  if (isHost) {
    $('#hostStartButton').show();
  } else {
    $('#hostStartButton').hide();
  }
}

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

//This function makes users pick an alias to identify them to other users
function updateAlias() {
  if (alias == email) {
    needAliasView();
  } else {
    startView();
    var all = getJson();
    var room = returnRoom();
    var killName;
    var votes = 0;
    $('#role').text(all.rooms[room].players[uid].role);
    var time = new Date();
    if (time.getHours() < 5 || time.getHours() > 15 || false) {
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
      alert(killName);
      var roomRef = firebase.database().ref('rooms/' + room + '/players/'+killName);
      roomRef.remove()
        .then(function(){
          console.log("sucess");
        })
        .catch(function(error) {
          console.log("Remove failed: " + error.message)
        });

      alert("change to night");
      //for whatever reason, doesnt work when redirected, but works like this
      // window.location.href='night.html';

    }
      //only the host should be able to start the game once everyone has joined,
      //so this hides the button for all other users
  }
}

  function returnRoom() {
    all = getJson();
    for (i in all.rooms) {
      for (x in all.rooms[i].players) {
        if (uid == x) {
          return i;
        }
      }
    }
  }

  function getJson() {
    var xhttp = new XMLHttpRequest();

    //TODO: IMPORTANT: before putting this on the website, change rules and put some
    //form of authentication in the url
    xhttp.open("GET", "https://spies-dcdf2.firebaseio.com/.json?print=pretty", false);
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
    return response;
  }

  function signOut() {
    firebase.auth().signOut();
  }

  function vote(user) {
    firebase.database().ref('rooms/' + currRoom + '/players/' + uid).update({
      dayKillVote: user
    });
    location.reload();
  }

  //Shuffles array of uid's
  function shuffle(array) {
    var currentIndex = array.length,
      temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  //uses REST api to get the whole firebase database and make it an object, which is returned
