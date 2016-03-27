<?php

echo "v21";
$userID = $_GET['userID'];
$taskID = $_GET['taskID'];
$messageID = $_GET['messageID'];
$projectID = $_GET['projectID'];
$device = $_GET['device'];
$data_URI = $_GET['data_URI'];

$mediaID = "TTS-".$userID."_".$taskID."_".$messageID;

echo "FILES = " . $_FILES["file"];

function bytesToSize1024($bytes, $precision = 2) {
    $unit = array('B','KB','MB');
    return @round($bytes / pow(1024, ($i = floor(log($bytes, 1024)))), $precision).' '.$unit[$i];
}

// Set local PHP vars from the POST vars sent from our form using the array
// of data that the $_FILES global variable contains for this uploaded file
$fileName = $_FILES["file"]["name"]; // The file name
$fileTmpLoc = $_FILES["file"]["tmp_name"]; // File in the PHP tmp folder
$fileType = $_FILES["file"]["type"]; // The type of file it is
$fileSize = $_FILES["file"]["size"]; // File size in bytes
$fileErrorMsg = $_FILES["file"]["error"]; // 0 for false... and 1 for true

$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

echo "</br> mediaID: " . $mediaID;
echo "</br> fileExtension: " . $fileExtension;

// Specific Error Handling if you need to run error checking
if (!$fileTmpLoc) { // if file not chosen
    echo "ERROR: Please browse for a file before clicking the upload button.";
    errorLog('No file in transfer');
    //exit();
}
// Place it into your "uploads" folder mow using the move_uploaded_file() function
move_uploaded_file($fileTmpLoc, "media/$fileName");

if ($fileExtension == "MOV"){$fileExtension = "mov";};
if ($fileExtension == "MP4"){$fileExtension = "mp4";};
if ($fileExtension == "OGG"){$fileExtension = "ogg";};
if ($fileExtension == "WEBM"){$fileExtension = "webm";};
if ($fileExtension == "jpeg"){$fileExtension = "jpg";};

rename("media/$fileName", "media/".$mediaID.".".$fileExtension);

// Check to make sure the uploaded file is in place where you want it
if (!file_exists("media/$mediaID.$fileExtension")) {

    echo "error";
    errorLog('File does not exist in media');

    //exit();

} else {

    echo "</br> File Exists";

    /////////////////////////////// FFMPEG

    if (($fileExtension == "ogg") || ($fileExtension == "webm") || ($fileExtension == "mov") || ($fileExtension == "mp4") || ($fileExtension == "3gp")){

        //thumb creation

        include ("ffmpeg/ffmpeg.class.php");
        $ffmpegultimate = new FfmpegUltimate ();

        $input = "media/" . $mediaID . "." . $fileExtension;
        $time  = "1";
        $dimension = "480*360";
        $outputFolder = "media/thumbs/";
        $outputFile = $mediaID . ".jpg";
        //$outputFile2 = $vidID.".jpg";

        $output = $ffmpegultimate->previewThumb ($input, $outputFolder, $outputFile, $time, $dimension);
        //$output2 = $ffmpegultimate->previewThumb ($input, $outputFolder, $outputFile2, $time, $dimension);

        echo '</br> checking file ' . $outputFolder.$outputFile;

        if (file_exists($outputFolder.$outputFile)) {
            
            echo "</br> Video convert success";

            $link = mysql_connect("localhost", "root", "moosheensql")  or die ('Error in connection: ' . mysql_error());;

            mysql_select_db("TTS", $link);

            $query = "INSERT INTO media (ID,
                mediaId,
                mediaType,
                userId,
                projectId,
                taskId,
                messageId,
                converted) 
                VALUES(
                'NULL',
                '" . $mediaID . "',
                '" . $fileExtension . "',
                '" . $userID . "',
                '" . $projectID . "',
                '" . $taskID . "',
                '" . $messageID . "',
                'false')";

                echo "adding to DB -".$mediaID.", ".$fileExtension.", _".$messageID.", ".$taskID;

            mysql_query($query, $link) or die ('Error: Updating Database' . mysql_error());

            mysql_close($link);

            include ("convert.php");
            
        } else {
            
            echo "</br>Video convert error";
            errorLog('Video convert error');

        }

    } else if (($fileExtension == "jpg") || ($fileExtension == "jpeg") || ($fileExtension == "gif") || ($fileExtension == "png")){

        include ("ffmpeg/ffmpeg.class.php");
        $ffmpegultimate = new FfmpegUltimate ();

        $input = "media/" . $mediaID . "." . $fileExtension;
        $output = "media/thumbs/" . $mediaID . "." . $fileExtension;
        exec ( "ffmpeg -i $input -vf scale=250:-1 $output" );

        if (file_exists($output)) {
            
            echo "</br> Image convert success";

            echo '</br> Update database 2';

            $link = mysql_connect("localhost", "root", "moosheensql")  or die ('Error in connection: ' . mysql_error());;

            mysql_select_db("TTS", $link);

            $query = "INSERT INTO media (ID,
                mediaId,
                mediaType,
                userId,
                projectId,
                taskId,
                messageId,
                converted,
                error) 
                VALUES(
                'NULL',
                '" . $mediaID . "',
                '" . $fileExtension . "',
                '" . $userID . "',
                '" . $projectID . "',
                '" . $taskID . "',
                '" . $messageID . "',
                'false',
                '')";

            mysql_query($query, $link) or die ('Error: Updating Database' . mysql_error());

            mysql_close($link);
            
        } else {
            
            echo "</br>Image convert error";
            errorLog('Image convert error');
        }

    }

}

function errorLog($errorString){
    $link = mysql_connect("localhost", "root", "moosheensql")  or die ('Error in connection: ' . mysql_error());;

            mysql_select_db("TTS", $link);

            $query = "INSERT INTO media (ID,
                mediaId,
                mediaType,
                userId,
                projectId,
                taskId,
                messageId,
                converted,
                error) 
                VALUES(
                'NULL',
                '" . $mediaID . "',
                '" . $fileExtension . "',
                '" . $userID . "',
                '" . $projectID . "',
                '" . $taskID . "',
                '" . $messageID . "',
                'false',
                '". $errorString . $data_URI ."')";

            mysql_query($query, $link) or die ('Error: Updating Database' . mysql_error());

            mysql_close($link);
}

?>



