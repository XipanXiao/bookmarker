<?php
include_once 'config.php';

$ch = null;
try {
  $ch = curl_init();

  if (FALSE === $ch) {
    exit();
  }

  $proxy = "/cgi-bin/proxy.php/";
  $index = strpos($_SERVER[REQUEST_URI], $proxy);
  $url = substr($_SERVER[REQUEST_URI], $index + strlen($proxy));
  
  if (empty($url)) {
    curl_close($ch);
    exit();
  }

  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_HEADER, 1);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 60);

  if ($_SERVER ["REQUEST_METHOD"] == "POST") {
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($_POST));
  }

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

  preg_match("/<meta .*\bcharset=\"([\w-]+)\"/i", $body, $encoding);
  
  if (empty($encoding)) {
    preg_match("/<meta .*\bcontent=\".*\bcharset=([\w-]+)\"/i", 
        $body, $encoding);
  } 
  if (!empty($encoding)) {
    header("Content-Type:text/html;charset=". $encoding[1]);
  } elseif (!empty($header)) {
    preg_match("/(Content-Type:\b.*\b)/i", $header, $contentType);
    if (empty($contentType)) {
      preg_match("/(Content-Type: \b.*\b)/i", $header, $contentType);
    }
    if (!empty($contentType)) {
      header($contentType[1]);
    }
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
