// Initialize Firebase
var config = {
  apiKey: "AIzaSyBcFce_uWpOt8QHJKnU7fBBaPmOSMEbiTo",
  authDomain: "febee-2b942.firebaseapp.com",
  databaseURL: "https://febee-2b942.firebaseio.com",
  storageBucket: "febee-2b942.appspot.com",
  messagingSenderId: "301542026521"
};

navigator.serviceWorker.register('sw.js');
var locales = {};
var places = [];
var updatecounter = 0;
var initialstate = 0;
var newEval = null;
var datacounter = 0;
var db = {};
var initialisloaded = false;
var userSettingsnotLoaded = true;
var limit = 0;
var userimg = "img/default-icon-user.png";
var notification_sound = new Audio('assets/pop.mp3');
var counterMemory = {}
var notificationslist = [];
var newDataStack = [];
var userIsWatching = true;

function dataBlock(value){
  this.data = {};
  this.hiddenIDs = [];
  this.place = value.local;
  this.counters = {}
  this.counters["total"] = 0;
  this.counters["ruim"] = 0;
  this.counters["bom"] = 0;
  this.counters["excelente"] = 0;
  this.increaseCounter = function(counter){
    this.counters[counter] ++;
  }
}


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
    console.log("Setting limit to: "+currentUser.count);
    limit = currentUser.count

    if(currentUser.count == 0){
      $("#maindata").append(
        "<h5 class='center' style='padding-top:50px;'> Não existem dados para esse usuário. Configure o dispositivo de feedback corretamente. </h5>");
    }

    feedit.getData();
  });
  $("#slide-button").css("display","block");
}

Feedit.prototype.onDataLoaded = function(){
  $('.collapsible').collapsible();

  for(i=0;i<Object.keys(locales).length;i++){
    header_id = "#header-"+Object.keys(locales)[i];
    local = locales[Object.keys(locales)[i]];
    badge_ruim = '<span id="badge-ruim" class="new badge circular-badge" style="background-color:#dd2c00;" data-badge-caption="'+local.counters.ruim+'"></span>'
    badge_bom = '<span id="badge-bom" class="new badge circular-badge" style="background-color:#ff9800;" data-badge-caption="'+local.counters.bom+'"></span>'
    badge_excelente = '<span id="badge-excelente" class="new badge circular-badge" style="background-color:#67e200;" data-badge-caption="'+local.counters.excelente+'"></span>'

    $(header_id).append(badge_ruim,badge_bom,badge_excelente);
    for(j=3;j<=5;j++){
      if ($(header_id)[0].childNodes[j].getAttribute("data-badge-caption") == 0){
        $(header_id).children().eq(j-1).css("display","none");
      }
    }
    // show first 50 data
    initlen = local.hiddenIDs.length;
    for(k=initlen-1;k != initlen - 50;k--){
      $("#"+local.hiddenIDs[k]).css("display","block");
      $("#"+local.hiddenIDs[k]).css("opacity","1");
      local.hiddenIDs.splice(k,1);
    }
  }

  fixheaders();

  $("#data-counter").html("Você possui "+currentUser.count+" avaliações no total. Mostrando as últimas "+limit);
  // $('.scrollbar-outer').scrollbar();

  $('#usersettingsbutton').click(function(){
    feedit.userSettings();
    setTimeout(function(){
      $('#user-modal').modal('open');
    },500);
  });

  $('#sidenav-usersettingsbutton').click(function(){
    $('.button-collapse').sideNav('hide');
    feedit.userSettings();
    setTimeout(function(){
      $('#user-modal').modal('open');
    },500);
  });

  $('.grid').masonry({
  // options
  itemSelector: '.grid-item',
  transitionDuration: '0.25s',
  percentPosition: true,
  // horizontalOrder : true
  });

  // Calculates the differences between last session and current, appending new badges respectively

  // Requests permission for showing Notification
  if (Notification.permission !== "granted"){
    $("#allownotifications-modal").modal('open');
    Notification.requestPermission();
  }
}

