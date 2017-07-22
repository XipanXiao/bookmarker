<?php
function get_user_id($medoo, $google_id, $create_new = false) {
  global $medoo;
  
  $data = ["google_id" => $google_id];
  $user_id = $medoo->get("users", "id", ["google_id" => $google_id]);
  if ($user_id || !$create_new) return $user_id;
  
  return $medoo->insert("users", $data);
}
?>
