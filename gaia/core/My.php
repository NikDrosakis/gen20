<?php
namespace Core;

/*
 * LoginSignup CLASS
 * */
trait My {

    protected function logout() {
        if (empty($_COOKIE['GSID'])) {
            return ['success' => false, 'error' => 'User not logged in'];
        }
        $logout = $this->db->q("UPDATE user SET phase=0 WHERE id=?", [$_COOKIE['GSID']]);
        if ($logout) {
            $this->clearCookies();
            return ['success' => true];
        } else {
            return ['success' => false, 'error' => 'Logout failed'];
        }
    }

    protected function getRoles() {
        if (empty($_COOKIE['GSID'])) {
            return ['success' => false, 'error' => 'User not logged in'];
        }
        $roles = $this->db->f("SELECT usergrp.* FROM usergrp JOIN user ON user.usergrpid = usergrp.id WHERE user.id = ?", [$_COOKIE['GSID']]);
        if ($roles) {
            return ['success' => true, 'data' => $roles];
        } else {
            return ['success' => false, 'error' => 'Roles not found'];
        }
    }

    protected function validate($pa) {
        if (filter_var($pa, FILTER_VALIDATE_EMAIL)) {
            $count = $this->db->f("SELECT COUNT(id) FROM user WHERE email = ?", [$pa]);
            return ['success' => $count == 0];
        }
        return ['success' => false, 'error' => 'Invalid email format'];
    }

    protected function nameNotExist($pa) {
        $count = $this->db->f("SELECT COUNT(id) FROM user WHERE name = ?", [$pa]);
        return ['success' => $count == 0];
    }

    protected function inside() {
        if (!empty($_COOKIE['GSID'])) {
            $phase = $this->db->f("SELECT phase FROM {$this->publicdb}.user WHERE id=?", [$_COOKIE['GSID']])['phase'];
            return ['success' => $phase == 2];
        }
        return ['success' => false, 'error' => 'User not logged in'];
    }

    protected function islogged() {
        if (!empty($_COOKIE['sp']) && !empty($_COOKIE['GSID'])) {
            $user = $this->db->f("SELECT phase, sp FROM {$this->publicdb}.user WHERE id=?", [$_COOKIE['GSID']]);
            return ['success' => !empty($user) && $user['phase'] != 0 && $user['sp'] == $_COOKIE['sp']];
        }
        return ['success' => false, 'error' => 'User not logged in'];
    }

    protected function login($params) {
        $pass = $params['pass'];
        $email = $params['email'];

       $fetch = $this->db->f("SELECT * FROM {$this->publicdb}.user WHERE email = ?", [$email]);

        if (empty($fetch)) {
            return ['success' => false, 'error' => 'no_account'];
        } elseif (!in_array($fetch['auth'], ['1', '2', '3', '4', '5'])) {
            return ['success' => false, 'error' => 'Authentication Pending'];
        } elseif ($fetch['auth'] != '1') {
            return ['success' => false, 'data' => $fetch];
        } else {
            if (!password_verify($pass, $fetch['pass'])) {
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

 private function setCookies($id, $grp, $name, $img, $libid, $lang, $sp) {
        $gcookies = [
            "GSID" => $id,
            "GSGRP" => $grp,
            "GSNAME" => $name,
            "GSIMG" => $img,
            "GSLIBID" => $libid,
            "LANG" => $lang,
            "sp" => $sp
        ];
        foreach ($gcookies as $cooname => $value) {
            $this->setCookie($cooname, $value);
        }
    }

    private function setCookie($name, $value) {
        setcookie($name, $value, [
            'httponly' => true,
            'samesite' => 'Lax', // Or 'Strict' if you want more security
            'secure' => true, // Set to true if you're using HTTPS
            'path' => '/',
        ]);
    }

    private function clearCookies(){
        $gcookies = [
            "GSID",
            "GSGRP",
            "GSNAME",
            "GSIMG",
            "GSLIBID",
            "LANG",
            "sp"
        ];
        foreach ($gcookies as $cooname) {
            $this->clearCookie($cooname);
        }
    }

    private function clearCookie($name) {
        setcookie($name, '', [
            'expires' => time() - 3600,
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => true,
            'path' => '/',
        ]);
    }

}
