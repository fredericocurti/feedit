// Initialize Firebase
var config = {
  apiKey: "AIzaSyBcFce_uWpOt8QHJKnU7fBBaPmOSMEbiTo",
  authDomain: "febee-2b942.firebaseapp.com",
  databaseURL: "https://febee-2b942.firebaseio.com",
  storageBucket: "febee-2b942.appspot.com",
  messagingSenderId: "301542026521"
};
var places = [];
var updatecounter = 0;
var initialstate = 0;
var newEval = null;
var datacounter = 0;
var db = {};
var initialislodaded = false;

function Feedit() {
  // this.signInButton = document.getElementById('submitbt');
  // this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
Feedit.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
  // Initiates Firebase auth and listen to auth state changes.
};

Feedit.prototype.startHandler = function(){
  var ref = this.database.ref(currentUser.uid);
  ref.once("value", function(snap) {
    currentUser.count = snap.numChildren();
    console.log("INITIAL DATA COUNT:", currentUser.count);

    if(currentUser.count == 0){
      $("#maindata").append(
        "<h5 class='center' style='padding-top:50px;'> Não existem dados para esse usuário. Configure o dispositivo de feedback corretamente. </h5>");
    }

    feedit.getData();
  });
}

Feedit.prototype.onDataLoaded = function(){
  $('.collapsible').collapsible();
  console.log("Initial collapsible started");
  fixheaders()
  // $(".badge").attr("class","badge");
}

// Initialize mainapp
Feedit.prototype.displayGui = function(){
    $("#loadingbar").attr("style","");
    $("#loadingbar").center();
    $("#header").remove();
    $("#iconsection").remove();
    $("#mainshow").removeClass("mainbg");
    $( "#main-content" ).append(
    "<div class='center'><h5><b>Painel de Controle</b></h5><h6 style='color:grey;'>" + currentUser.email + " | ID: " + currentUser.uid +  "</h6>" +
    "<div class='divider'></div></div>"+
    '<a id="notifications-button" status="on" class="fixed-action-btn toprightcorner btn-floating btn-large waves-effect waves-light red darken-2 tooltip" data-tooltip-content="#tooltip_content"><img id="notifications-button-img" src="img/bell.png" width="28px"></a>'+

    '<div class="tooltip_templates">'+
    '<span id="tooltip_content">'+
        'No new notifications'+
    '</span>'+
    '</div>'+

    '<div class="data-container">'+
    '<div class="row">'+
      '<div class="col m2">'+
      '<h5 style="color:grey;"> Menu </h5>'+
      '<a class="waves-effect waves-light btn red darken-3"><i class="material-icons left"></i>Locais</a>'+
      '</div>'+
      '<div class="col s12 m10">'+
      "<div id='maindata' class='Site-content'></div>"+
      '</div>'+
    '</div'+
    '</div>'
  );

  // Deals with the notification button state = on/off
    $("#notifications-button").click(function(){
      if ($("#notifications-button").attr("status") == 'on'){
        $("#notifications-button").attr('status','off');
        $("#notifications-button").removeClass('red darken-2');
        $("#notifications-button").addClass('grey');
        $("#notifications-button-img").attr('src','img/bell_crossed.png');
      } else {
        $("#notifications-button").attr("status",'on');
        $("#notifications-button").removeClass('grey');
        $("#notifications-button").addClass('red darken-2');
        $("#notifications-button-img").attr('src','img/bell.png');
      }
    });
    //   $(localid_header).attr('counter',0);
    //   $(this).children().eq(2).remove();
    // });

    loading = document.getElementById("loadingbar");
    $("#maindata").append(loading);
    $("#navbar").css("background-color","rgb(187,41,41)");
    $('.tooltip').tooltipster({
      animation : 'grow',
      content: $("#tooltip_content"),
      theme: 'tooltipster-shadow',
      side: 'left',
      trigger : 'custom',
      timer : 2000,
      contentAsHTML: true,
      contentCloning: true
    });
    // Draws container for key values
    $("#maindata").append(
      '<div>'+
      '<h5 style="color:gray">Seus locais</h5>'+
      // '<div class="row center" style="margin-bottom:0px;border-style: solid;border-color:#e7e7e7;"><div class="col s4">Nota</div><div class="col s4">Hora</div><div class="col s4">Data</div></div>'+
      '<ul id="main-values" class="collapsible" data-collapsible="expandable">'+
      '</ul>'+
      '</div>');
}


