var ref = firebase.database().ref("/rooms");
var STATE = {OPEN: 1, JOINED: 2, CLOSED: 3};
gameList = document.querySelector("#gameList ul");
function createGame(){
    var user = firebase.auth().currentUser;
    var joinName = $('#roomName').val(); //Getting the room name throught JQuery
    var userId = user.uid;
    firebase.database().ref('rooms/' + joinName).set({
      hostuid: userId,
      roomName: joinName
    });
    alert(joinName+" "+userId);
    firebase.database().ref('rooms/'+joinName+'/players/'+userId).set({
      character: "unassigned",
      uid: userId
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

function joinGame(){
  var dbRef = firebase.database().ref().child('rooms');
  var l = [];
  var input = $('#joinGameTextfeild').val();
  console.log('input: '+input);
  dbRef.on('value', function(snapshot){
    l = listOfNames(snapshot.val());
    if(l.indexOf(input)<0){
      $('#nonexistingRoom').text("This room does not exist");
    }else{
      //TODO: Check if they are in the room, if they are not, add them
      //make sure to use REST api, I don't think this will work with listeners
      window.location.href='main.html';
    }
  });
}
