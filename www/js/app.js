var liveScreen = "login";

var width = jQuery(window).width();
var height = jQuery(window).height();

jQuery('.app-screen').each(function() { // loop through the screens
    jQuery(this).width(width);
    jQuery(this).height(height);
});

jQuery('#appContainer').width((width * 4) + 10);

jQuery('#screen-'+liveScreen).addClass('top-layer');

if (liveScreen == "login"){
    jQuery('.nav-top').hide();
    jQuery('.nav-bottom').hide();
}

var tts = tts || {};

tts.width = jQuery(window).width();
tts.height = jQuery(window).height();

/////////////////////////////////////

tts.resizeHandler = function(){
    jQuery('top-layer').css("left", "auto"); 
}

// Global call to return user idnentification, task and message id's from the scop to use outside of Angular

function getID(ref){
    if (ref == 'userID'){
        return angular.element(document.querySelector('[ng-controller="Ctrl"]')).scope().userID;
    } 
    if (ref == 'taskID'){
        return angular.element(document.querySelector('[ng-controller="Ctrl"]')).scope().taskID;
    } 
    if (ref == 'messageID'){
        return angular.element(document.querySelector('[ng-controller="Ctrl"]')).scope().messageID;
    }  

}

jQuery( document ).ready(function() {
    console.log(getID('userID') + "_" + getID('taskID') + "_" + getID('messageID'))
});

//////////////////////////////////

jQuery( window ).resize(function() {
  tts.resizeHandler();
});