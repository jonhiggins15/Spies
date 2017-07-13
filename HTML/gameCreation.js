var ref = firebase.database().ref("/rooms");
var STATE = {OPEN: 1, JOINED: 2, CLOSED: 3};
gameList = document.querySelector("#gameList ul");
var user;
//need this function because if you put auth stuff outside a function,
//it gets called right when the page loads which makes it not work
function getUser(){
  user = firebase.auth().currentUser;
}

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
      character: "unassigned",
      uid: userId,
      name: userEmail,
      isHost: true,
      isAlive: true
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
  var input = $('#joinGameTextfeild').val();
  console.log('input: '+input);
  dbRef.on('value', function(snapshot){
    l = listOfNames(snapshot.val());
    if(l.indexOf(input)<0){
      $('#nonexistingRoom').text("This room does not exist");
    }else{ //this else checks if a player is already in the room, and adds them
      //if the user isn't
      var all = getJson();
      console.log(all);
      var found = false;
      for(i in all.rooms[input].players){
        if(user.uid == all.rooms[input].players[i].uid){
          found = true;
          alert("already member");
          console.log("already member of room");
        }
      }
      if(!found){
        //didnt find player, add them to room
        alert("BADBADNOTGOOD");
        firebase.database().ref('rooms/'+input+'/players/'+user.uid).set({
          character: "unassigned",
          uid: user.uid,
          name: user.email,
          isHost: false,
          isAlive: true
        });
      }

      window.location.href='main.html';
    }
  });
}
