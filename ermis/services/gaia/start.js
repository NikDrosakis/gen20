    // api.js
const express = require('express'),fun=require("./functions"),path = require('path'),csv = require("csv-parser");
const router = express.Router();
const multer = require('multer');
const fs = require("fs");
const mysql = require('mysql2/promise');
const config = require("../../config.json");
// Import broadcast function
const { broadcastMessage } = require('../../ws');

function searchCSV(criteria, limit, offset, callback) {
    const results = [];
    fs.createReadStream('/var/www/gs/public/vivalibro.com/store/dataset1.csv')
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            let match = true;
            for (const key in criteria) {
                if (criteria.hasOwnProperty(key)) {
                    const pattern = criteria[key].replace(/%/g, '.*');
                    const regex = new RegExp(pattern, 'i'); // Case-insensitive matching
                    if (!regex.test(row[key])) {
                        match = false;
                        break;
                    }
                }
            }
            if (match) {
                results.push(row);
            }
        })
        .on('end', () => {
            const paginatedResults = results.slice(offset, offset + limit);
            callback(paginatedResults);
        });
}

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});
// Parse application/json
// Example GET method
router.get('/:type/:col', async (req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.header('Transfer-Encoding', 'chunked');
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header("Access-Control-Allow-Credentials", true);
    const bin = "nikos13".toString();
    const authorization = Buffer.from(bin).toString('base64');
    res.header("Authorization", "Basic " + authorization);
    const type = req.params.type || '';
    const col = req.params.col || '';
    req.params.query = req.query;
    req.params.body = req.query;
    console.log(req.params);
    if (type == 'dataset') {
        const criteria = { 'Book-Title': `%${col}%` };
        searchCSV(criteria, 10, 1, data => {
            res.status(200).json(data);
        });
    } else {
        const ma = require("./dbs/maria")(req.params, config, fun);
        ma[type](function (data) {
            if (type == 'lookup') {
                const newarray = [];
                console.log(data.length);
                if (data.length > 0) {
                    for (const i in data) {
                        newarray[data[i].name] = data[i].id;
                    }
                }
                res.json(newarray);
            } else {
                data = data == "" ? "NO" : data;
                res.status(200).json(data);
            }
            res.end();
        });
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/var/www/gs/public/vivalibro.com/media');
    },
    name: (req, file, cb) => {
        const uniqueName = path.basename(file.originalname);
        cb(null, uniqueName);
    },
});
const upload = multer({
    storage,
    limits: {
        fileSize: 10000000 // 10MB
    }
});

// Upload endpoint
router.post('/:type/:col/:img', upload.single('file'), async (req, res) => {
    const type = req.params.type || '';
    const col = req.params.col || '';

    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'n130177!',
        database: 'gen_vivalibrocom'
    });

    console.log('Uploaded file:', req.file);
    try {
        const fileName = path.basename(req.body.img);
        const { table, id } = req.body;
        const sql = `UPDATE ${col} SET img=? WHERE id = ?`;
        const params = [fileName, id];
        const [data] = await db.execute(sql, [fileName, id]);

        data.uri = `https://vivalibro.com/media/${fileName}`;
        console.log(data);
        if (data.affectedRows === 1) {
            res.status(200).send(data);

            // Broadcast the file update to WebSocket clients
            broadcastMessage({
                type: 'file_update',
                message: `File ${fileName} updated in table ${col}.`,
                uri: data.uri
            });
        } else {
            res.status(500).send({ error: 'Database update failed' });
        }
    } catch (error) {
        console.error('Error handling file upload:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    res.end();
});

router.post('/:type', async (req, res) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header("Access-Control-Allow-Credentials", true);

    const bin = ("nikos32").toString();
    const authorization = Buffer.from(bin).toString('base64');
    res.header("Authorization", "Basic " + authorization);
    const type = req.params.type || '';

    req.body.type = type;
    const ma = require("./dbs/maria")(req.body, config, fun);
    ma[type](function (data) {
        if (type === 'upload' || type === 'bookedit' || type === 'newbook' || type === 'bookuser' || type === 'signup') {
            res.json(data);
        } else if (type === 'login') {
            console.log(data);
            const user = { name: data[0].id };
            const responseData = data == "" ? { reply: "NO" } : data[0];
            res.json(responseData);
        } else {
            data = data == "" ? "NO" : data;
            res.json(data[0]);
        }
        res.end();
    });
});

router.post('/:type/:col', async (req, res) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Content-Type', 'application/x-www-form-urlencoded');
    res.header('Transfer-Encoding', 'chunked');
    res.header('Access-Control-Allow-Methods', 'GET,POST, OPTIONS');
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header("Access-Control-Allow-Credentials", true);

    const bin = (req.cookies['GSID'] + req.cookies['GSGRP']).toString();
    const authorization = Buffer.from(bin).toString('base64');
    res.header("Authorization", "Basic " + authorization);
    const type = req.params.type || '';
    const col = req.params.col || '';

    req.params.q = req.body.q;
    req.params.body = req.body;
    const ma = require("./dbs/maria")(req.params, config, fun);
    ma[type](function (data) {
        const r = data.affectedRows == 1 ? "OK" : "NO";
        res.status(200).json(r);

        // Broadcast the update to WebSocket clients
        broadcastMessage({
            type: 'activity',
            message: `Data updated in ${type} at column ${col}.`,
            data: r
        });

        res.end();
    });
});

module.exports = router;
