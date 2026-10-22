<?php
namespace Core\Traits;

/*
 * LoginSignup CLASS
 * */
trait My {

    protected function logout() {
        if (empty($_COOKIE['GENUID'])) {
            return ['success' => false, 'error' => 'User not logged in'];
        }
        $logout = $this->db->q("UPDATE {$this->publicdb}.user SET phase=0 WHERE id=?", [$_COOKIE['GENUID']]);
        if ($logout) {
            $this->clearCookies();
            return ['success' => true, 'data'=> []];
        } else {
            return ['success' => false, 'error' => 'Logout failed'];
        }
    }

    protected function getRoles() {
        if (empty($_COOKIE['GENUID'])) {
            return ['success' => false, 'error' => 'User not logged in'];
        }
        $roles = $this->db->f("SELECT usergrp.* FROM {$this->publicdb}.usergrp JOIN user ON user.usergrpid = usergrp.id WHERE user.id = ?", [$_COOKIE['GENUID']]);
        if ($roles) {
            return ['success' => true, 'data' => $roles];
        } else {
            return ['success' => false, 'error' => 'Roles not found'];
        }
    }

    protected function validate($pa) {
        if (filter_var($pa, FILTER_VALIDATE_EMAIL)) {
            $count = $this->db->f("SELECT COUNT(id) FROM {$this->publicdb}.user WHERE email = ?", [$pa]);
            return ['success' => $count == 0];
        }
        return ['success' => false, 'error' => 'Invalid email format'];
    }

    protected function nameNotExist($pa) {
        $count = $this->db->f("SELECT COUNT(id) FROM user WHERE name = ?", [$pa]);
        return ['success' => $count == 0];
    }

    protected function inside() {
        if (!empty($_COOKIE['GENUID'])) {
            $phase = $this->db->f("SELECT phase FROM {$this->publicdb}.user WHERE id=?", [$_COOKIE['GENUID']])['phase'];
            return ['success' => $phase == 2];
        }
        return ['success' => false, 'error' => 'User not logged in'];
    }

    protected function islogged() {
        if (!empty($_COOKIE['sp']) && !empty($_COOKIE['GENUID'])) {
            $user = $this->db->f("SELECT phase, sp FROM {$this->publicdb}.user WHERE id=?", [$_COOKIE['GENUID']]);
            return ['success' => !empty($user) && $user['phase'] != 0 && $user['sp'] == $_COOKIE['sp']];
        }
        return ['success' => false, 'error' => 'User not logged in'];
    }

  protected function login($params) {
      $plainPassword = $params['pass'];  // Plain text from frontend
      $email = $params['email'];

      // First, fetch user by email only (not with password)
      $fetch = $this->db->f("SELECT * FROM {$this->publicdb}.user WHERE email = ?", [$email]);

      if (empty($fetch)) {
          return ['success' => false, 'error' => 'no_account'];
      } elseif (!in_array($fetch['auth'], ['1', '2', '3', '4', '5'])) {
          return ['success' => false, 'error' => 'Authentication Pending'];
      } elseif ($fetch['auth'] != '1') {
          return ['success' => false, 'data' => $fetch];
      } else {
          // Verify the plain text password against the stored hash
          if (!password_verify($plainPassword, $fetch['pass'])) {
              return ['success' => false, 'error' => 'Invalid credentials'];
          }

          $hash = ($fetch['phase'] == 2) ? ($fetch['sp'] != 0 ? $fetch['sp'] : hash("sha256", $fetch['id'] . time())) : hash("sha256", $fetch['id'] . time());
          $fetch['sp'] = $hash;
          $updatePhase = $this->db->q("UPDATE {$this->publicdb}.user SET phase=?, last_login=?, sp=? WHERE id=?", [2, time(), $hash, $fetch['id']]);

          if ($updatePhase) {
              $this->setCookies($fetch['id'], $fetch['grp'], $fetch['name'], $fetch['img'], $fetch['libid'], $fetch['lang'], $hash);
              return ['success' => true, 'data' => $fetch];
          } else {
              return ['success' => false, 'error' => 'Login failed'];
          }
      }
  }

