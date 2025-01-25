<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'nomadpoetrycom' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'n130177!' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '3C=[/Rap~oYh)ixYP?4Or^v+};.X{8n^NQ=eXI&[*~C+` 5hl[~#!/9pdnnoN8t}' );
define( 'SECURE_AUTH_KEY',  'K?y=j5MzGnq*yc^(?U^B%DipFJeq~__f:e2eqWSn3sE}00#e:Ox}o(S,?u~~x)0T' );
define( 'LOGGED_IN_KEY',    '|ztIpbwE~w Y3Zh2pW0&1fr$>89Zm6&8luJN@33/N,P5*=%#MF~l[lS0;QwH6H{k' );
define( 'NONCE_KEY',        'JN%Rn%fgU}mb*:m[=naHv6$VT$?}ZH.iF},E~;3wRoPw+)$;4b($,KaQ@8mBhQ$Q' );
define( 'AUTH_SALT',        '6BBds(LT`Y]O(; ~OtY}=xi>Q<lCy~{r|,B#ATNwAVju1dpCLS}DWijsQ4Lj^Kr^' );
define( 'SECURE_AUTH_SALT', '<{NafV+t)iQtBe9>I_gm0{3K3;xF:^E:Wv7cNSdEF#sSEj|(~N[[uX>qg18N^JvF' );
define( 'LOGGED_IN_SALT',   '1MM,%y,nMP%F,=x}/!Zx`*s~s;M#SIc*UZk[)5+v~v>@<XZP)Y^}zjbZ#ubbPpt%' );
define( 'NONCE_SALT',       'yGv&j)DKlp<%}FJ=vBf/wP;iZ|MpwTH~[WQA5;.CW. =2Gyt!>l.-9P><WCN3J8O' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
