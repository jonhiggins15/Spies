function createGame(){
  var ref = firebase.database().ref("/rooms");
  // $('#roomButton').click(function(){
    console.log("testing");
    var user = firebase.auth().currentUser;
    var game = {
      host:{
        uid : user.uid,
        displayName: user.displayName
      },
    };

    var key = ref.push();
    key.set(game, function(error){
      if(error){
        console.log("Error creating game", error);
      }else{
        console.log("Created game");
      }
    })
  // });
}