// Initialize mainapp
Feedit.prototype.displayGui = function(){
    $("#loadingbar").attr("style","");
    $("#loadingbar").center();
    $("#header").remove();
    $("#iconsection").remove();
    $("#mainshow").removeClass("mainbg");
    $( "#main-content" ).prepend(
    '<a id="notifications-button" status="on" class="fixed-action-btn toprightcorner btn-floating btn-large waves-effect waves-light red accent-2 tooltip" data-tooltip-content="#tooltip_content"><img id="notifications-button-img" src="img/bell.png" width="28px"></a>'+

    '<div class="tooltip_templates">'+
    '<span id="tooltip_content">'+
        'No new notifications'+
    '</span>'+
    '</div>'+

    '<div class="data-container">'+
    '<div class="row">'+
      '<div class="col s12 m12">'+
      "<div id='maindata' class='Site-content'></div>"+
      '</div>'+
      // '<div class="col s6 m6">'+
      // '<h4>HUEAHUEA</h4>'+
      // '</div>'+
    '</div'+
    '</div>'
  );

  // Deals with the notification button state = on/off
    $("#notifications-button").click(function(){
      if ($("#notifications-button").attr("status") == 'on'){
        $("#notifications-button").attr('status','off');
        $("#notifications-button").removeClass('red darken-4');
        $("#notifications-button").addClass('grey');
        $("#notifications-button-img").attr('src','img/bell_crossed.png');
      } else {
        $("#notifications-button").attr("status",'on');
        $("#notifications-button").removeClass('grey');
        $("#notifications-button").addClass('red darken-4');
        $("#notifications-button-img").attr('src','img/bell.png');
      }
    });

    loading = document.getElementById("loadingbar");
    $("#maindata").append(loading);
    // $("#navbar").css("background-color","rgb(187,41,41)");
    $('.tooltip').tooltipster({
      animation : 'grow',
      content: $("#tooltip_content"),
      theme: 'tooltipster-shadow',
      side: 'top',
      trigger : 'custom',
      timer : 2000,
      contentAsHTML: true,
      contentCloning: true,
      functionPosition: function(instance, helper, position){
      position.coord.left -= 30;
      return position;
  }
    });
    // Draws container for key values
    $("#maindata").append(
      '<div>'+
      '<h5 style="color:gray">Visão Geral</h5>'+
      '<div class="divider"></div>'+
      '<h6 id="data-counter" style="padding:10px;"></h6>'+
      '</div>'+
      '<div id="data-wrapper" class="grid" style="containerStyle: null;">'+
      // '<ul id="main-values" class="collapsible" data-collapsible="expandable">'+
      '</ul>'+
      '</div>');
}


