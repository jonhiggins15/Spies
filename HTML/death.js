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
var dead = false;

auth.onAuthStateChanged(function(user) {
  if (user && user != null){
    if (dead){
      window.location.href = 'index.html';
    }
    u = user;
    main();
  }else{
    window.location.href = 'index.html';
  }
});

function main(){
  var all = getJson();
  var uid = u.uid;
  room = all.users[u.uid].room;
  room = all.users[u.uid].room;
  if(all.rooms[room].players[u.uid].role == "deadMansHand"){
    for (x in all.rooms[room].players) {
      $('#names').append('<input type="radio" name="player" onclick="bodyguardListener(this.value)" value=' + all.rooms[room].players[x].uid + '>' + all.rooms[room].players[x].name);
    }
  }else{
    if(all.rooms[room].players[u.uid].guarded == true){
      firebase.database().ref('rooms/' + room + '/players/' + u.uid).update({
        guarded: false
      });
      alert(room+", "+u.uid);
      dead = true;
      //window.location.assign("main.html");
    }else{
      if(all.rooms[room].players[u.uid].lover != null){
        alert(u.uid);
        kill(all.rooms[room].players[u.uid].lover);
        kill(u.uid);

        alert("post");

        //window.location.assign("index.html");
      }
    }
  }
  if(!dead){
    kill(u.uid);
  }
  // window.location.assign("index.html");
}

function bodyguardListener(x){
  alert(x);
  kill(x);
  kill(u.uid);
  //window.location.assign("index.html");
}

function kill(x) {
  var pRef = firebase.database().ref('rooms/' + room + '/players/' + x);
  //if the loged-in user is the user that everyone voted to kill,
  //they remove their info when they log in
  console.log(pRef);
  pRef.on('value', function(snapshot){
    console.log(snapshot.val());
  });
  alert("kill");

  pRef.remove()
    .then(function() {
      console.log("sucess");
      alert("sucess");
      if(x == u.uid){
        window.location.href = 'index.html';
      }else{
        window.location.href = 'main.html';
      }
    })
    .catch(function(error) {
      console.log("Remove failed: " + error.message)
      alert("failed");
    });
    alert("dead");
}

function back(){
  if(!dead){
    window.location.href = 'index.html';
  }else{
    window.location.href = 'main.html'
  }
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
