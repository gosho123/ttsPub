// common variables
var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 1048576 * 200;//1048576; // 1MB
var oTimer = 0;
var sResultFileSize = '';
var weHaveData = false;

//UI Setup

function setUpUi(){
    changeUI('backToMessages', 'display', 'none');
    changeUI('progress_info', 'display', 'none');
    changeUI('uploadComplete', 'display', 'none');
    changeUI('introMessage', 'display', 'block');
    changeUI('messageText', 'display', 'block');
    changeUI('uploadFileTrigger', 'display', 'block');
    changeUI('uploadFileTrigger', 'class', 'btn-primary twelve btn-disabled');
    changeUI('preview', 'display', 'none');
    changeUI('uploadVideoButton', 'display', 'block');
    changeUI('uploadPhotoButton', 'display', 'block');
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    document.getElementById('preview').src = "#";
    if (weHaveData == false){
        changeUI('uploadPhotoButton', 'display', 'block');
        changeUI('uploadVideoButton', 'display', 'block');
    } else {
        changeUI('uploadPhotoButton', 'display', 'none');
        changeUI('uploadVideoButton', 'display', 'none');
        changeUI('preview', 'display', 'block');
    }

}

setUpUi();


function changeUI(element, state, value){
    console.log(element)
    if (state == "display"){
        document.getElementById(element).style.display = value;
    }
    if (state == "opacity"){
        document.getElementById(element).style.opacity = value;
    }
    if (state == "html"){
        document.getElementById(element).innerHTML = value;
    }
    if (state == "class"){
        document.getElementById(element).className = value;
    }
    if (state == "width"){
        document.getElementById(element).style.width = value;
    }
    
}

removeMediaFile = function(){
    document.getElementById('image_file').value = null;
}

// start video capture
function captureVideo(){
    navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1});
    //captureSuccess()
}

function captureImage(){
    navigator.device.capture.captureImage(captureSuccess, captureError, {limit:1});
    //captureSuccess()
}

// capture error callback
var captureError = function(error) {
    navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
};


var fileURL = "";
var fileTypevar = "";
var fileName = "";

var captureSuccess = function(mediaFiles) {

    jQuery("#debug").html(mediaFiles);

    jQuery('#fileURL').html(mediaFiles[0].fullPath);

    if (mediaFiles[0].type == "image/jpeg"){
        jQuery('#preview').attr("src", mediaFiles[0].fullPath);
    } else {
        jQuery('#preview').attr("src", "images/videoIcon.jpg");
    }

    

    jQuery('#fileType').html(mediaFiles[0].type);
    jQuery('#fileName').html(mediaFiles[0].name);


    // hide different warnings
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    changeUI('uploadFileTrigger', 'display', 'block');
    changeUI('uploadFileTrigger', 'class', 'btn-primary twelve')
    changeUI('preview', 'display', 'block');

    changeUI('uploadPhotoButton', 'display', 'none');
    changeUI('uploadVideoButton', 'display', 'none');

    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.fileSelected(mediaFiles[0].type);
    })

    weHaveData = true;
        
};

function startUploading(u, t, m, p) {

    var userID = u;
    var taskID = t;
    var messageID = m;
    var projectID = p;

    console.log('media ID = ' + ' - ' + userID + ' - ' + taskID + ' - ' + messageID)

    changeUI('uploadFileTrigger', 'display', 'none');
    changeUI('progress_info', 'display', 'block');
    changeUI('messageText', 'display', 'none');
    changeUI('preview', 'display', 'none');
    changeUI('removeMedia', 'display', 'none');
    changeUI('uploadVideoButton', 'display', 'none');
    changeUI('uploadPhotoButton', 'display', 'none');
    changeUI('progress', 'display', 'block');


    var fileURL = jQuery('#fileURL').html();
    var fileType = jQuery('#fileType').html();
    var fileName = jQuery('#fileName').html();


    var win = function () {
        
        // post data to TTS server
        var angularScope = angular.element(document.querySelector('#tts-app')).scope();

        angularScope.$apply(function(){
            angularScope.uploadFinished(userID, taskID, messageID);
        });

        weHaveData = false;

    }

    var fail = function (error) {
        uploadError();
    }

    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileName;
    options.mimeType = fileType;
    var params = {};
    options.params = params;
    options.headers = {
        Connection: "Close"
    };

    options.chunkedMode = false;
    var ft = new FileTransfer();


    ft.upload(
        fileURL, 
        encodeURI("http://www.gs0.co/tts/upload.php?userID="+userID+"&taskID="+taskID+"&messageID="+messageID+"&projectID="+projectID), win, fail, options, true);
    
    ft.onprogress = function(progressEvent) {

        if (progressEvent.lengthComputable) {

            var iPercentComplete = Math.round(progressEvent.loaded * 100 / progressEvent.total);

            document.getElementById('progress_percent_text').innerHTML = iPercentComplete.toString() + '%';
            document.getElementById('progress').style.width = (iPercentComplete).toString() + '%';

            if (iPercentComplete == 100){
                document.getElementById('progress_percent_text').innerHTML = "OK"
            }

        } else {
            console.log("progressEvent.loaded 2");
          loadingStatus.increment();
        }
    };
    
}

function uploadError() { // upload error
    document.getElementById('error2').style.display = 'block';
    clearInterval(oTimer);
    displayUploadError();
}  

function uploadAbort() { // upload abort
    document.getElementById('abort').style.display = 'block';
    clearInterval(oTimer);
    displayUploadError();
}

function displayUploadError(){
    console.log("_____________ ERROR")
    // post data to TTS server
    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.uploadErrorHandler();
    })
}