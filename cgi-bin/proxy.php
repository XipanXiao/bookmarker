<?php
include_once 'config.php';

$ch = null;
try {
	$ch = curl_init();

  if (FALSE === $ch) {
  	exit();
  }

  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_HEADER, 1);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 60);
  
  // All cookies with name like 'PROXY_xx' are from the proxied server.
  $proxy_prefix = "PROXY_";
    
  $cookie_str = "";
  foreach ($_COOKIE as $key => $value) {
  	if (strpos($key, $proxy_prefix) !== 0) continue;
    $cookie_str =
        $cookie_str . substr($key, strlen($proxy_prefix)) . "=" . $value . ";";
  }

  curl_setopt($ch, CURLOPT_COOKIE, $cookie_str);

  $url = null;
  if ($_SERVER ["REQUEST_METHOD"] == "GET") {
    $url = $_GET['url'];
  } else if ($_SERVER ["REQUEST_METHOD"] == "POST") {
  	$url = $_POST['url'];
    curl_setopt($ch, CURLOPT_POST, 1);
  	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($_POST));
  }

  if (!$url) {
  	curl_close($ch);
  	exit();
  }

  $url = urldecode($url);
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
  curl_setopt($ch, CURLOPT_ENCODING ,"");

  session_write_close();
  $response = curl_exec($ch);
  session_start();

  // Parse header to get cookies.
  $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
  curl_close($ch);
  $ch = null;

  $header = substr($response, 0, $header_size);
  $body = substr($response, $header_size);

  preg_match( "/<meta .*charset=\"(.+?)\"/i", $body, $encoding);
  
  if (!empty($encoding)) {
    header("Content-Type:text/html;charset=". $encoding[1]);
  }
  echo $body;
} catch(Exception $e) {
  if ($ch) {
    curl_close($ch);
  }

  echo sprintf("Curl failed with error #%d: %s",
      $e->getCode(), $e->getMessage());
}
?>