Feedit.prototype.displayData = function(data){
  Key = data;
  datacounter_id = "#"+datacounter

    if(places.includes(Key.local) == true){ // PREPENDS TO THE LATEST ITEM LIST
      // console.log("locale "+Key.local+" already exists. Appending to the correct place")
      var localid_header = '#header-'+Key.local;
      var localid = '#'+Key.local;
      var localchild_data = '#data-'+Key.local+'>:nth-child(1)';
      var localchild_dataref = '#data-'+Key.local
      var localid_content = '#content-'+Key.local;
      var localid_counter_ref = '#counter-'+Key.local;
      var localchild_id = '#'+Key.local+'>:nth-child(2)';

      if(initialisloaded == false){

        $(localchild_data).before(
        '<div class="collapsible-body row datarow" style="display:none;opacity:0" id="'+datacounter+'">'+
        '   <span class="col s4 left-align">'+ Key.nota.capitalize() +'</span><span class="col s4 center-align">' + Key.hora + '</span><span class="col s4 right-align">' + Key.data +'</span>'+
        '</div>'
        );
        locales[Key.local].hiddenIDs.push(datacounter);

        colorString(datacounter);

      }
      else if(initialisloaded == true){
        // adds data
        $(localchild_data).before(
        '<div class="collapsible-body row datarow" id="'+datacounter+'" style="background-color:#d5f6f7;">'+
        '   <span class="col s4 left-align">'+ Key.nota.capitalize() +'</span><span class="col s4 center-align">' + Key.hora + '</span><span class="col s4 right-align">' + Key.data +'</span>'+
        '</div>'
        );

        // animates newly added background color
        if (userIsWatching == true && $(datacounter_id).closest("li").attr("class") == "active"){
          $(datacounter_id).animate({backgroundColor: '#F7F7F7'}, 2000);
        } else {
          newDataStack.push(datacounter_id);
        }

        $("#data-counter").html("Você possui "+datacounter+" avaliações");

        colorString(datacounter); // colors the string

        // Sets the counter for each grading
        $(localid_header)[0].childNodes[3].setAttribute("data-badge-caption",locales[Key.local].counters.ruim);
        $(localid_header)[0].childNodes[4].setAttribute("data-badge-caption",locales[Key.local].counters.bom);
        $(localid_header)[0].childNodes[5].setAttribute("data-badge-caption",locales[Key.local].counters.excelente);

        for (k=3;k<=5;k++){
          if ($(localid_header)[0].childNodes[k].getAttribute("data-badge-caption") != 0 ){
              $(localid_header).children().eq(k-1).css("display","block");
          }
        }

      }

      $(localid_counter_ref).html($(localchild_dataref)[0].childElementCount - 1);

    } else {  // APPENDS FOR THE FIRST TIME, CREATING THE HEADER
      var col_label = "col-"+Key.local;
      var localid = '#'+Key.local;
      var localid_header = '#header-'+Key.local;
      $("#data-wrapper").append(
        '<div class="grid-item">'+
            '<ul id="'+col_label+'" class="collapsible" style="margin:0px;" data-collapsible="expandable">'+
                '<li id="'+Key.local+'"">'+ //style="max-height:300px;overflow-y:auto;
                    '<div class="collapsible-header waves-effect waves-subtle" hasflag="0" id="header-'+Key.local+'"><i class="tiny material-icons" style="display:none;margin-right:7px !important;">label_outline</i><span id="counter-'+Key.local+'"class="badge counter-badge">'+1+'</span>'+ Key.local.capitalize() + '</div>'+
                    '<div id="data-'+Key.local+'" class="collapsible-body" style="padding:0px;overflow-y:auto;max-height:300px;">'+ // DIV CONTAINING KEYS
                        '<div class="collapsible-body row datarow" id="'+datacounter+'" style="opacity:0;display:none">'+
                            '<span class="col s4 left-align">'+ Key.nota.capitalize() +'</span><span class="col s4 center-align">' + Key.hora + '</span><span class="col s4 right-align">' + Key.data +'</span>'+
                        '</div>'+
                        '<div class="collapsible-body row center" style="margin-bottom:0px;padding:0px;">'+
                            '<a id="showmorebt-'+Key.local+'" class="btn-flat waves-effect waves-light center-align" style="display:none;color:gray"><i class="material-icons">add</i>Mostrar mais</a>'+
                        '</div>'+
                    '</div>'+
                '</li>'+
            '</ul>'+
        '</div>'
      );

      // colorString(datacounter);
      locales[Key.local].hiddenIDs.push(datacounter);

      button_refid = "#showmorebt-"+Key.local;
      $(button_refid).click(function(){
        showMoreData(this.id);
      });

      $(localid_header).click(function(){
        setTimeout(function(){ refreshgrid(); }, 150);
        setTimeout(function(){ refreshgrid(); }, 250);
        setTimeout(function(){ checkStack(); }, 1000);
      });

    }

//  THIS PORTION WILL ONLY RUN ON NEW VALUES ARE ADDED TO THE DB WHILE THE APP IS RUNNING
    if (initialisloaded == true){ // adds and counts new badges only if it added after initload is complete
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
        $(localid_header).children().eq(5).animate({opacity: '0'}, 1000);
          setTimeout( function() {
            $(localid_header).children().eq(5).remove();
          }, 1000);

        });
      }

      placesdeduped = Object.keys(locales);
      var mustopen = [];

      // Checks for the cards that are open
      for(i=0;i<placesdeduped.length;i++){
        var currentplace = "#"+placesdeduped[i];
        if ($(currentplace).attr("class") == 'active'){
          mustopen.push(placesdeduped[i]);
        }
      }

      $('.collapsible').collapsible(); // reloads collapsible, closes all

      // opens the ones that should stay open
      for(j=0;j<mustopen.length;j++){
        place_toopen = mustopen[j];
        col_to_open = "#col-"+place_toopen;
        $(col_to_open).collapsible('open',0);
      }

    } // CLOSES initialisloaded = TRUE

    if (locales[Key.local].counters.total == 50){
      button_refid = "#showmorebt-"+Key.local;
      $(button_refid).css("display","inline-flex");
    }

    places.push(Key.local);
    $("#loadingbar").remove();
}

