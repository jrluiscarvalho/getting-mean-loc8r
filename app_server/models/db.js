var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/Loc8r';
mongoose.connect(dbURI);

mongoose.connection.on('connected', function(){
    console.log('mongoose connected to '+dbURI);
});

mongoose.connection.on('error', function(){
    console.log('mongoose connected error '+dbURI);
});

mongoose.connection.on('disconnected', function(){
    console.log('mongoose disconnected');
});

gracefulShutdown = function(msg, callback){
    mongoose.connection.close(function(){
        console.log('mongoose disconnected through ' + msg);
        callback();
    });
}

//para os reinicios do nodemon
process.once('SIGUSR2', function(){
    gracefulShutdown('nodemon restart', function(){
        process.kill(process.pid, 'SIGUSR2')
    });
});

//para o encerramento da aplicacao no heroku
process.on('SIGTERM', function(){
    gracefulShutdown('heroku app shutdown', function(){
        process.exit(0);
    });
});

require('./locations');