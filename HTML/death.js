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
var room;
var u;
auth.onAuthStateChanged(function(user) {
  if (user && user != null){
    var all = getJson();
    u = user;
    room = all.users[user.uid].room;
    if(all.rooms[room].players[user.uid].role == "deadMansHand"){
      for (x in all.rooms[room].players) {
        $('#names').append('<input type="radio" name="player" onclick="bodyguardListener(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name);
      }
    }else{
      if(all.rooms[room].players[u.uid].guarded == true){
        firebase.database().ref('rooms/'+room+'/players/'+u.uid).update({
          guard: false
        });
        alert(room+", "+u.uid);
        window.location.replace("main.html");
      }else{
        if(all.rooms[room].players[user.uid].lover != null){
          kill(all.rooms[room].players[user.uid].lover);
          kill(user.uid);
          window.location.replace("index.html");
        }
      }
    }
  }else{
    window.location.href = 'index.html';
  }
});

function bodyguardListener(x){
  alert(x);
  kill(x);
  kill(u.uid);
  window.location.replace("index.html");
}

function kill(x) {
  var roomRef = firebase.database().ref('rooms/' + room + '/players/' + x);
  //if the loged-in user is the user that everyone voted to kill,
  //they remove their info when they log in
  roomRef.remove()
    .then(function() {
      console.log("sucess");
      window.location.replace(index.html);
    })
    .catch(function(error) {
      console.log("Remove failed: " + error.message)
    });
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
