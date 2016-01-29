<?php 

header('content-type: application/json; charset=utf-8');
header("access-control-allow-origin: *");

$mediaID = $_GET['mediaID'];
$fileExtension = $_GET['format'];

//$callbackScript = "http://www.go-sho.com/convert/callback.php?videoID=DEF_456&wait=false&inputformat=mp4&outputformat=webm&file=/convert/video.mp4";

$callbackScript = "";
$inFormat = $fileExtension;

$outFormat = "mp4";
$preset = "BQ5qiPekAf";

//$ftpServer = "ftp.tts-app.com";
//$ftpUser = "goshoFTP-tts";

$ftpServer = "ftp.gs0.co";
$ftpUser = "goshoFTP-gs0";
$ftpPass = "G05h0-ftp";

$mediafolder = "tts/media";

$inputVideo = $mediaID.".".$fileExtension;

$outputVideo = $mediaID.".".$outFormat;
$timeout = "600";

$convertURL = "https://api.cloudconvert.com/convert?apikey=Zw_Nd5zvl4HivhI6fQ0ErdMYQ0c1BCWk161ti5qer32XHlRMDGXWmyTUkN75hSburI7E3hg2xMiIFqMm5M4ibw&input[ftp][host]=".$ftpServer."&input[ftp][port]=21&input[ftp][user]=".$ftpUser."&input[ftp][password]=".$ftpPass."&timeout=".$timeout."&output[ftp][host]=".$ftpServer."&output[ftp][port]=21&output[ftp][user]=".$ftpUser."&output[ftp][password]=".$ftpPass."&output[ftp][path]=/".$mediafolder."/".$outputVideo."&callback=".$callbackScript."&download=false&inputformat=".$inFormat."&outputformat=".$outFormat."&file=/".$mediafolder."/".$inputVideo."&xpreset=".$preset;
echo $convertURL;
print file_get_contents($convertURL);

?>