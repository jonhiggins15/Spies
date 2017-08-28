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
var isDay = false;

auth.onAuthStateChanged(function(user){
  if (user && user != null){
    u = user;
    findRole();
  }else{
    window.location.assign("index.html");
  }

});

function die(){
  window.location.assign("death.html");
}

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
function leaveGame() {
  window.location.assign('index.html');
}

function checkEndGame(){
  var all = getJson();
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
  if(spyNum >= agentsNum){
    //spies can outvote players during the day if there are more spies
    alert("Spies Win!!");
    window.location.assign('endGame.html');
  }else if(spyNum == 0){
    alert("Agents Win!!");
    window.location.assign('endGame.html');
  }
}

function findRole(){
  var all = getJson();
  room = all.users[u.uid].room;
  role = all.rooms[room].players[u.uid].role;
  checkEndGame();
  switch(role){
    case "Civilian":
      civ();
      break;
    case "spy":
      spy();
      break;
    case "Hacker":
      hacker();
      break;
    case "matchmaker":
      matchmaker();
      break;
    case "Bodyguard":
      bodyguard();
      break;
    case "Dead Man's Hand":
      $("#player").text("Dead man's hand");
      break;
    case "Burglar":
      burglar();
      break;
  }
}

function burglar(){
  $("#player").text("Burglar");
  var all = getJson();
  for (x in all.rooms[room].players) {
    if(all.rooms[room].players[x].isAlive == true){
      if(all.rooms[room].players[u.uid].steal == all.rooms[room].players[x].uid){
        //makes the radio buttons pre-checked if currUser voted for that player
        $('#names').append('<input type="radio" checked="true" name="player" onclick="burglarListener(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name);
      }else{
        $('#names').append('<input type="radio" name="player" onclick="burglarListener(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name);
      }
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
      if(all.rooms[room].players[x].isAlive == true){
        $('#names').append('<input type="checkbox" id="'+all.rooms[room].players[x].uid
        +'" name="player" onclick="matchmakerListener(this.value)" class="single-checkbox" value='
        + all.rooms[room].players[x].uid + '><label for='
        +all.rooms[room].players[x].uid+'>' + all.rooms[room].players[x].name+"</label>");
      }
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
      if(all.rooms[room].players[x].isAlive == true){
        $('#names').append('<input type="radio" id="'
        +all.rooms[room].players[x].uid +'" name="player" onclick="bodyguardListener(this.value)" value='
        + all.rooms[room].players[x].uid + '><label for='
        +all.rooms[room].players[x].uid+'>' + all.rooms[room].players[x].name+"</label>");
      }
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
      if(all.rooms[room].players[x].isAlive == true){
        $('#names').append('<input type="radio" id="'
        +all.rooms[room].players[x].uid +'" name="player" onclick="hackerListener(this.value)" value='
        + all.rooms[room].players[x].uid + '><label for='
        +all.rooms[room].players[x].uid+'>' + all.rooms[room].players[x].name+"</label>");
      }
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
    if(all.rooms[room].players[x].isAlive == true){
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
        $('#names').append('<input type="radio" id="'
        +all.rooms[room].players[x].uid +'" name="player" checked="true" onclick="spyVote(this.value)" value='
        + all.rooms[room].players[x].uid + '><label for='
        +all.rooms[room].players[x].uid+'>' + all.rooms[room].players[x].name+
        ' '+votes+"</label>");
      }else{
        $('#names').append('<input type="radio" id="'
        +all.rooms[room].players[x].uid +'" name="player" onclick="spyVote(this.value)" value='
        + all.rooms[room].players[x].uid + '><label for='
        +all.rooms[room].players[x].uid+'>' + all.rooms[room].players[x].name+
        ' '+votes+"</label>");
      }
    }
  }
}

// function toDay(){
//   isDay = true;
//   changeToDay();
// }

//makes a map with the uid as the key and the number of people who voted to
//kill them as the value
function makeSpyList() {
  var all = getJson();
  var dict = {};

  for (x in all.rooms[room].players) {
    var kill;
    if(all.rooms[room].players[x].role == "Spy" && all.rooms[room].players[x].nightVote){
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

function changeToDay(){
  var all = getJson();
  var time = new Date();
  if (time.getHours() < 17 && time.getHours() > 5){
    var spyList = makeSpyList();
    var killName;
    var votes = 0;
    for (i in spyList) {
      if (i != "none") {
        if (votes < spyList[i]) {
          votes = spyList[i];
          killName = i;
        }
      }
    }
    if(killName == u.uid){
      window.location.assign('death.html');
    }else{
      if(killName != null){
        firebase.database().ref('rooms/'+room+'/players/'+killName).update({
          isAlive: false
        });
      }
      if(role == "Bodyguard" || role == "Hacker" || role == "Burglar"){
        firebase.database().ref('rooms/'+room+'/players/'+u.uid).update({
          usedAbility: false
        });
      }
      if(role == "Burglar"){
        var victimUid = all.rooms[room].players[u.uid].steal;
        var stolenRole = all.rooms[room].players[victimUid].role;
        var usedAbilityValue = false
        if(stolenRole == "matchmaker"){
          if(all.rooms[room].players[victimUid].usedAbility == true){
            usedAbilityValue = true;
          }
        }
        firebase.database().ref('rooms/'+room+'/players/'+victimUid).update({
          usedAbility: false,
          role: "burglar"
        });
        firebase.database().ref('rooms/'+room+'/players/'+u.uid).update({
          usedAbility: usedAbilityValue,
          role: stolenRole
        });
      }
      window.location.assign('main.html');
    }
  }
}

//votes for a player to kill
function spyVote(x) {
  var all = getJson();
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

function BurglarListener(x){
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
      $('#miscHeadline').text(all.rooms[room].players[i].name + " is a " + all.rooms[room].players[i].role);
      firebase.database().ref('rooms/'+room+'/players/'+u.uid).update({
        usedAbility: true,
        hacked: all.rooms[room].players[i].uid
      });
      $('#list').hide();
    }
  }
}