Feedit.prototype.displayData = function(data){
  Key = data;

    if(places.includes(Key.local) == true){ // PREPENDS TO THE LATEST ITEM LIST
      // console.log("locale "+Key.local+" already exists. Appending to the correct place")
      var localid = '#'+Key.local;
      var localchild_test = '#test-'+Key.local+'>:nth-child(1)';
      var localchild_testref = '#test-'+Key.local
      var localid_content = '#content-'+Key.local;
      var localid_counter_ref = '#counter-'+Key.local;
      var localchild_id = '#'+Key.local+'>:nth-child(2)';
      // $("#biblioteca>:nth-child(2)").before("<div>inserted div</div>");
      // $(localchild_id).before(
      // '  <div class="collapsible-body" style="padding:4px;"><span style="padding-left:5%;">'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
      // );
      if(initialislodaded == false){
        $(localchild_test).before(
        '  <div class="collapsible-body" id="'+datacounter+'" style="padding:4px;"><span style="padding-left:5%;">'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
        );
      }
      else if(initialislodaded == true){
        datacounter_id = "#"+datacounter
        $(localchild_test).before(
        '  <div class="collapsible-body" id="'+datacounter+'" style="padding:4px;background-color:#b0e0e2;"><span style="padding-left:5%;">'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
        );
        // $(datacounter_id).animate({opacity:'1'}, 2000);
        $(datacounter_id).animate({backgroundColor: '#F7F7F7'}, 2000);
      }

      $
      // $(localid_test).append(
      // '<div class="collapsible-body"><span>'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
      // );
      $(localid_counter_ref).html($(localchild_testref)[0].childElementCount-1);

    } else {  // APPENDS FOR THE FIRST TIME, CREATING THE HEADER
      var localid = '#'+Key.local;
      var localid_header = '#header-'+Key.local;
      $("#main-values").append(
        '<li id="'+Key.local+'"">'+ //style="max-height:300px;overflow-y:auto;
        '<div class="collapsible-header" hasflag="0" id="header-'+Key.local+'"><i class="material-icons">label_outline</i><span id="counter-'+Key.local+'"class="badge">'+1+'</span>'+ Key.local.capitalize() + '</div>'+
        '<div class=collapsible-body id="test-'+Key.local+'" style="padding:0px;max-height:300px;overflow-y:auto">'+
        '   <div class="collapsible-body" id="'+datacounter+'" style="padding:4px;"><span style="padding-left:5%">'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'+
        '</div>'+
        '</li>'
      );
      // $(localid).click();
    }

//  THIS PORTION WILL ONLY RUN ON NEW VALUES ARE ADDED TO THE DB WHILE THE APP IS RUNNING
    if (initialislodaded == true){ // adds and counts new badges only if it added after initload is complete
      newBadge = '<span id="badge-'+Key.local+'" class="new badge green" data-badge-caption="Nova"></span>'
      var localid_header = '#header-'+Key.local;
      var localid_badge = '#badge-'+Key.local;
      var flag = $(localid_header).attr('hasflag');
      $(localid_header).attr('counter',parseInt($(localid_header).attr('counter'))+1);
      $(localid_badge).html(parseInt($(localid_header).attr('counter')));
      $(localid_badge).attr("data-badge-caption","Novas");

      if(flag == "0"){ // adds badge for the first time
        $(localid_header).append(newBadge);
        $(localid_header).attr('hasflag','1');
        $(localid_header).attr('counter','1');

        // adds click listener
        $(localid_header).click(function(){
          $(localid_header).attr('hasflag',0);
          $(localid_header).attr('counter',0);
          $(this).children().eq(2).remove();
        });
      }

      placesdeduped = places.removeDuplicates();
      var mustopen = [];

      // Checks for the cards that are open
      for(i=0;i<placesdeduped.length;i++){
        var currentplace = "#"+placesdeduped[i];
        if ($(currentplace).attr("class") == 'active'){
          mustopen.push(i);
        }
      }

      $('.collapsible').collapsible(); // reloads collapsible, closes all

      // opens the ones that should stay open
      for(j=0;j<mustopen.length;j++){
        $('.collapsible').collapsible('open',mustopen[j]);
      }

    } // CLOSES INITIALISLODADED = TRUE

    places.push(Key.local);
    $("#loadingbar").remove();

}

Feedit.prototype.showNotification = function(key){
  var nota = key.nota;
  var nota_img = '<img style="padding-top:10px;display: block;margin: 0 auto;" src="img/'+nota+'.png">'
  var notification_text = "<div class='row center' style='padding-top:4px;'>Nova avaliação<br><b>"+nota.capitalize()+"</b> no local <b>"+key.local.capitalize()+"</b></div>";
  $('.tooltip').tooltipster('content',nota_img+notification_text);
  $('.tooltip').tooltipster('open');

}

