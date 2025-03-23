const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
require('dotenv').config();
const fun = require('./functions');

module.exports = function(params) {
    let options = {};

    async function call() {
        let client;
        try {
            client = await MongoClient.connect(process.env.MONGOCONNECT);
            const db = client.db();
            const collection = db.collection(params.key);
            params.q = params.q || {};
            let response;
            switch (params.col) {
                case 'ins':
                    response = await collection.insertOne(JSON.parse(params.q.set));
                    break;
                case 'insMany':
                    response = await collection.insertMany(JSON.parse(params.q.set));
                    break;
                case 'set':
                    response = await collection.updateOne(JSON.parse(params.q.where), { $set: JSON.parse(params.q.set) });
                    break;
                case 'getOne':
                    response = await collection.findOne(fun.mogetparams(params.q, mongo));
                    break;
                case 'get':
                    let limit = params.q.hasOwnProperty('limit') ? parseInt(params.q.limit) : 0; //ok
                    let sort = params.q.hasOwnProperty('order') && params.q.order.slice(-1) === '-' ? -1 : +1; // ok
                    let order = params.q.hasOwnProperty('order') ? {[params.q.order.slice(0, -1)]: sort} : {};    //ok
                    let page = params.q.hasOwnProperty('page') ? parseInt(params.q.page) : 1;
                    let skip = limit * (page - 1);	//ok
                    delete params.q.limit;delete params.q.order;delete params.q.page;
                    let find=fun.mogetparams({mid:params.id},mongo);
                    console.log(find)
                    response = await db.collection(params.key).find({mid:params.id}).skip(skip).limit(limit).sort(order).toArray();
                    break;
                default:
                    throw new Error('Invalid MongoDB action');
            }

            client.close();
            return response;
        } catch (err) {
            if (client) client.close();
            throw err;
        }
    }

    options[params.col] = function(callback) {
        call().then(result => callback(result)).catch(err => callback(err));
    };

    return options;
};
