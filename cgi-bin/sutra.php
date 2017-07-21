<?php
include_once 'connection.php';

$response = null;
$medoo = get_medoo();

function get_db_error() {
  global $medoo;

  $errors = $medoo->error();
  return empty($errors) ? '' : $errors[2];
}

function get_sutra_list($source) {
  global $medoo;
  
  return $medoo->select("sutra", "*", ["source" => $source]);
}

function keyed_by_id($results, $id_field = "id") {
  $data = [];
  foreach ($results as $result) {
    $id = $result[$id_field] = intval($result[$id_field]);
    $data[$id] = $result;
  }
  return $data;
}

function get_progress($user_id) {
  global $medoo;
  
  return keyed_by_id($medoo->select("progress", "*", ["user_id" => $user_id]),
      "book_id");
}

function update_progress($user_id, $book_id, $finished) {
  global $medoo;
  
  $data = ["book_id" => $book_id, "user_id" => $user_id];
  $medoo->delete("progress", ["AND" => $data]);
  if (!intval($finished)) return 1;

  return $medoo->insert("progress", array_merge($data, 
      ["finished" => $finished]));
}

function get_sutra_sources() {
  global $medoo;

  return keyed_by_id($medoo->select("sutra_sources", "*"));
}

if ($_SERVER ["REQUEST_METHOD"] == "GET") {
  $res_id = $_GET["rid"];
  if ($res_id == "sutra") {
    $response = get_sutra_list($_GET["source"]);
  } elseif ($res_id == "progress") {
    $response = get_progress($_GET["user_id"]);
  } elseif ($res_id == "sources") {
    $response = get_sutra_sources();
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST") {
  $res_id = $_POST["rid"];
  if ($res_id == "progress") {
    $user_id = $_POST["user_id"];
    $book_id = $_POST["book_id"];
    $finished = $_POST["finished"];
    $response = 
        ["updated" => intval(update_progress($user_id, $book_id, $finished))];
  }
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
    $response["error"] = get_db_error();
  }

  echo json_encode($response);
}
?>
