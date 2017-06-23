var ref = firebase.database().ref("/rooms");
var STATE = {OPEN: 1, JOINED: 2, CLOSED: 3};
var gameList;
gameList = document.querySelector("#gameList ul");

function createGame(){
    console.log("testing");
    var user = firebase.auth().currentUser;
    var game = {
      host:{
        uid : user.uid,
        displayName: user.displayName
      },
    };

    var key = ref.push();   //Creates the key used to identify the room
    key.set(game, function(error){
      if(error){
        console.log("Error creating game", error);
      }else{
        console.log("Created game");
        key.onDisconnect().remove();
      }
    })

    var joinName = $('#roomName').val();
    var item = document.createElement("li");
    item.id = joinName;
    item.innerHTML = '<button id = "gameList">' + 'Join ' + joinName + '</button>';
    item.addEventListener("click", function() {
      joinGame(joinName);
    });
    gameList.appendChild(item);
}

function joinGame(key){
  console.log("Joining game ", key);
  var user = firebase.auth().currentUser;
  ref.child(key).transaction(function(game){
    joiner = {
      uid: user.uid,
      displayName: user.displayName
    }
    return game;
  });


}
