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
