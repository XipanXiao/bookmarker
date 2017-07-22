<?php
include_once 'connection.php';
include_once 'users.php';

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

  $user_id = get_user_id($medoo, $user_id);
  if (!$user_id) return [];

  return $medoo->select("progress", "*", ["user_id" => $user_id]);
}

function update_progress($user_id, $book_id, $finished) {
  global $medoo;
  
  $user_id = get_user_id($medoo, $user_id, true);
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

function get_recents($user_id) {
  global $medoo;

  $user_id = get_user_id($medoo, $user_id);
  if (!$user_id) return [];

  return $medoo->select("recents", "*",
      ["user_id" => $user_id, "ORDER" => "ts"]);
}

function update_recents($user_id, $book_id, $source) {
  global $medoo;

  $user_id = get_user_id($medoo, $user_id, true);
  $sql = sprintf("INSERT INTO recents
  		(user_id, sequence, sub_index, book_id, source)
   select
      %d,
      (coalesce(max(sequence), -1) + 1),
  		(coalesce(max(sequence), -1) + 1) mod 20,
      %d,
  		%d
   from recents
      where user_id = %d
      on duplicate key update
  		   sequence = values(sequence), 
         book_id = %d", $user_id, $book_id, $source, $user_id, $book_id);
  return $medoo->query($sql);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET") {
  $res_id = $_GET["rid"];
  if ($res_id == "sutra") {
    $response = get_sutra_list($_GET["source"]);
  } elseif ($res_id == "progress") {
    $response = get_progress($_GET["user_id"]);
  } elseif ($res_id == "sources") {
    $response = get_sutra_sources();
  } elseif ($res_id == "recents") {
    $response = get_recents($_GET["user_id"]);
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST") {
  $res_id = $_POST["rid"];
  if ($res_id == "progress") {
    $user_id = $_POST["user_id"];
    $book_id = $_POST["book_id"];
    $finished = $_POST["finished"];
    $response = ["updated" => 
        intval(update_progress($user_id, $book_id, $finished))];
  } elseif ($res_id == "recents") {
    $user_id = filter_input(INPUT_POST, "user_id",
        FILTER_VALIDATE_REGEXP,
        ["options" => ["regexp" => "/\b[\d]{21}\b/"]]);
    $response = ["updated" => 
        intval(update_recents($user_id, intval($_POST["book_id"]),
        		intval($_POST["source"])))];
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
