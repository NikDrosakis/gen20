// N.js
const mariadb = require('mariadb');
require('dotenv').config();
const ROOT = process.env.ROOT || path.resolve(__dirname);


const pool = mariadb.createPool({
	host: '127.0.0.1',
	user: ROOT.mariauser,
	password: ROOT.mariapass,
	database: ROOT.maria,
	waitForConnections: true,
	connectionLimit: 5,
	queueLimit: 1,
	multipleStatements: true,
	supportBigNumbers: true,
	bigNumberStrings: true
});

async function getCounters() {
	let conn;
	try {
		conn = await pool.getConnection();
		const sql ="SELECT count(id) as c_active_libraries FROM vl_lib WHERE status=2;" +
				"SELECT count(id) as c_total_books FROM vl_book;" +
			"SELECT count(id) as c_en_titles FROM vl_book WHERE lang='en';" +
				"SELECT count(id) as c_el_titles FROM vl_book WHERE lang='el';" +
			"SELECT count(id) as c_publishers FROM vl_publisher;" +
			"SELECT count(id) as c_writers FROM vl_writer";

		results = await conn.query(sql);
		const counters = {
			c_active_libraries: results[0][0].c_active_libraries,
			c_total_books: results[1][0].c_total_books,
			c_en_titles: results[2][0].c_en_titles,
			c_el_titles: results[3][0].c_el_titles,
			c_publishers: results[4][0].c_publishers,
			c_writers: results[5][0].c_writers
		};

		return counters;
	} catch (err) {
		throw err;
	} finally {
		if (conn) conn.end();
	}
}

module.exports = { getCounters };
