<?php
include_once 'connection.php';
include_once 'google-api-client/vendor/autoload.php';

$response = null;
$medoo = get_medoo();

function get_user_id($google_id, $create_new = false) {
  global $medoo;
  
  $data = ["google_id" => $google_id];
  $user_id = $medoo->get("users", "id", ["google_id" => $google_id]);
  if ($user_id || !$create_new) return $user_id;
  
  return $medoo->insert("users", $data);
}

/// Authenticates the client POST id_token, returns the internal user id.
function authenticate($id_token) {
  $CLIENT_ID =
      "513369351296-c0k8jf39t1kvrhfrj9i49ht11ndfu213.apps.googleusercontent.com";	
  $client = new Google_Client(['client_id' => $CLIENT_ID]);
  $payload = $client->verifyIdToken($id_token);
  if ($payload) {
    $google_id = $_SESSION["google_id"] = $payload['sub'];
    return $_SESSION["user_id"] = get_user_id($google_id, true);
  } else {
  	return null;
  }
}

if ($_SERVER ["REQUEST_METHOD"] == "POST") {
	$user_id = authenticate($_POST["id_token"]);
	$response = ["user_id" => $_SESSION["google_id"]];
	echo json_encode($response);
}
?>