// Fetches and calls displayData of the data
Feedit.prototype.getData = function(){
  var ref = this.database.ref(currentUser.uid);

  // Attach an asynchronous callback to read data as soon as it is added to the database
  ref.on("child_added", function(snapshot) {
    this.key = snapshot.val();

    db[datacounter] = (this.key);
    datacounter++;

    // displays data as soon as it is obtained
    feedit.displayData(this.key);

    if( initialislodaded == true && $("#notifications-button").attr("status") == 'on'){
      feedit.showNotification(this.key);
    }

    // Check if initial data has been loaded fully;
    if(datacounter === currentUser.count){
      console.log("Initial data loading complete - launching initialislodaded as True");
      initialislodaded = true;

      feedit.onDataLoaded();
      // Materialize.showStaggeredList('#main-data');// run display animation;
    }

  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}


Feedit.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Cloud Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  } else {
    console.log("Firebase SDK loaded properly")
  }
};

// Signs in
Feedit.prototype.signIn = function() {
  this.auth.signInWithEmailAndPassword(this.userName,this.userPass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if(errorCode == "auth/user-not-found" || errorCode == "auth/wrong-password"){
      console.log("Usuário ou senha inválidos!");
      Materialize.toast('Usuário ou senha incorretos, por favor tente novamente!', 4000,"bottom")
      $('#userpassword').val("");
      $("#loadingbar").hide();
      $("#submitbt").show();
    }
    // console.log(typeof errorCode);
  });
};

Feedit.prototype.signOut = function() {
  this.auth.signOut();
  location.reload();
};

Feedit.prototype.onAuthStateChanged = function(user) {
  console.log("User auth state:");
  console.log(user);
  currentUser = user;
  if (user) { // User is signed in!
    console.log("User is signed in");
    $('#modal1').modal('close');
    $("#topuserdisplay-off").remove();
    $('#topuserdisplay').css("display","block");
    document.getElementById("topuserdisplay").innerHTML = user.email;
    document.getElementById("nameshow").innerHTML = user.email;

    if (initialstate == 0){
      feedit.displayGui(initialstate);
      feedit.startHandler(initialstate);
    }

    initialstate=1
    Materialize.toast("Usuário autenticado com sucesso!",4000);

    // Começa o display da GUI de usuário:

  } else { // User is signed out!
    // $("#topuserdisplay-off").css("visibility","visible");
    $("#topuserdisplay-off").css("display","block");
    console.log("User has/is signed out!");
    initialstate = 0;
  }
};


function login(){
  var valemail = $('#useremail').attr('class');
  var varpass = $("#userpassword").attr('class');

  if(valemail == "validate valid"){
    feedit.userName = $("#useremail").val();
    feedit.userPass = $("#userpassword").val();
    console.log("Logging in with credentials:" + feedit.userName + "|" + feedit.userPass);
    feedit.signIn();
    if(initialstate == 0){
      $("#submitbt").hide();
      $("#loadingbar").show();
    }

  } else {
    Materialize.toast("Por favor preencha os campos corretamente",2000);
  }
};

// ---------------------- AUX FUNCTIONS ----------------------------------------

window.onload = function(){
  window.feedit = new Feedit();

  $("#userpassword").keypress(function(e) {
      if(e.which == 13) {
        $("#submitbt").click();
      }
  });
}


$('.dropdown-button').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrainWidth: false, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 0, // Spacing from edge
    belowOrigin: false, // Displays dropdown below the button
    alignment: 'left', // Displays dropdown with edge aligned to the left of button
    stopPropagation: false // Stops event propagation
  }
);

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
                                                $(window).scrollLeft()) + "px");
    return this;
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function fixheaders(){
  for(i=0;i < places.removeDuplicates().length;i++){
      place = places.removeDuplicates()[i];
      $("#header-"+place).click();
      $(".collapsible").collapsible('close',i);
  }
  // for(i=0;i < places.removeDuplicates().length;i++){
  //     place = places.removeDuplicates()[i];
  //     $("#header-"+place).click();
  // }
}

function collapseAll(){
  $(".collapsible-header").removeClass(function(){
    return "active";
  });
  $(".collapsible").collapsible({accordion: true});
  $(".collapsible").collapsible({accordion: false});
}
// $('.dropdown-button').dropdown('open');
Array.prototype.removeDuplicates = function () {
    return this.filter(function (item, index, self) {
        return self.indexOf(item) == index;
    });
};
