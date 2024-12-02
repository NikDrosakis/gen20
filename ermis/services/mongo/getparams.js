mogetparams:function(q,mongo){
    var params={};
    for (var i in q) {
        if(i=="_id"){
            params[i] =  new mongo.ObjectID(q[i]);
        }else if(i=="find"){

            params[i] = JSON.parse(q[i])
        }else if(i=="$regex"){

            params[i] = g.regex(q[i]);
        }else if(i=="$or"){
            //s.api.mo.get('message',{$or:[{fromid:my.userid},{toid:my.userid}],page:1,limit:20})
            if(q[i].length>1){
                var qi=[];
                for(var k in q[i]){
                    var y={};var vals2=q[i][k];
                    for(var l in vals2){
                        y[l]=g.regex(g.i(vals2[l]))
                    }
                    qi.push(y)
                }
                params[i]=qi;
                //params[i]=qi;
            }else{
                params[i]=isNaN(parseInt(q[i])) ? g.parseor(q[i]) : parseInt(q[i])
            }
        }else{
            //most cases
            if(typeof q[i]=='object'){
                for(var n in q[i]){
                }
                params[i]=q[i];
            }else{
                params[i]=isNaN(q[i]) ? g.parseqi(q[i]) : parseInt(q[i]);
            }
            //special case parsed with g.parseqi(q[i])
            //s.api.mo.get('message',{status:0,closed:{'$gt':1590019200,'$lt':1637884800}})
        }
    }
    return params;
},