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
// var roomRef = firebase.database().ref().child('rooms');
var database = firebase.database();
var room;
var u;

auth.onAuthStateChanged(function(user){
  if (user && user != null){
    u = user;
    checkEndGame();
  }else{
    window.location.href = 'index.html';
  }
});

//uses REST API to return the json file with all of firebase in it
function getJson(){
  var xhttp = new XMLHttpRequest();
  //TODO: IMPORTANT: before putting this on the website, change rules and put some
  //form of authentication in the url
  xhttp.open("GET","https://spies-dcdf2.firebaseio.com/.json?print=pretty", false);
  xhttp.send();
  var response = JSON.parse(xhttp.responseText);
  return response;
}

function checkEndGame(){
  var all = getJson();
  var spyNum = 0;
  var agentsNum = 0;
  room = all.users[u.uid].room;
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
  if(spyNum >= agentsNum){
    //spies can outvote players during the day if there are more spies
    $('#winner').text("Spies Win");
  }else if(spyNum == 0){
    $('#winner').text("Spies Win");
  }
  firebase.database().ref('rooms/'+room).update({
    state: "over"
  });
}

//user signed out and alias redirects them to index.html
function leaveGame() {
  window.location.assign('index.html');
}
