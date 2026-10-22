const mariadb = require('mariadb');
/*

- POST
UPLOAD_IMAGE: `${BASE_URL}/upload/${col}`,
EDIT: `${BASE_URL}/edit/[table]`,
SIGNUP: `${BASE_URL}/signup`,
NEWBOOK: `${BASE_URL}/newbook`,
LOOKUPSAVE: (type) => `${BASE_URL}/lookupsave/${type}`,
- GET
GET_BY_ID: (table,id) => `${BASE_URL}/${table}/${bookId}`,
LOGIN: `${BASE_URL}/login`,
c_book_libuser: `${BASE_URL}/c_book_libuser`,
LOOKUP: (type) => `${BASE_URL}/lookup/${type}`,
GET_BOOKS_BY_LIB: (libid) => `${BASE_URL}/lib/${libid}`,
* */
module.exports = function(params){
	let action = params.type;
    var options={};
	let sql, pms = [];
console.log(params.type);
//GET
	if(params.type=='lookup') {
		sql = `SELECT name, id FROM ${params.col} WHERE name LIKE ? ORDER BY name`;
		pms = [`%${params.query.q}%`];
	}else if(params.type=='user'){
		sql = `SELECT *,COALESCE(CONCAT('https://vivalibro.com/media/', img), 'https://vivalibro.com/img/empty.png') as uri FROM user WHERE id=? `;
		pms=[params.col];
	}else if(params.type=='store'){
		var q=params.query.q;
		var pagin=10, start=(parseInt(params.query.page) - 1) * pagin;
		var limit=`LIMIT ${start},${pagin}`;
		sql = q ? `SELECT * FROM dataset WHERE ${params.col} LIKE ? ${limit}`: `SELECT * FROM dataset WHERE ${params.col} ${limit}`;
		pms = q ? [`%${q}%`]:[];
	}else if(params.type=='c_book'){
		sql = "SELECT c_book.*,c_book_writer.id as writerId,c_book_publisher.id as publisherId,c_book.id as bookId,c_book_writer.name as writername,c_book_cat.name as catname,c_book_publisher.name as publishername FROM c_book " +
			"LEFT JOIN c_book_writer on c_book_writer.id=c_book.writer " +
			"LEFT JOIN c_book_publisher on c_book_publisher.id=c_book.publisher " +
			"LEFT JOIN c_book_cat on c_book_cat.id=c_book.cat " +
			"WHERE c_book.id=? ";
		pms=[params.col];
	}else if(params.type=='c_book_writer'|| params.type=='c_book_publisher' || params.type=='c_book_cat'){
		sql = "SELECT *, COALESCE(CONCAT('https://vivalibro.com/media/', img), 'https://vivalibro.com/img/empty.png') as uri FROM "+params.type+" WHERE id=? ";
		pms=[params.col];
	}else if(params.type=='libdetails'){
		sql = "SELECT c_book_libuser.libid,c_book_libuser.bookid,c_book_libuser.score," +
			"user.name,lib.id,DATE_FORMAT(lib.created, \"%Y-%m-%d\") as created," +
			"COALESCE(CONCAT('https://vivalibro.com/media/', lib.img), 'https://vivalibro.com/img/header.png') as uri," +
			"(SELECT count(id) FROM c_book_cat) as catcount, "+
			"(SELECT count(id) FROM c_book_publisher) as publishercount, "+
			"(SELECT count(id) FROM c_book_writer) as writercount, "+
			"count(Distinct(c_book_libuser.id)) as bookcount "+
			"FROM c_book_lib " +
			"LEFT JOIN c_book_libuser on c_book_libuser.libid=lib.id " +
			"LEFT JOIN user on lib.userid=user.id " +
			"where c_book_lib.id=? ";
		pms = [params.col];
	}else if(params.type=='c_book_lib'){
		var pagin=10, start=(parseInt(params.query.page) - 1) * pagin;
		var limit=`LIMIT ${start},${pagin}`
		if(params.query.q!='') {
			var q=params.query.q, page=params.query.page;
			sql = "SELECT book.*,COALESCE(CONCAT('https://vivalibro.com/media/', book.img), 'https://vivalibro.com/img/empty.png') as uri, " +
				"writer.id as writerId,publisher.id as publisherId,book.id as bookId,writer.name as writername,cat.name as catname,publisher.name as publishername " +
				"FROM c_book_libuser " +
				"LEFT JOIN book on c_book.id=c_book_libuser.bookid " +
				"LEFT JOIN writer on c_book_writer.id=c_book.writer " +
				"LEFT JOIN publisher on publisher.id=book.publisher " +
				"LEFT JOIN c_book_cat on c_book_cat.id=c_book.cat " +
				"WHERE c_book_libuser.libid=? " +
				"AND (book.title LIKE ? " +
				"OR writer.name LIKE ? " +
				"OR publisher.name LIKE ?) " +
				"GROUP BY book.id  ORDER BY book.edited DESC "+limit;
			pms=[1, `%${q}%`, `%${q}%`, `%${q}%`];
		}else {
			sql = "SELECT book.*,COALESCE(CONCAT('https://vivalibro.com/media/', c_book.img), 'https://vivalibro.com/img/empty.png') as uri," +
				"writer.id as writerId,publisher.id as publisherId,book.id as bookId,writer.name as writername,publisher.name as publishername,cat.name as catname " +
				"FROM c_book_libuser " +
				"LEFT JOIN c_book on c_book.id=c_book_libuser.bookid " +
				"LEFT JOIN c_book_writer on c_book_writer.id=book.writer " +
				"LEFT JOIN publisher on c_book_publisher.id=c_book.publisher " +
				"LEFT JOIN c_book_cat on c_book_cat.id=c_book.cat " +
				"WHERE c_book_libuser.libid=? GROUP BY c_book.id ORDER BY c_book.edited DESC " + limit;
			pms = [params.col];
			console.log(sql)
		}
// POST
	}else if(params.type=='savenew') {
		console.log(params)
		var col=params.col,key=params.body.key, value=params.body.value, id=params.body.id;
		sql = `INSERT INTO ${key} (name,edited) VALUES (${value},NOW()); `;
		sql += `UPDATE ${col} SET ${key} = LAST_INSERT_ID(), edited = NOW() WHERE id=?;`;
		pms=[key,value,id];
	}else if(params.type=='lookupsave') {
		console.log(params)
		var col=params.col,key=params.body.key, value=params.body.value, id=params.body.id;
		sql = `UPDATE ${col} SET ${key}=?,edited=NOW()  WHERE id=?`;
		pms=[value,id];
	}else if(params.type=='edit') {
		var col=params.col, key=params.body.key, value=params.body.value, id=params.body.id;
		sql = `UPDATE ${col} SET ${key}=?,edited=NOW() WHERE id=?`;
		pms=[value,id];
		console.log(sql);
		console.log(pms);
	}else if(params.type=='c_book_libuser'){
		var bookid=params.bookid,libid=params.libid;
		sql = `INSERT INTO c_book_libuser (bookid,libid) VALUES(?,?)`;
		pms=[bookid,libid];
	}else if(params.type=='newbook'){
		sql = `INSERT INTO book (created,edited) VALUES(NOW(),NOW())`;
		pms=[];
	}else if(params.type=='login'){
		var email=params.email,pass=params.pass;
		sql = `SELECT * FROM user WHERE email=? AND pass=?`;
		pms=[email,pass];
	}else if(params.type=='signup'){
		var email=params.email,pass=params.pass,name=params.name;
		sql = "INSERT INTO user (email,name,pass) values (?,?,?)";
		pms= [email, name,pass];
	}else {
		console.log("No query case")
	}
	//var prm=params.hasOwnProperty('prm') ? params.prm : [];
const pool = mariadb.createPool({
	host: '127.0.0.1',
	user: 'dros',
	password: 'n130177!',
	database: "gen_vivalibrocom",
	connectionLimit: 10,
	waitForConnections: true,
	queueLimit: 0
});
const call = async function() {
	  let conn;
	  try {
		conn = await pool.getConnection();
		const response = await conn.query(sql,pms)
		//	conn.release()
		return response;
	  } catch (err) {
		throw err;
	  } finally {
		if(conn) conn.release();
	  }
//	pool.end();
}
options[action]= function (callback) {
		call().then(result => callback(result)).catch(err => callback(err));
}
return options;
};