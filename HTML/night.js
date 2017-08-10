//once position is assigned, player should get FB vars for each power w/ a true/false value
//for if they used it that night.
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
var u;
var role;
var room;


auth.onAuthStateChanged(function(user){
  if (user && user != null){
    u = user;
    findRole();
  }else{
    window.location.replace("index.html");
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

//user signed out and alias redirects them to index.html
function signOut() {
  firebase.auth().signOut();
}

function findRole(){
  var all = getJson();
  room = all.users[u.uid].room;
  role = all.rooms[room].players[u.uid].role;
  console.log("Room: "+room+" Role: "+role);
  switch(role){
    case "civ":
      civ();
      break;
    case "spy":
      spy();
      break;
  }
}

function civ(){
  $("#player").text("Civilian");
}

function spy(){
  $("#player").text("Spy");
  makeUserList();
}

function makeUserList() {
  var all = getJson();
  d = makeSpyList();
  $('#dayListNames').empty();
  //finds how many votes each player has
  for (x in all.rooms[room].players) {
    var votes;
    if (d[all.rooms[room].players[x].uid] == null) {
      votes = 0;
    } else {
      votes = d[all.rooms[room].players[x].uid];
    }
    //see who the player voted for
    var currVote = all.rooms[room].players[u.uid].dayKillVote;
    if(currVote == all.rooms[room].players[x].uid){
      //makes the radio buttons pre-checked if currUser voted for that player
      $('#names').append('<input type="radio" checked="true" name="player" onclick="vote(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name + " " + votes);
    }else{
      $('#names').append('<input type="radio" name="player" onclick="vote(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name + " " + votes);
    }
  }
}

//makes a map with the uid as the key and the number of people who voted to
//kill them as the value
function makeSpyList() {
  var all = getJson();
  var dict = {};

  for (x in all.rooms[room].players) {
    var kill;
    if(all.rooms[room].players.role == "spy" && all.rooms[room].players.nightVote != ""){
      kill = all.rooms[room].players.nightVote;
      if (dict[kill] == null) {
        dict[kill] = 1;
      } else {
        dict[kill] = dict[kill] + 1;
      }
    }
  }
  return dict;
}

//votes for a player to kill
function vote(x) {
  var all = getJson();
  alert(room+", "+u.uid);
  alert(all.rooms[room].players[u.uid].nightVote);
  firebase.database().ref('rooms/' + room ).set({
    nightVote: "name"
  });
  firebase.database().ref('rooms/' + room).update({
    state: "waiting"
  });
  //need to reload to see the updated vote tallys
  location.reload();
}
