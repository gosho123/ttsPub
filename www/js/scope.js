console.log("TTS App - v17")

//////////////////////////****  MY ACCOUNT CONTROLLER FUNCTIONS ***/////////////////////  
var taskListLink = "taskList.json";
var taskData = "taskData.json";

var app = angular.module('App', ['ngSanitize']);

var globalScope = globalScope || {};

app.config(function($httpProvider) {
    //Enable cross domain calls
    //$httpProvider.defaults.useXDomain = true;
});

app.controller('Ctrl', function($scope, $http, $document, $sce) {
    $scope.TheThinkingShedRoot = "http://explore2.thethinkingshed.com";
    //$scope.goShoRoot = "http://www.tts-app.com/media";
    $scope.goShoRoot = "http://www.gs0.co/tts/media";

    $scope.loggedIn = false;
    $scope.userID = "";
    $scope.taskID = "";
    $scope.messageID = "";

    $scope.liveScreen = liveScreen;

    $scope.screenArray = [$scope.liveScreen];

    $scope.taskLiskData = [];

    $scope.weHaveMedia = false;
    $scope.weHaveText = false;

    $scope.messageText = "";
    $scope.mediaString  = "";
    $scope.mediaSuffix = "";
    $scope.mimeType = "";
    $scope.mid = "";
    $scope.errorMessage = "";

    $scope.username = "respondent";
    $scope.password = "respondent";

    // ng-hide/show defaults

    $scope.loggingIn = false;
    $scope.connectionError = false;
    $scope.loginError = false;
    $scope.loadingMessages = false;

    // HTML injectors

    $scope.errorhtml = function(header, text) {

        return '<div class="errorMessage"><h2>'+header+'</h2><p>'+text+'</p><a><p>Tap here to close and try again.</p></a></div>';
    }

    $scope.renderError = function(header, text){

        return $sce.trustAsHtml($scope.errorhtml(header, text));

    };

    //////// LOGIN

    $scope.appLogin = function(){

        if ($scope.loginError == true){
            $scope.closeError();
            $scope.loginError = false;
        }

        if ($scope.username == undefined || $scope.password == undefined || $scope.username == '' || $scope.password == ''){

            $scope.loginError = true;

        } else {

            $scope.loggingIn = true

            var pjq = jQuery.noConflict();   

            $scope.params = []
            $scope.params.push("username=" + $scope.username);
            $scope.params.push("password=" + $scope.password);

            pjq.ajax({

                url: $scope.TheThinkingShedRoot + "/appl",

                type: "POST",

                dataType: "json",

                crossDomain: true,

                xhrFields: { withCredentials: true },

                data: $scope.params.join("&"),

                success: function(data) {

                    var obj = data;

                    if (obj.login == "success") {

                        $scope.userID = obj.id;
                        $scope.getTasks();
                        $scope.loggedIn = true;

                    } else {

                        $scope.errorManager('appLogin');
                        $scope.loginError = true;
                    }

                },

                complete: function (data) {

                },

                error: function(a,b,c) {

                    $scope.errorManager('appLogin');
                },

                timeout: 2000
            });
        }

    }


    /////////////////////////////////////////////////

    $scope.getTasks = function(){

        if ($scope.connectionError == true){
            $scope.closeError();
            $scope.connectionError = false;
        }
        
        var pjq = jQuery.noConflict();

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/en/tasks/indexApp",
            type: "GET",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },

            success: function(data) {

            },

            complete: function (data) {

                $scope.taskLiskData = JSON.parse(data.responseText);

                for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 
                    $scope.taskLiskData.tasks[i].clicked = false;
                }

                $scope.$apply();

                $scope.proceedApp('taskList')

            },

            error: function(a,b,c) {

                $scope.errorManager('getTasks');
            },
        });

    }

    /////////////////////////////////////////////////

    function errorCallback(message){
        alert("error " + message);
    }

    $scope.gotoMessages = function(index, taskid, navType){

        for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 

            if ($scope.taskLiskData.tasks[i].taskid == taskid){
                $scope.taskLiskData.tasks[i].clicked = true;
            }
        }

        $scope.loadingMessages = true;

        if ($scope.connectionError == true){
            $scope.closeError();
            $scope.connectionError = false;
        }

        var pjq = jQuery.noConflict();

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/en/tasks/taskApp/action?tid="+taskid,
            type: "GET",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },

            success: function(data) {
            },

            complete: function (data) {

                $scope.messageData = JSON.parse(data.responseText);

                console.log("gotoMessages() ");
                console.log($scope.messageData)

                $scope.mid = $scope.messageData[1].mid;

                // remove spinner from task list
                setTimeout(function(){ 
                    
                    for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 

                        if ($scope.taskLiskData.tasks[i].taskid == taskid){

                            $scope.taskLiskData.tasks[i].clicked = false;
                        }
                    }
                }, 500);

                $scope.$apply();

                if (navType != 'backwards'){

                    $scope.proceedApp('messages');
                    $scope.taskID = taskid;
                }

                
            },

            error: function(a,b,c) {
                $scope.errorManager('gotoMessages');
                
                for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 

                    if ($scope.taskLiskData.tasks[i].taskid == taskid){

                        setTimeout(function(){ 
                            $scope.taskLiskData.tasks[i].clicked = false;
                          }, 500);
                        
                    }
                }
            }
        });
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    $scope.allowPolling = false;

    $scope.doPoll = function(){

        if ($scope.allowPolling == true){

            var pjq = jQuery.noConflict();

            $scope.submitParams = []
            $scope.submitParams.push("max=" + $scope.mid);
            $scope.submitParams.push("task=" + $scope.taskID);


            pjq.ajax({


                url: $scope.TheThinkingShedRoot + "/index.php/en/tasks/ping",
                type: "POST",
                dataType: "json",
                crossDomain: true,
                xhrFields: { withCredentials: true },
                data: $scope.submitParams.join("&"),

                success: function(data) {
                    
                    
                },

                complete: function (data) {

                },

                error: function(a,b,c) {
                    $scope.errorManager('doPoll');
                },
            });

            
          }

          setTimeout($scope.doPoll, 10000);
      }

    $scope.doPoll();

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    $scope.randomId = function(mid){

        randomNum = mid.toString() + Math.floor((Math.random() * 999) + 100).toString();
        return randomNum;
    }

    $scope.submitMessage = function(){ // Submit button clicked

        $scope.messageID = $scope.randomId($scope.messageData.length + 1);

        $scope.mediaString = "TTS-" + $scope.userID +'_'+ $scope.taskID +'_'+ $scope.messageID;

        if ($scope.weHaveMedia == true){

            startUploading($scope.userID, $scope.taskID, $scope.messageID);// external upload.js function

        } else if ($scope.weHaveMedia == false && $scope.weHaveText == true){
            $scope.submitDataToTTS();
        }
        
    }

    // Called from upload.js after file selected
    $scope.fileSelected = function(src){

        $scope.weHaveMedia = true;
        $scope.mediaSuffix = $scope.getMediaType(src);
        $scope.mimeType = src;

    }

    $scope.resetMediaFile = function(){
        // do this to reset the input
        document.getElementById('image_file').value = null;
    }

    // text input check
    $scope.checkMessage = function(){

        if($scope.messageText != ""){
            jQuery('#uploadFileTrigger').removeClass('btn-disabled');
            $scope.weHaveText = true;
        } else {
            $scope.weHaveText = false;
        }

         if(($scope.messageText == "") && (weHaveData == false)){
            jQuery('#uploadFileTrigger').addClass('btn-disabled');

        }

    }

    // external upload has finished (from upload.js)
    $scope.uploadFinished = function(userID, taskID, messageID){ 

        $scope.submitDataToTTS();

        /* DEBUGGING

        $scope.resetForm();
        displayConfirmMessage();

        changeUI('uploadFileTrigger', 'display', 'none');
        changeUI('selectFileTrigger', 'display', 'none');
        changeUI('messageText', 'display', 'none');
        changeUI('messageText', 'display', 'none');
        changeUI('removeMedia', 'display', 'none');*/
    }



    $scope.submitDataToTTS = function(){

        var pjq = jQuery.noConflict();   

        $scope.submitParams = []
        $scope.submitParams.push("commentEntry=" + $scope.taskID);
        $scope.submitParams.push("commentData=" + $scope.messageText);

        if ($scope.weHaveMedia == true){
            $scope.submitParams.push("url=" + $scope.mediaString +'.'+ $scope.mediaSuffix);
            $scope.submitParams.push("media=" + $scope.mimeType);
        } else {
            $scope.submitParams.push("url=");
            $scope.submitParams.push("media=");
        }

        console.log($scope.submitParams)

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/en/tasks",
            type: "POST",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },
            data: $scope.submitParams.join("&"),

            success: function(data) {
                var obj = data;
                
                if (obj.isok == "1") {

                } else {

                }

                $scope.resetForm();
                displayConfirmMessage();

                changeUI('uploadFileTrigger', 'display', 'none');
                changeUI('selectFileTrigger', 'display', 'none');
                changeUI('messageText', 'display', 'none');
                changeUI('messageText', 'display', 'none');
                changeUI('removeMedia', 'display', 'none');
                
            },

            complete: function (data) {
            },

            error: function(a,b,c) {
                $scope.errorManager('submitDataToTTS');
            },

            timeout: 2000
        });

    }

    $scope.removeMedia = function(){

        $scope.weHaveMedia = false;
        $scope.mediaString  = "";
        $scope.mediaSuffix = "";
        $scope.mimeType = "";
        setUpUi();// uploader.js
        $scope.checkMessage();
    }

    $scope.resetForm = function(){

        $scope.messageForm.$setPristine();
        $scope.messageText = "";
        $scope.weHaveMedia = false;
        $scope.weHaveText = false;
        $scope.mediaString  = "";
        $scope.mediaSuffix = "";
        $scope.mimeType = "";
        setUpUi();// uploader.js

    }

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////


      $scope.errorManager = function(query){

        switch (query) {

            case "appLogin":

                $scope.displayError('There was an error logging in', '89');
                break;

            case "getTasks":

                $scope.displayError('There was connection error', '89');
                break;

            case "gotoMessages":

                $scope.displayError('There was connection error', '128');
                break;

            case "submitDataToTTS":

                $scope.displayError('There was problem submitting your post', '128');
                break;

            case "doPoll":

                $scope.displayError('Please check your network connection', '128');
                break;

             case "logout":

                $scope.displayError('We could not log you out', '128');
                break;
           
        }
    }

    $scope.displayError = function(message, topY){

        $scope.connectionError = true;
        $scope.errorMessage = message;
        $scope.loggingIn = false;

        if ($scope.liveScreen == 'login'){

            jQuery('.top-layer').animate({paddingTop: '95'}, 500);
            jQuery('.errorMessage').animate({top: '0'}, 500);

        } else {

            jQuery('.top-layer').animate({paddingTop: '145'}, 500);
            jQuery('.errorMessage').animate({top: '59'}, 500);
        }

        $scope.$apply();
    };

    $scope.closeError = function(){

        jQuery('.top-layer').animate({paddingTop: '55'}, 500);

        jQuery('.errorMessage').animate({top: '-90'},{

            duration: 500, complete: function(){

                $scope.$apply();
                $scope.connectionError = false;
                $scope.errorMessage = "";
            }

        });

    }

    $scope.getMediaType = function(src){// from oFile in upload.js

        test = src.split('/');// create mini array
        type = test[1];// get MIME type

        if (type == 'jpeg'){return 'jpg'};
        if (type == 'bmp'){return 'bmp'};
        if (type == 'gif'){return 'gif'};
        if (type == 'png'){return 'png'};
        if (type == 'tiff'){return 'tif'};

        if (type == 'mp4'){return 'mp4'};
        if (type == 'mov'){return 'mov'};
        if (type == 'quicktime'){return 'mov'};
        if (type == 'wm4'){return 'wm4'};
        if (type == 'wmv'){return 'wmv'};

    }

    $scope.isVideo = function(type){

        if ($scope.getMIMEType(type) == "video"){
            return true;
            
         }
    }

    $scope.messageLength = function(){
        if ($scope.messageData > 2){
            return true;
        } else {
            return false;
        }
    }
    /////////////////////////////////////////////////////////////////

    $scope.getMediaURL = function (isapp, url, type){// function to check which images or thumbs to use in messages

        if (isapp == 1){// from go sho app

            if ($scope.getMIMEType(type) == "video"){ //check for video

                return $scope.goShoRoot + "/thumbs/" + $scope.switchMediaSuffix(url, '.jpg');

            } else { // if not video return thumb link

                link = url.replace('http://www.gs0.co/tts/media/http://www.gs0.co/tts/media/', 'http://www.gs0.co/tts/media/');
                link2 = link.replace('http://www.gs0.co/tts/media/', '/media/');

                return $scope.goShoRoot + link2.replace('/media/', '/thumbs/');

            }

        } else { //not go sho app media files

            if (url != null){ // from TTS so use the thumb
                
                return  $scope.TheThinkingShedRoot + url.replace('?thumb=0', '?thumb=1');

            } 
        }

    }

    $scope.viewImage = false;
    $scope.viewVideo = false;

    $scope.imageSource = "";
    $scope.vidSource = "";

    $scope.browser = "";

    $scope.launchVideo = function(src, type, isapp){

        if (isapp == 1){

            $scope.viewVideo = true;

            vidSource = '<video id="videoPlayer" webkit-playsinline controls width="100%" height="auto" preload="metadata" ' + 
                            'poster="'+ $scope.goShoRoot + '/thumbs/' +  $scope.switchMediaSuffix(src, '.jpg') +'">' + 
                            '<source src="'+ $scope.goShoRoot + '/' + $scope.switchMediaSuffix(src, '.ogg') +'" type="video/ogg">' + 
                            //'<source src="'+ $scope.goShoRoot + '/' + $scope.switchMediaSuffix(src, '.webm') +'" type="video/webm">'+
                            '<source src="'+ $scope.goShoRoot + '/' + $scope.switchMediaSuffix(src, '.mov') + '" type="video/quicktime">' +
                            //'<source src="'+ $scope.goShoRoot + '/' + $scope.switchMediaSuffix(src, '.mp4') +'" type="video/mp4">' +
                            
                            '</video>';

            jQuery('#angularVideo').html(vidSource);
            

        } else {

                $scope.videoViewSource = src;
                $scope.viewLargeMedia = true;
                $scope.viewBigVideo = true;
            
        }
    }

    $scope.launchImage = function(src, type, isapp){

        if (isapp == 1){

                link = src.replace('http://www.gs0.co/tts/media/http://www.gs0.co/tts/media/', 'http://www.gs0.co/tts/media/');
                link2 = link.replace('http://www.gs0.co/tts/media/', '');

                $scope.imageSource = $scope.goShoRoot + '/' + link2;
                $scope.viewImage = true;

        } else {

                $scope.imageSource = $scope.TheThinkingShedRoot + src.replace('?thumb=1', '?thumb=0');
                $scope.viewImage = false;
        }
        
    }

    $scope.closeImageViewer = function(){
        
        $scope.viewImage = false;
        $scope.imageSource = "";

    }

    $scope.closeVideoViewer = function(){
        $scope.viewVideo = false;
        jQuery('#angularVideo').html('');  
    }

    $scope.getMIMEType = function(src){// get MIME type

        type = src.split('/')[0];// get MIME type
        if (type == 'video'){return 'video'};
        if (type == 'image'){return 'image'};


    }

    $scope.testVideo = $scope.goShoRoot + "/oggTest.ogg";

    $scope.switchMediaSuffix = function(url, newSuffix, type){

        if (type == 'video'){

            media = $scope.goShoRoot + "/" + url.replace("http://www.gs0.co/tts/media/", "").split('&')[0].split('.')[0] + newSuffix;
            return media

        } else if (type == 'thumb'){

            media = $scope.goShoRoot + "/thumbs/" + url.replace("http://www.gs0.co/tts/media/", "").split('&')[0].split('.')[0] + newSuffix;
            return media

        } else {

            media = url.replace("http://www.gs0.co/tts/media/", "").split('&')[0].split('.')[0] + newSuffix;
            return media;
        }

    }

    /////////////////////////////////////////////////////////////////

    $scope.getUserType = function(user){
        if (user == 'moderator'){
            return "admin-msg";
        } else {
            return "user-msg";
        }
    }

    ///

    $scope.proceedApp = function(nextScreen){

        if ($scope.connectionError == true){
            $scope.closeError();
            $scope.connectionError = false;
        }

        if ($scope.screenArray[$scope.screenArray.length - 1] != nextScreen){
            $scope.screenArray.push(nextScreen);
            $scope.changeScreen(nextScreen, 'swipe-left');
        }
        
    }

    $scope.changeScreen = function(next, trans){

        if ($scope.connectionError == true){
            $scope.closeError();
            $scope.connectionError = false;
        }

        old = $scope.liveScreen;

        if (next != old){

            $scope.liveScreen = next;

            if ($scope.liveScreen == "login"){
                jQuery('.nav-top').hide();
                jQuery('.nav-bottom').hide();
            }

            if ((old == "login")){
                jQuery('.nav-top').show();
                jQuery('.nav-bottom').show();
            }


            // transition 
            jQuery('#screen-'+next).addClass('top-layer');

            jQuery('#appContainer').animate({left: (0 - tts.width) * ($scope.screenArray.length - 1)},{

                    easing: 'easeOutSine', duration: 500, complete: function(){

                        jQuery('#screen-'+old).removeClass('top-layer');

                    }
            });
            // Screen functions

            if ($scope.liveScreen == "reply"){
                setUpUi();
            }

            // activate polling

            if ($scope.liveScreen == "messages"){
                $scope.allowPolling = true;
            } else {
                $scope.allowPolling = false;
            }

        }
    }

    $scope.goBack = function(){

        if ($scope.viewImage == true){

            $scope.viewImage = false;
            $scope.imageSource = "";

        } else if ($scope.viewVideo == true){

            $scope.viewVideo = false;
            jQuery('#angularVideo').html(''); 

        } else if ($scope.liveScreen == "reply"){

            $scope.backToMessages();
        
        } else {

            if ($scope.screenArray[$scope.screenArray.length - 2] != "login"){
                $scope.screenArray.pop();
                $scope.changeScreen($scope.screenArray[$scope.screenArray.length - 1], 'swipe-right');

            }
        }
    }

    $scope.backToMessages = function(){
        
        $scope.screenArray.pop();
        $scope.changeScreen($scope.screenArray[$scope.screenArray.length - 1], 'swipe-right');
        $scope.gotoMessages('null', $scope.taskID, 'backwards')
    }

    $scope.loginApp = function(nextScreen){
        $scope.changeScreen("taskList", 'swipe-left');
        $scope.screenArray.push(nextScreen);
    };


    $scope.logOut = function(){

        var pjq = jQuery.noConflict();

        params = []
        params.push("username=logout");
        params.push("password=logout");

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/appl",
            type: "POST",
            data: params.join("&"),
            dataType: "text",// if error try json
            crossDomain: true,
            xhrFields: { withCredentials: true },

            success: function(data) {

            },

            complete: function (data) {

                var obj = JSON.parse(data.responseText);
            
                if (obj.logout == "success") {

                    $scope.username = "";
                    $scope.password = "";
                    $scope.messageData = "";

                    $scope.loggedIn = false;
                    $scope.loggingIn = false;
                    $scope.userID = "";
                    $scope.taskID = "";
                    $scope.messageID = "";

                    $scope.taskLiskData = [];

                    $scope.messageText = "";
                    $scope.mediaString  = "";
                    $scope.mediaSuffix = "";
                    $scope.mimeType = "";
                    $scope.mid = "";
                    $scope.errorMessage = "";

                    $scope.$apply();

                    $scope.screenArray = ["login"];
                    $scope.changeScreen("login", 'swipe-right');
                    
                    
                } else {

                }

                
            },

            error: function(a,b,c) {
                $scope.errorManager('logout');
            }
        });


    }
    
    $scope.getTaskIconClass = function(type){
        return "icon-" + type;
    }
    
    $scope.getTaskStatusClass = function(complete){
        if (complete == 1){
            return "icon-checkmark";
        } else {
            return "icon-arrow";
        }
    }

});


