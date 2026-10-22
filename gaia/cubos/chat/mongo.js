const mongo=require('mongodb'),MongoClient= mongo.MongoClient;
require('dotenv').config();
const fun=require('./fun');

const url = process.env.MONGODB_URL; // MongoDB connection string
const dbName = process.env.DB_NAME; // Database name

//setMongo(message.collection, type, where, query);
async function setMongo(collectionName, type, where, query) {
    const client = await MongoClient.connect(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
//or update etc
        if(type=='update'){
            if(Object.keys(where)[0]=="_id"){var id=Object.values(where)[0];where={};where["_id"]=new mongo.ObjectID(id)}
            await collection.findOneAndUpdate(where,query,{upsert: true});
        }else {
            await collection.insertOne(query);
        }
        console.log(`Data inserted into ${collectionName}:`);
    } catch (err) {
        console.error('Error inserting data into MongoDB:', err);
    } finally {
        await client.close();
    }
}
async function getMongo(collectionName, query = {}) {
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
      //  console.log(query);
       // query={cid:3701232,uid:1};
        const result = await db.collection(collectionName).findOne(mogetparams(query,mongo));
        //const result = await collection.find(query).toArray();
      //  console.log(`Data retrieved from ${collectionName}:`, result);
        return result;
    } catch (err) {
        console.error('Error retrieving data from MongoDB:', err);
        return null;
    } finally {
        await client.close();
    }
}

module.exports = {
    setMongo,
    getMongo
};

function mogetparams(q,mongo){
    var params={};
    for (var i in q) {
        if(i=="_id"){
            params[i] =  new mongo.ObjectID(q[i]);
        }else if(i=="find"){

            params[i] = JSON.parse(q[i])
        }else if(i=="$regex"){

            params[i] = fun.regex(q[i]);
        }else if(i=="$or"){
            //s.api.mo.get('message',{$or:[{fromid:my.userid},{toid:my.userid}],page:1,limit:20})
            if(q[i].length>1){
                var qi=[];
                for(var k in q[i]){
                    var y={};var vals2=q[i][k];
                    for(var l in vals2){
                        y[l]=fun.regex(fun.i(vals2[l]))
                    }
                    qi.push(y)
                }
                params[i]=qi;
                //params[i]=qi;
            }else{
                params[i]=isNaN(parseInt(q[i])) ? fun.parseor(q[i]) : parseInt(q[i])
            }
        }else{
            //most cases
            if(typeof q[i]=='object'){
                for(var n in q[i]){
                }
                params[i]=q[i];
            }else{
                params[i]=isNaN(q[i]) ? parseqi(q[i]) : parseInt(q[i]);
            }
            //special case parsed with g.parseqi(q[i])
            //s.api.mo.get('message',{status:0,closed:{'$gt':1590019200,'$lt':1637884800}})
        }
    }
    return params;
};