/**
 * Created by efishtain on 18/01/2017.
 */


var mongoose = require('mongoose')
var options = {
    auto_reconnect: true,
    poolSize: 10,

    server:{
        socketOptions: { keepAlive: 1, connectTimeoutMS: 1000 ,socketTimeoutMS:3600000}

    }

}
if(process.env.NODE_ENV==='production'){
    options.replset= { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } };
}

var connectionString = process.env.db

var db = mongoose.connection;
db.on('connecting', function() {
    console.log('connecting to db');
});

db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
});
db.on('connected', function() {
    console.log('db connected event')
    setTimeout(function(){
        console.log('disconnect timeout expired, killing process')
        process.exit(1)
    },process.env.DISCONNECT_TIMEOUT || 10000)

});
db.once('open', function() {
    console.info('DB connection opened for the first time')
});

db.on('disconnected', function() {
    if(!mongoose.connection._hasOpened) {
        console.info('database connection never opened, going to manually retry again');
        setTimeout(function () {
            mongoose.connect(connectionString, options);
        }, 2000);
    }else{
        console.error('DB connection was disconnected');
    }
});

db.on('reconnected', function(){
    console.info('DB got reconnected');
})
mongoose.connect(connectionString,options);