Feedit.prototype.showNotification = function(key){
  var nota_img = '<img style="padding-top:10px;display: block;margin: 0 auto;" src="img/'+key.nota+'.png">'
  var notification_text = "<div class='row center' style='padding-top:4px;'>Nova avaliação<br><b>"+key.nota.capitalize()+"</b> no local <b>"+key.local.capitalize()+"</b></div>";
  $('.tooltip').tooltipster('content',nota_img+notification_text);
  $('.tooltip').tooltipster('open');
  notification_sound.play();
  showDesktopNotification(key);
}

// Fetches and calls displayData of the data
Feedit.prototype.getData = function(){
  var ref = this.database.ref(currentUser.uid);

  // Attach an asynchronous callback to read data as soon as it is added to the database
  ref.limitToLast(limit).on("child_added", function(snapshot) {
    this.key = snapshot.key;
    this.val = snapshot.val();
    console.log(snapshot.key);
    //
    // db[this.key] = this.val;

    // Deals with the locale objects when data is recieved
    local = this.val.local
    if (locales[local] != undefined){
      locales[local].data[this.key] = this.val;
      locales[local].increaseCounter("total");
      locales[local].increaseCounter(this.val.nota);

    } else {
      if (this.key != "metadata"){
        locales[local] = new dataBlock(this.val);
        locales[local].data[this.key] = this.val;
        locales[local].increaseCounter("total");
        locales[local].increaseCounter(this.val.nota);
      }
    }

    // displays data as soon as it is obtained
    if (this.key != "metadata"){
      datacounter++;
      feedit.displayData(this.val);
    } else {
      console.log("Metadata obtained");
      currentUser.metadata = {};
      currentUser.metadata["counterMemory"] = JSON.parse(this.val.counterMemory);
      showCounterMemory();
    }

    if(initialisloaded == true && $("#notifications-button").attr("status") == 'on' && this.key != "metadata"){
      feedit.showNotification(this.val);
    }

    // Check if initial data has been loaded fully;

    console.log(datacounter);
    console.log(currentUser.count);

    if(datacounter == currentUser.count - 1 && initialisloaded == false){
      console.log("Initial data loading complete - launching initialisloaded as True");
      initialisloaded = true;
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
  saveCounterMemory();
  this.auth.signOut();
  location.reload();
};

Feedit.prototype.registerNewUser = function(){
  var valemail = $('#useremail').attr('class');
  var varpass = $("#userpassword").attr('class');

  if(valemail == "validate valid"){
    var email = $('#useremail').val();
    var password = $("#userpassword").val();
    this.auth.createUserWithEmailAndPassword(email,password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});
  Materialize.toast("NOVO USUÁRIO REGISTRADO COM SUCESSO!",3000);

  } else {
    Materialize.toast("Por favor preencha os campos corretamente",2000);
  }
}

Feedit.prototype.userSettings = function(){
  if (userSettingsnotLoaded == true){
    $("#mainshow").append(
      '<div id="user-modal" class="modal bottom-sheet">'+
          '<div class="modal-content">'+
          '<div class="container">'+
          '<div class="row">'+
              '<h4 style="color:grey">Configurações da Conta</h4>'+
              '<h6 style="color:grey" class="left-align"><b>ID :</b> '+currentUser.uid+'</h6>'+
          '</div>'+
            '<div class="row center">'+
            '<form id="form1" runat="server">'+
                '<div class="image-upload">'+
                '<label for="file-input">'+
                '<img id="blah" height="100px" width="100px" class="circle" src="'+userimg+'">'+
                '</label>'+
                '<input id="file-input" type="file">'+
                '</div>'+
            '</form>'+
            // '<a href="#!user"><img class="circle" width="100px" src="img/default-icon-user.png"></a>'+
            '</div>'+
            // '<div id="slider">'+
            // 	'<form action="#">'+
            //       '<p class="range-field">'+
            //           '<input type="range" min="50" max="'+currentUser.count+'" step="5" />'+
            //       '</p>'+
            //   '</form>'+
            // '</div>'+
                    '<div class="row">'+
                        '<div class="input-field col s6">'+
                            '<input disabled placeholder="" id="username" type="text" class="validate">'+
                            '<label class="active" for="username">Nome do usuário/empresa</label>'+
                        '</div>'+
                        '<div class="input-field col s6">'+
                            '<input disabled placeholder="" id="email" type="text" class="validate">'+
                            '<label class="active" for="email">Email</label>'+
                        '</div>'+
                    '</div>'+
                    '<div class="row center">'+
                        '<div class="col m4 s12">'+
                          '<a class="userbt center waves-effect waves-light btn blue lighten-2"><i class="material-icons left">mode_edit</i>Editar</a>'+
                        '</div>'+
                        '<div class="col m4 s12">'+
                          '<a class="userbt center waves-effect waves-light btn green lighten-2"><i class="material-icons left">play_for_work</i>Baixar dados</a>'+
                        '</div>'+
                        '<div class="col m4 s12">'+
                          '<a class="userbt center waves-effect waves-light btn red lighten-2"><i class="material-icons left">lock</i>Redefinir senha</a>'+
                        '</div>'+

                    '</div>'+

                                    // '<div class="row">'+
                    // 		'<div class="input-field col s6">'+
                    // 				'<input id="password" type="password" class="validate">'+
                    // 				'<label for="password">Password</label>'+
                    // 		'</div>'+
                    // '</div>'+
                    // '<div class="row">'+
                    // 		'<div class="input-field col s12">'+
                    // 				'<input id="email" type="email" class="validate">'+
                    // 				'<label class="active" for="email">Email</label>'+
                    // 		'</div>'+
                    // '</div>'+
                    // '<div class="row">'+
                    // 		'<div class="col s12">'+
                    // 				'This is an inline input field:'+
                    // 				'<div class="input-field inline">'+
                    // 						'<input id="email" type="email" class="validate">'+
                    // 						'<label class="active" for="email" data-error="wrong" data-success="right">Email</label>'+
                    // 				'</div>'+
                    // 		'</div>'+
                    // '</div>'+
                '</form>'+
          '</div>'+
        '</div>'+
          '<div class="modal-footer">'+
              '<a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Fechar</a>'+
          '</div>'+
      '</div>'
    );

  userSettingsnotLoaded = false;

  }

  $("#file-input").change(function(){
      readURL(this);
  });

  $("#username").attr("placeholder",currentUser.displayName);
  $("#email").attr("placeholder",currentUser.email);
  $('.modal').modal();
}


Feedit.prototype.onAuthStateChanged = function(user) {
  currentUser = user;
  $('#initloading').remove();

  if (user) { // User is signed in!
    console.log("User is signed in");
    $("#newUID").html(" ID: "+currentUser.uid);
    $('#modal1').modal('close');
    $("#topuserdisplay-off").remove();
    $('#topuserdisplay').css("display","block");
    if (user.photoURL != null){
      console.log("User has a profile pic.");
      userimg = currentUser.photoURL;
      $("#sidebar-thumb").attr("src",currentUser.photoURL);
    } else {
      console.log("User doesnt have a profile pic. Setting default");
    }

    document.getElementById("topuserdisplay").innerHTML = '<img style="margin-top:10px;" class="circle user-img" width="30px" height="30px" src="'+userimg+'">';
    $("#imgshow").html('<img style="margin-top:10px;" class="circle user-img" width="30px" height="30px" src="'+userimg+'">');

    document.getElementById("nameshow").innerHTML = currentUser.email;
    document.getElementById("user-email").innerHTML = currentUser.email;

    if (initialstate == 0){
      Materialize.toast("Usuário autenticado com sucesso!",4000);
      feedit.displayGui(initialstate);
      feedit.startHandler(initialstate);
    }

    initialstate=1


  } else { // User is signed out!
    $("#intro-content").css("display","block");
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
    console.log("Logging in to:" + feedit.userName);
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

window.onbeforeunload = function () {
    console.log("Saving data");
    saveCounterMemory();
};


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

function saveCounterMemory(){
  for(i=0;i < Object.keys(locales).length;i++){
    counterMemory[Object.keys(locales)[i]] = locales[Object.keys(locales)[i]].counters.total;
  }
  counterMemoryString = JSON.stringify(counterMemory);
  feedit.database.ref(currentUser.uid+"/metadata").set({
  counterMemory : counterMemoryString
}).then(function(){
  console.log("counter memory saved");
});
}


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

function colorString(counter){

  console.log($("#"+counter));

  // if ($("#"+counter).childNodes[1].innerHTML == "Excelente"){
  //   $("#"+counter).childNodes[1].outerHTML = '<span class="col s4 left-align nota-excelente">Excelente</span>'
  // }
  // else if ($("#"+counter).childNodes[1].innerHTML == "Bom"){
  //   $("#"+counter).childNodes[1].outerHTML = '<span class="col s4 left-align nota-bom">Bom</span>'
  // }
  // else if ($("#"+counter).childNodes[1].innerHTML == "Ruim"){
  //   $("#"+counter).childNodes[1].outerHTML = '<span class="col s4 left-align nota-ruim">Ruim</span>'
  // }
}

function showDesktopNotification(key){
  if (!Notification) {
    alert('Notificações não estão disponíveis nesse navegador. Experimente um navegador mais moderno como o Google Chrome');
    return;
  }

  if (Notification.permission !== "granted"){
    Notification.requestPermission();
  } else {
    var options = { tag : 'feedit-notification' };
    navigator.serviceWorker.ready.then(function(registration) {
      registration.getNotifications(options).then(function(notifications) {
        if (notifications.length != 0){
          notifications[0].close();
        }

      setTimeout(function(){
        registration.showNotification('Feedit - Nova avaliação!', {
          actions: [{action: 'open',title: "Abrir o Aplicativo",icon: 'img/grid.png'},{action: 'mute',title: "Silenciar",icon: 'img/bell_crossed_inv.png'}],
          icon: 'img/'+key.nota+'.png',
          body: 'Um cliente avaliou o local '+key.local.capitalize()+' como '+key.nota.capitalize(),
          tag: 'feedit-notification',
          vibrate: [300,100,100]
        });})}, 500);
    });
  }
}

function showCounterMemory(){
  var parsed_lastuserCount = currentUser.metadata.counterMemory;
  console.log("There is a last user Count avaiable");

  for(i=0;i < Object.keys(locales).length;i++){
    var currentcounter = locales[Object.keys(locales)[i]].counters.total;
    var parsedcounter = parsed_lastuserCount[Object.keys(locales)[i]];
    counterMemory[Object.keys(locales)[i]] = currentcounter - parsedcounter;
  }

  for(i=0;i < Object.keys(counterMemory).length;i++){
    if (counterMemory[Object.keys(counterMemory)[i]] != 0 && isNaN(counterMemory[Object.keys(counterMemory)[i]]) == false){
      console.log("Existe uma diferenca no local "+Object.keys(counterMemory)[i]);
      var localid_header = '#header-'+Object.keys(counterMemory)[i];
      $(localid_header).append(
      '<span class="new badge cyan" data-badge-caption="'+counterMemory[Object.keys(counterMemory)[i]]+' Novas"></span>');
    }
  }


}

function fixheaders(){
  places = Object.keys(locales);
  for(i=0;i < places.length;i++){
      place = places[i];
      $("#header-"+place).click();
      $(".collapsible").collapsible('close',i);
  }
  h = $(".grid-item");
  console.log("Headers fixed, showing headers");
  setTimeout(function(){ animateInsert(); }, 500);
  // for(i=0;i < places.removeDuplicates().length;i++){
  //     place = places.removeDuplicates()[i];
  //     $("#header-"+place).click();
  // }
}

function animateInsert(){
  for(j=0; j <= h.length-1;j++ ){
    $(h[j]).addClass("loaded");
  }
}

function refreshgrid(){
  $(".grid").masonry('layout');
}

// $('.dropdown-button').dropdown('open');
Array.prototype.removeDuplicates = function () {
    return this.filter(function (item, index, self) {
        return self.indexOf(item) == index;
    });
};

window.onfocus=function() {
  userIsWatching = true;
  checkStack();
};

window.onblur=function(){
  userIsWatching = false;
}

function checkStack() {
  if (newDataStack.length != 0){
    for (i = newDataStack.length-1; i+1 != 0;i--){
        if ($(newDataStack[i]).parent().parent().attr("class") == "active"){
          $(newDataStack[i]).animate({backgroundColor: '#F7F7F7'}, 3000);
          newDataStack.splice(i, 1);
        }
    }
  }
}

function showMoreData(local){
  place = local.slice(11, local.length);
  console.log("show more data @" + place);
  hiddenIDs = locales[place].hiddenIDs;
  initlen = locales[place].hiddenIDs.length;
  if (hiddenIDs.length != 0){
    for(i=initlen-1; i != initlen - 51;i--){
      $("#"+hiddenIDs[i]).css("display","block");
      $("#"+hiddenIDs[i]).animate({opacity: '1'}, 2000);
      locales[place].hiddenIDs.splice(i,1);
    }
  }
  if (locales[place].hiddenIDs.length == 0){
    $("#"+local).remove();
  }
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          render(e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

var MAX_HEIGHT = 100;
function render(src){
  var image = new Image();
  image.onload = function(){
    var canvas = document.createElement("canvas");
    if(image.height > MAX_HEIGHT) {
      image.width *= MAX_HEIGHT / image.height;
      image.height = MAX_HEIGHT;
    }
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    resizedimgUrl = canvas.toDataURL();

    $('#blah').attr('src', resizedimgUrl);
    currentUser.updateProfile({
    photoURL: resizedimgUrl
    }).then(function() {
    // Materialize.toast("Imagem do usuário atualizada com sucesso",1000);
    $("#sidebar-thumb").attr("src",currentUser.photoURL);
    $("#imgshow > img").attr("src",currentUser.photoURL);
    $("#topuserdisplay > img").attr("src",currentUser.photoURL)
  }, function(error) {
    Materialize.toast("Ocorreu um erro",1000);
    });
  };
  image.src = src;
}
