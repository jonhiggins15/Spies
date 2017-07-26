var ref = firebase.database().ref("/rooms");
var STATE = {OPEN: 1, JOINED: 2, CLOSED: 3};
gameList = document.querySelector("#gameList ul");
var user;
//need this function because if you put auth stuff outside a function,
//it gets called right when the page loads which makes it not work
function getUser(){
  user = firebase.auth().currentUser;
}
/*FIREBASE DATABASE DOCS:
    hostuid: user id of the room's creater

    players: list of all players by their user id's

    dayKillVote: the uid of the player the player that is being
      referenced voted to kill. "none" means they have not voted.

    isAlive: True if alive, false if dead

    isHost: true if referenced player created the referenced room

    name: chosen alias, just their email if they dont choose

    role: the character they play in the game. eg hacker, spy ...

    uid: their user id.  Needed bacause we can't reference parent
      nodes in the database

    roomName: Rooms name. Needed for the same reason as above
    
    state: ongoing if a game is in progress and waiting if the game is
      created but the host still needs to start it.  If you get a null value
      for this, use the REST API instead of the firebase listener
*/
function createGame(){
    getUser();
    var joinName = $('#roomName').val();
    var userId = user.uid;
    var userEmail = user.email;
    firebase.database().ref('rooms/' + joinName).set({
      hostuid: userId,
      roomName: joinName,
      //room state can be either waiting (if in waiting room) or ongoing
      state: "waiting"
    });
    firebase.database().ref('rooms/'+joinName+'/players/'+userId).set({
      role: "unassigned",
      uid: userId,
      name: userEmail,
      isHost: true,
      isAlive: true,
      dayKillVote: "none",
      usedAbility: true,
      guarded: false
    });

    //TODO: I dont really know how or if this works, so im just leaving it commented out
    //for now.  Fix in the future.

    // key.set(game, function(error){
    //   if(error){
    //     console.log("Error creating game", error);
    //   }else{
    //     console.log("Created game");
    //     key.onDisconnect().remove();
    //   }
    // })
    window.location.href='main.html';
}


function gameListGen(s){
  var gameList = document.getElementById('gameList');
  for(x in s){
    var item = document.createElement("li");
    item.innerHTML = '<button id = "gameList">' +JSON.stringify(x)+'</button>';
    gameList.appendChild(item);
  }
}

function joinGameList(){
  var dbRef = firebase.database().ref().child('rooms');
  dbRef.on('value', function(snapshot){
    gameListGen(snapshot.val());
  });
  var item = document.createElement("li");
}

function listOfNames(s){
  var r = [];
  for(x in s){
    r.push(JSON.stringify(x).substring(1,JSON.stringify(x).length-1));
  }
  return r;
}

function getJson(){
  var xhttp = new XMLHttpRequest();

  //TODO: IMPORTANT: before putting this on the website, change rules and put some
  //form of authentication in the url
  xhttp.open("GET","https://spies-dcdf2.firebaseio.com/.json?print=pretty", false);
  xhttp.send();
  var response = JSON.parse(xhttp.responseText);
  return response;
}

function joinGame(){
  getUser();
  var dbRef = firebase.database().ref().child('rooms');
  var l = [];
  var input = $('#joinGameTextfield').val();
  var all = getJson();
  dbRef.on('value', function(snapshot){
    l = listOfNames(snapshot.val());
    if(l.indexOf(input)<0){
      console.log(l.indexOf(input));

      $('#nonexistingRoom').text("This room does not exist");
    }else{ //this else checks if a player is already in the room, and adds them
      //if the user isn't
      console.log(all);
      var found = false;
      for(i in all.rooms[input].players){
        if(user.uid == all.rooms[input].players[i].uid){
          found = true;
          alert("already member");
          console.log("already member of room");
          window.location.href='main.html';
        }
      }
      if(!found){
        //didnt find player, add them to room
        if(all.rooms[input].state == "waiting"){
          firebase.database().ref('rooms/'+input+'/players/'+user.uid).set({
            role: "unassigned",
            uid: user.uid,
            name: user.email,
            isHost: false,
            isAlive: true,
            dayKillVote: "none",
            usedAbility: true,
            guarded: false
          });
          window.location.href='main.html';
        }else{
          $('#nonexistingRoom').text("Can't join a room when the game is in session");
        }

      }


    }
  });
}
