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
var roomRef = firebase.database().ref().child('rooms');
var u;
var role;
var room;
var matchmakerA = "";
var matchmakerB = "";

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
  switch(role){
    case "civ":
      civ();
      break;
    case "spy":
      spy();
      break;
    case "hacker":
      hacker();
      break;
    case "matchmaker":
      matchmaker();
      break;
    case "bodyguard":
      bodyguard();
      break;
    case "deadMansHand":
      $("#player").text("Dead man's hand");
      break;
    case "burglar":
      burglar();
      break;
  }
}

function burglar(){
  $("#player").text("Burglar");
  var all = getJson();
  for (x in all.rooms[room].players) {
    if(all.rooms[room].players[u.uid].steal == all.rooms[room].players[x].uid){
      //makes the radio buttons pre-checked if currUser voted for that player
      $('#names').append('<input type="radio" checked="true" name="player" onclick="burglarListener(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name);
    }else{
      $('#names').append('<input type="radio" name="player" onclick="burglarListener(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name);
    }
  }
}

function matchmaker(){
  $("#player").text("Matchmaker");
  var all = getJson();
  if(all.rooms[room].players[u.uid].usedAbility == true){
    $('#miscHeadline').text("Ability used");
  }else{
    for (x in all.rooms[room].players) {
      $('#names').append('<input type="checkbox" value="'+all.rooms[room].players[x].uid+
      '" onclick="matchmakerListener(this.value)" class="single-checkbox">' +
      all.rooms[room].players[x].name);
    }
  }
}

function bodyguard(){
  var all = getJson();
  $("#player").text("Bodyguard");
  if(all.rooms[room].players[u.uid].usedAbility == true){
    $('#miscHeadline').text("Ability used");
  }else{
    for (x in all.rooms[room].players) {
      $('#names').append('<input type="radio" name="player" onclick="bodyguardListener(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name);
    }
  }
}

function hacker(){
  $("#player").text("Hacker");
  var all = getJson();
  if(all.rooms[room].players[u.uid].usedAbility == true){
    var hacked = all.rooms[room].players[u.uid].hacked;
    for(x in all.rooms[room].players){
      if(x == hacked){
        $('#miscHeadline').text(all.rooms[room].players[x].name + " is a " + all.rooms[room].players[x].role);
      }
    }
  }else{
    for (x in all.rooms[room].players) {
      $('#names').append('<input type="radio" name="player" onclick="hackerListener(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name);
    }
  }
}

function civ(){
  $("#player").text("Civilian");
}

function spy(){
  $("#player").text("Spy");
  var all = getJson();
  d = makeSpyList();
  $('#dayListNames').empty();
  console.log(d);
  //finds how many votes each player has
  for (x in all.rooms[room].players) {
    var votes;
    if (d[all.rooms[room].players[x].uid] == null) {
      votes = 0;
    } else {
      votes = d[all.rooms[room].players[x].uid];
    }
    //see who the player voted for
    var currVote = all.rooms[room].players[u.uid].nightVote;
    if(currVote == all.rooms[room].players[x].uid){
      //makes the radio buttons pre-checked if currUser voted for that player
      $('#names').append('<input type="radio" checked="true" name="player" onclick="spyVote(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name + " " + votes);
    }else{
      $('#names').append('<input type="radio" name="player" onclick="spyVote(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name + " " + votes);
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
    if(all.rooms[room].players[x].role == "spy" && all.rooms[room].players[x].nightVote){
      kill = all.rooms[room].players[x].nightVote;
      if (dict[kill] == null) {
        dict[kill] = 1;
      } else {
        dict[kill] = dict[kill] + 1;
      }
    }
  }
  console.log(dict);
  return dict;
}

//votes for a player to kill
function spyVote(x) {
  var all = getJson();
  alert(room+", "+u.uid);
  firebase.database().ref('rooms/' + room + '/players/'+ u.uid).update({
    nightVote: x
  });
  //need to reload to see the updated vote tallys
  location.reload();
}

function matchmakerListener(x){
  $('input.single-checkbox').on('change', function(evt) {
     if($(this).siblings(':checked').length >= 2) {
         this.checked = false;
     }
  });
  if(matchmakerA == ""){
    matchmakerA = x;
  }else{
    alert(matchmakerA+', '+x);
    firebase.database().ref('rooms/'+room+'/players/'+x).update({
      lover: matchmakerA
    });
    firebase.database().ref('rooms/'+room+'/players/'+matchmakerA).update({
      lover: x
    });
    firebase.database().ref('rooms/'+room+'/players/'+u.uid).update({
      usedAbility: true
    });
    $('#list').hide();
  }
}

function burglarListener(x){
  firebase.database().ref('rooms/'+room+'/players/'+u.uid).update({
    steal: x
  });
}

function bodyguardListener(x){
  var all = getJson();
  firebase.database().ref('rooms/'+room+'/players/'+u.uid).update({
    usedAbility: true
  });
  firebase.database().ref('rooms/'+room+'/players/'+x).update({
    guarded: true
  });
  $('#list').hide();
}

function hackerListener(x){
  var all = getJson();
  for(i in all.rooms[room].players){
    if(i == x){
      alert(all.rooms[room].players[i].role);
      $('#miscHeadline').text(all.rooms[room].players[i].name + " is a " + all.rooms[room].players[i].role);
      firebase.database().ref('rooms/'+room+'/players/'+u.uid).update({
        usedAbility: true,
        hacked: all.rooms[room].players[i].uid
      });
      $('#list').hide();
    }
  }
}
