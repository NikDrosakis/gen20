<?php
namespace Core;

/*
 * LoginSignup CLASS
 * */
trait My {

protected function logout() {
        $logout = $this->db->q("UPDATE user SET phase=0 WHERE id=?", [$_COOKIE['GSID']]);
        return $logout ? true : false;
    }


    protected function validate($pa) {
        if (filter_var($pa, FILTER_VALIDATE_EMAIL)) {
            $mailExist = $this->db->count_("id", "user", " WHERE email='$pa'");
            return $mailExist == 0;
        }
        return false;
    }

    protected function nameNotExist($pa) {
        $nameExist = $this->db->count_("id", "user", " WHERE name='$pa'");
        return $nameExist == 0;
    }

protected function inside() {
        if (!empty($_COOKIE['GSID'])) {
            $phase = $this->db->f("SELECT phase FROM {$this->publicdb}.user WHERE id=?", [$_COOKIE['GSID']])['phase'];
            return $phase == 2;
        }
        return false;
    }

    protected function islogged() {
        if (!empty($_COOKIE['sp']) && !empty($_COOKIE['GSID'])) {
            $user = $this->db->f("SELECT phase, sp FROM {$this->publicdb}.user WHERE id=?", [$_COOKIE['GSID']]);
            return !empty($user) && $user['phase'] != 0 && $user['sp'] == $_COOKIE['sp'];
        }
        return false;
    }

    protected function login($params) {
        $pass=$params['pass'];$email=$params['email'];
        $fetch = $this->db->f("SELECT * FROM {$this->publicdb}.user WHERE email=? AND pass=?", [$email, $pass]);

        if (empty($fetch)) {
            return 'no_account';
        } elseif (!in_array($fetch['auth'], ['1', '2', '3', '4', '5'])) {
            return 'Authentication Pending';
        } elseif ($fetch['auth'] != '1') {
            return $fetch;
        } else {
            $hash = ($fetch['phase'] == 2) ? ($fetch['sp'] != 0 ? $fetch['sp'] : hash("sha256", $fetch['id'] . time())) : hash("sha256", $fetch['id'] . time());
            $fetch['sp'] = $hash;
            $updatePhase = $this->db->q("UPDATE {$this->publicdb}.user SET phase=?, last_login=? WHERE id=?", [2, time(), $fetch['id']]);

              $gcookies = [
                                    "GSID" => 'id',
                                    "GSGRP"=> 'grp',
                                    "GSNAME"=> 'name',
                                    "GSIMG"=> 'img',
                                    "GSLIBID"=> 'libid',
                                    "LANG"=> 'lang',
                                    "sp"=> 'sp'
                           ];
            foreach ($gcookies as $cooname => $dbcol) {
                coo($cooname,$fetch[$dbcol]);
            }

            return $updatePhase ? $fetch : "mistake";
        }
    }

}