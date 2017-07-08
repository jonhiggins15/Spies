var ref = firebase.database().ref("/rooms");
var STATE = {OPEN: 1, JOINED: 2, CLOSED: 3};
var gameList;
gameList = document.querySelector("#gameList ul");

function createGame(){
    var user = firebase.auth().currentUser;
    var joinName = $('#roomName').val(); //Getting the room name throught JQuery
    alert(joinName);
    // var game = {
    //   host:{
    //     uid : user.uid,
    //     displayName: user.displayName
    //   },
    // };
    // var key = ref.push();
    firebase.database().ref('rooms/' + joinName).set({
      hostuid: user.uid,
      roomID: "roomID"
    });
    alert("after");

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


    var item = document.createElement("li");
    item.id = joinName;
    item.innerHTML = '<button id = "gameList">' + 'Join ' + joinName + '</button>'; //HTML for adding the game
    item.addEventListener("click", function() {
      joinGame(key.key);
    });
    gameList.appendChild(item);  //Adds the game button to the list

    window.location.href='createdGame.html';
}
//
// function joinGame(key){
//   console.log("Joining game", roomName);
//   var user = firebase.auth().currentUser;
//   ref.child(key).transaction(function(game){
//     joiner = {
//       uid: user.uid,
//       displayName: user.displayName
//     }
//     return game;
//   });
// }
