
const auth = firebase.auth();

auth.onAuthStateChanged(function(user) {
  if (user) {
    console.log(user);
    $('#account').hide();
    $('#signOut').show();
    document.getElementById("loginText").textContent = "Log Out";
    // $('#line').show();
  } else {
    //window.alert("not logged in");
    document.getElementById("loginText").textContent = "Log In";
    $('#signOut').hide();
    $('#account').show();
  }
});

$('#signInButton').click(function(){
    var email = $('#email').val();
    var password = $('#password').val();
    if(email != "" && password != ""){
      auth.signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
    }
});

$('#signUpButton').click(function(){
    var email = $('#emailForm').val();
    var password = $('#passwordForm').val();
    if(email != "" && password != ""){
      auth.createUserWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
    }
});

$('#signOut').click(function(){
    auth.signOut();
});



/*
var counter = 0;
function spy(value){
  $(document).ready(function(){
    var spy={
      name: "Spy",
      life: true,
      killer: true,
      icon: new Image()
    };
    counter++;
    spy.icon.src = "Images/waves.jpg";
    $('#test').html(spy.icon);
    $("#thing").html(counter);

        if(counter<3 || counter>7){
          $("#testing").html("True");
          $("#test").fadeTo("slow", 1);
          spy.life = true;
        }
        else{
          //$("#testing").html("The " + spy.name + " is dead");
          $("#test").fadeTo("slow", .5);
          spy.life = false;
        }
      });
}
*/