 protected function signup(array $params) {
        // Validate email
        if (!filter_var($params['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'error' => 'Invalid email format'];
        }

        // Check if email exists
        $exists = $this->db->f("SELECT COUNT(id) FROM {$this->publicdb}.user WHERE email = ?", [$params['email']]);
        if ($exists > 0) {
            return ['success' => false, 'error' => 'Email already registered'];
        }

        // Check if username exists
        $existsName = $this->db->f("SELECT COUNT(id) FROM {$this->publicdb}.user WHERE name = ?", [$params['name']]);
        if ($existsName > 0) {
            return ['success' => false, 'error' => 'Username already taken'];
        }

        // Validate password strength (optional)
        if (strlen($params['pass']) < 6) {
            return ['success' => false, 'error' => 'Password must be at least 6 characters'];
        }

        // Hash password
        $hashPass = password_hash($params['pass'], PASSWORD_DEFAULT);

        // Insert user
        $insert = $this->db->q(
            "INSERT INTO {$this->publicdb}.user (fullname, name, auth, email, pass, lang, phase, created, auth)
             VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), 1)",
            [$params['fullname'],$params['name'],'1', $params['email'], $hashPass, $params['lang']]
        );

        if ($insert) {
            $newId = $this->db->lastInsertId();
            // Auto-login after signup
            $hash = hash("sha256", $newId . time());
            $this->db->q("UPDATE {$this->publicdb}.user SET phase=2, sp=? WHERE id=?", [$hash, $newId]);
            $this->setCookies($newId, 1, $params['name'], '', 0, $params['lang'], $hash);
            return ['success' => true, 'data' => ['id' => $newId]];
        }

        return ['success' => false, 'error' => 'Signup failed'];
    }

protected function forgotPass($params) {
    // Validate email
    if (empty($params['email']) || !filter_var($params['email'], FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'error' => 'Valid email is required'];
    }

    // Check if user exists
    $user = $this->db->f("SELECT id, name, email FROM {$this->publicdb}.user WHERE email = ?", [$params['email']]);

    if (!$user) {
        // Return success even if email doesn't exist (security: don't reveal user existence)
        return ['success' => true, 'data' => ['message' => 'If your email is registered, you will receive a reset link']];
    }

    // Generate unique reset token
    $resetToken = bin2hex(random_bytes(32));
    $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Store token in database
    $update = $this->db->q(
        "UPDATE {$this->publicdb}.user SET
            reset_token = ?,
            reset_token_expiry = ?
        WHERE id = ?",
        [$resetToken, $tokenExpiry, $user['id']]
    );

    if (!$update) {
        return ['success' => false, 'error' => 'Failed to process reset request'];
    }

    // Generate reset URL
    $resetUrl = "https://" . DOMAIN . "/reset-password?token=" . $resetToken . "&email=" . urlencode($params['email']);

    // Send email
    $emailSent = $this->sendResetEmail($user['email'], $user['name'], $resetUrl);

    if ($emailSent) {
        return ['success' => true, 'data' => ['message' => 'Password reset link sent to your email']];
    } else {
        return ['success' => false, 'error' => 'Failed to send reset email'];
    }
}


// Send reset password email
private function sendResetEmail($email, $name, $resetUrl) {
    $subject = "Password Reset Request";
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: " . (defined('ADMIN_EMAIL') ? ADMIN_EMAIL : 'noreply@' . DOMAIN) . "\r\n";

    $message = "
    <html>
    <head>
        <title>Password Reset</title>
    </head>
    <body>
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2>Hello " . htmlspecialchars($name) . ",</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the link below to create a new password. This link expires in 1 hour.</p>
            <p style='margin: 30px 0;'>
                <a href='" . $resetUrl . "' style='background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;'>
                    Reset Password
                </a>
            </p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style='font-size: 12px; color: #888;'>This is an automated message, please do not reply.</p>
        </div>
    </body>
    </html>
    ";

    return mail($email, $subject, $message, $headers);
}

// Reset password after token validation
protected function resetPass($params) {
    // Validate required fields
    if (empty($params['token']) || empty($params['email']) || empty($params['new_password'])) {
        return ['success' => false, 'error' => 'Token, email, and new password are required'];
    }

    // Validate password strength
    if (strlen($params['new_password']) < 6) {
        return ['success' => false, 'error' => 'Password must be at least 6 characters'];
    }

    // Find user by email and valid reset token
    $user = $this->db->f(
        "SELECT id, email FROM {$this->publicdb}.user
         WHERE email = ?
         AND reset_token = ?
         AND reset_token_expiry > NOW()",
        [$params['email'], $params['token']]
    );

    if (!$user) {
        return ['success' => false, 'error' => 'Invalid or expired reset token'];
    }

    // Hash new password
    $hashedPassword = password_hash($params['new_password'], PASSWORD_DEFAULT);

    // Update password and clear reset token
    $update = $this->db->q(
        "UPDATE {$this->publicdb}.user SET
            pass = ?,
            reset_token = NULL,
            reset_token_expiry = NULL,
            phase = 1
        WHERE id = ?",
        [$hashedPassword, $user['id']]
    );

    if ($update) {
        // Clear existing sessions
        $this->db->q("UPDATE {$this->publicdb}.user SET sp = NULL WHERE id = ?", [$user['id']]);

        return ['success' => true, 'data' => ['message' => 'Password reset successfully. Please login.']];
    }

    return ['success' => false, 'error' => 'Failed to reset password'];
}

// Validate reset token (for frontend check)
protected function validateResetToken($params) {
    if (empty($params['token']) || empty($params['email'])) {
        return ['success' => false, 'error' => 'Token and email are required'];
    }

    $user = $this->db->f(
        "SELECT id FROM {$this->publicdb}.user
         WHERE email = ?
         AND reset_token = ?
         AND reset_token_expiry > NOW()",
        [$params['email'], $params['token']]
    );

    if ($user) {
        return ['success' => true, 'data' => ['valid' => true]];
    }

    return ['success' => false, 'error' => 'Invalid or expired reset token'];
}

protected function signupGoogle(array $params) {
    // Expected: email, name, lang, picture, access_token, refresh_token, token_expiration, service_id, token_type, scope

    if (!filter_var($params['email'], FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'error' => 'Invalid email format'];
    }

    // Check if user already exists
    $userid = $this->db->f("SELECT id FROM {$this->publicdb}.user WHERE email = ?", [$params['email']]);

    // If not, insert the user (no password)
    if (!$userid) {
        $insertUser = $this->db->q(
            "INSERT INTO {$this->publicdb}.user (name, email, lang, phase, created) VALUES (?, ?, ?, 0, NOW())",
            [$params['name'], $params['email'], $params['lang']]
        );

        if (!$insertUser) {
            return ['success' => false, 'error' => 'Failed to register user'];
        }

        $userid = $this->db->lastInsertId();
    }

    // Check if subscription exists (same user, same service)
    $subExists = $this->db->f("SELECT id FROM {$this->publicdb}.user_subscription WHERE userid = ? AND service_name = 'google'", [$userid]);

    if ($subExists) {
        // Update existing subscription
        $this->db->q("UPDATE {$this->publicdb}.user_subscription SET
            linked_img = ?, access_token = ?, refresh_token = ?, token_type = ?,
            scope = ?, token_expiration = ?, email_verified = 1, service_id = ?, updated_at = NOW()
            WHERE id = ?", [
                $params['picture'], $params['access_token'], $params['refresh_token'],
                $params['token_type'], $params['scope'], $params['token_expiration'],
                $params['service_id'], $subExists
        ]);
    } else {
        // Insert new subscription
        $this->db->q("INSERT INTO {$this->publicdb}.user_subscription (
            userid, linked_img, access_token, refresh_token, token_type,
            scope, token_expiration, email_verified, issue_by,
            issued_at, service_name, service_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, NOW(), 'google', ?)", [
            $userid,
            $params['picture'],
            $params['access_token'],
            $params['refresh_token'],
            $params['token_type'],
            $params['scope'],
            $params['token_expiration'],
            'GoogleOAuth',
            $params['service_id']
        ]);
    }

    return ['success' => true, 'data' => ['id' => $userid]];
}


 private function setCookies($id, $grp, $name, $img, $libid, $lang, $sp) {
        $gcookies = [
            "GENUID" => $id,
            "GENGRP" => $grp,
            "GENNAME" => $name,
            "GENIMG" => $img,
            "GENLIBID" => $libid,
            "LANG" => $lang,
            "sp" => $sp
        ];
        foreach ($gcookies as $cooname => $value) {
            $this->setCookie($cooname, $value);
        }
    }

private function setCookie($name, $value) {
    setcookie($name, $value, [
       'expires' => time() + 86400,
        'httponly' => true,
        'samesite' => 'None',
        'secure' => true,
        'domain' => DOMAIN,
        'path' => '/',
    ]);
}

private function clearCookie($name) {
    setcookie($name, '', [
        'expires' => time() - 3600,
        'httponly' => true,
        'samesite' => 'None',
        'domain' => DOMAIN,
        'secure' => true,
        'path' => '/',
        'domain' => $domain,
    ]);
}

    private function clearCookies(){
        $gcookies = [
            "GENUID",
            "GENGRP",
            "GENNAME",
            "GENIMG",
            "GSLIBID",
            "LANG",
            "sp"
        ];
        foreach ($gcookies as $cooname) {
            $this->clearCookie($cooname);
        }
    }


}
