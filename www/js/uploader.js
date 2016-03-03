// common variables
var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 1048576 * 200;//1048576; // 1MB
var oTimer = 0;
var sResultFileSize = '';
var weHaveData = false;

var userID;
var taskID;
var messageID;
var projectID;

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


function secondsToTime(secs) { // we will use this function to convert seconds in normal time format
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr < 10) {hr = "0" + hr; }
    if (min < 10) {min = "0" + min;}
    if (sec < 10) {sec = "0" + sec;}
    if (hr) {hr = "00";}
    return hr + ':' + min + ':' + sec;
};

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};


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
    navigator.notification.alert('No media added: ' + error.code, null);
};

var fileURL = "";
var fileTypevar = "";
var fileName = ""

///////////////////////////////////////////////////////////////

function displayFileSelectedUI(file){
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

    weHaveData = true;

    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.fileSelected(file);
    })

}

/////////////////////////////////////////////////////////////////////////

function fileSelected_iOS() {

    var oFile = document.getElementById('image_file').files[0];
    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
    var vFilter = /^(video\/mp4|video\/mov|video\/wm4|video\/quicktime|video\/wmv)$/i;
    if (! rFilter.test(oFile.type)) {
        document.getElementById('error').style.display = 'block';
        if (vFilter.test(oFile.type)) {
            document.getElementById('error').style.display = 'none';
        }
    }
    // get preview element
    var oImage = document.getElementById('preview');
    // prepare HTML5 FileReader
    var oReader = new FileReader();
        oReader.onload = function(e){
        // e.target.result contains the DataURL which we will use as a source of the image

        if (vFilter.test(oFile.type)) {
            oImage.src = "images/videoIcon.jpg";
        } else {
            oImage.src = e.target.result;
        }
    };
    // read selected file as DataURL
    oReader.readAsDataURL(oFile);
    displayFileSelectedUI(oFile.type);

}

captureSuccess = function(mediaFiles) {

    jQuery("#debug").html(mediaFiles);

    jQuery('#fileURL').html(mediaFiles[0].fullPath);
    jQuery('#fileType').html(mediaFiles[0].type);
    jQuery('#fileName').html(mediaFiles[0].name);

    if (mediaFiles[0].type == "image/jpeg"){
        jQuery('#preview').attr("src", mediaFiles[0].fullPath);
    } else {
        jQuery('#preview').attr("src", "images/videoIcon.jpg");
    }

    displayFileSelectedUI(mediaFiles[0].type);
        
};

function startUploading(u, t, m, p) {

    userID = u;
    taskID = t;
    messageID = m;
    projectID = p;

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

    if(device == "Android"){


            var win = function () {
                
                uploadComplete()

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
                encodeURI("http://www.gs0.co/tts/upload.php?userID="+userID+"&taskID="+taskID+"&messageID="+messageID+"&projectID="+projectID+"&device="+device), win, fail, options, true);
            
            ft.onprogress = function(progressEvent) {

                if (progressEvent.lengthComputable) {

                    var iPercentComplete = Math.round(progressEvent.loaded * 100 / progressEvent.total);

                    document.getElementById('progress_percent_text').innerHTML = iPercentComplete.toString() + '%';
                    document.getElementById('progress').style.width = (iPercentComplete).toString() + '%';

                    if (iPercentComplete == 100){
                        document.getElementById('progress_percent_text').innerHTML = "OK"
                    }

                } else {
                  loadingStatus.increment();
                }
            };
    

    } 

    if (device == "iOS"){

            var oProgress = document.getElementById('progress');
            oProgress.style.display = 'block';
            oProgress.style.width = '0px';

            // get form data for POSTing
            //var vFD = document.getElementById('upload_form').getFormData(); // for FF3
            var vFD = new FormData(document.getElementById('upload_form')); 

            // create XMLHttpRequest object, adding few event listeners, and POSTing our data
            var oXHR = new XMLHttpRequest();        
            oXHR.upload.addEventListener('progress', uploadProgress, false);
            oXHR.addEventListener('load', uploadComplete, false);
            oXHR.addEventListener('error', uploadError, false);
            oXHR.addEventListener('abort', uploadAbort, false);
            oXHR.open('POST', "http://www.gs0.co/tts/upload.php?userID="+userID+"&taskID="+taskID+"&messageID="+messageID+"&projectID="+projectID+"&device="+device);
            oXHR.send(vFD);

            // set inner timer
            oTimer = setInterval(doInnerUpdates, 300);
    }
}

function uploadComplete(){
    // post data to TTS server
    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.uploadFinished(userID, taskID, messageID);
    });

    weHaveData = false;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function doInnerUpdates() { // we will use this function to display upload speed
    var iCB = iBytesUploaded;
    var iDiff = iCB - iPreviousBytesLoaded;

    // if nothing new loaded - exit
    if (iDiff == 0)
        return;

    iPreviousBytesLoaded = iCB;
    iDiff = iDiff * 2;
    var iBytesRem = iBytesTotal - iPreviousBytesLoaded;
    var secondsRemaining = iBytesRem / iDiff;

    // update speed info
    var iSpeed = iDiff.toString() + 'B/s';
    if (iDiff > 1024 * 1024) {
        iSpeed = (Math.round(iDiff * 100/(1024*1024))/100).toString() + 'MB/s';
    } else if (iDiff > 1024) {
        iSpeed =  (Math.round(iDiff * 100/1024)/100).toString() + 'KB/s';
    }

    document.getElementById('speed').innerHTML = iSpeed;
    document.getElementById('remaining').innerHTML = '| ' + secondsToTime(secondsRemaining);        
}

function uploadProgress(e) { // upload process in progress
    if (e.lengthComputable) {
        iBytesUploaded = e.loaded;
        iBytesTotal = e.total;
        var iPercentComplete = Math.round(e.loaded * 100 / e.total);
        var iBytesTransfered = bytesToSize(iBytesUploaded);


        document.getElementById('progress_percent_text').innerHTML = iPercentComplete.toString() + '%';
        document.getElementById('progress').style.width = (iPercentComplete).toString() + '%';
        //document.getElementById('progress_percent').style.left = (iPercentComplete).toString() + '%';

        if (iPercentComplete == 100){
            document.getElementById('progress_percent_text').innerHTML = "OK"

        }
        
    } else {
        displayUploadError();
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    // post data to TTS server
    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.uploadErrorHandler();
    })
}