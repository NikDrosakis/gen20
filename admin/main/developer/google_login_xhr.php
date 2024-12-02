<?php
if($a=='save-token'){
// Get the raw POST data
//$rawPostData = file_get_contents('php://input');

// Decode the JSON data
//$post = json_decode($rawPostData, true);
$post=$_POST;

// Check for decoding errors
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Process the data
    $email = $post['email'] ?? null;
    $name = $post['given_name'] ?? null;
    $fullname = $post['name'] ?? null;
    $img =   $post['picture'] ?? false;
    // check if user exist else insert user
    $user_exist=$this->db->f("SELECT id FROM user where email=? and name=?",[$email,$name]);
    if(empty($user_exist)){
    $uid=$this->db->inse("user",["email"=>$mail,"name"=>$name,"fullname"=>$fullname,"img"=>$img]);
    }else{
    $uid=$user_exist['id'];
    }
    unset($_POST['name']);
    unset($_POST['email']);
    $_POST['uid']=$uid;
    // save token to user_subscription
     if($uid){
    $array=[
    'service_name' => "google",
    'service_id' => $post['sub'] ?? null,
    'access_token' => $post['credential'] ?? null,
    'refresh_token' => $post['refresh_token'] ?? null,
    'linked_img' => $post['picture'] ?? null,
    'token_expiration' => $post['exp'] ?? null,
    'uid' => $uid
    ];
    $insert_subscription= $this->db->inse("user_subscription",$array);
    }

    // Return a success response
    echo json_encode(['success' => true, 'message' => "Token saved successfully to user $uid with subscription id $insert_subscription"]);
}