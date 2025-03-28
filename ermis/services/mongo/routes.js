const express = require('express');
const router = express.Router();
const helper = require('./helper'); // MongoDB helper
router.get('/:col/:key/:id', async (req, res, next) => {
    try {
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.header('Access-Control-Allow-Origin', req.get('origin'));
        res.header('Access-Control-Allow-Credentials', true);

        let bin = 'nikos13';
        let authorization = Buffer.from(bin).toString('base64');
        res.header('Authorization', 'Basic ' + authorization);

        const { col, key, id } = req.params;
        console.log(`Request URL: ${req.url}`);
        console.log(req.params)
       const mongoActions = helper(req.params);
        mongoActions[col]((data) => {
        //    data = Array.isArray(data) ? (data.length === 1 ? data[0] : data) : data;
          //  data = data ? data.toString() : 'NO';
//            res.status(200).json(data).end();

            console.log(data)
            data=Number.isInteger(data) ? data.toString():(!data ? "NO":(data.length==1 ? data[0]:data));
            res.status(200).json(data);res.end()

        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
