'use strict';
/*
 * *************************************************************
 *    Provides UI services
 *
 * *************************************************************
 */

/*
 To Do List:

 TODO: some route will be blocked by referer
 */

/**
 * About different mode
 * 
 * development for local env
 * azure_dev for azure development env
 * azure_stg for azure staging env
 * azure_prod for azure production env
 * 
 * Please config the mode in Azure webapp setting
 * e.g. node UIserv.js azure_dev
 */

global.mode = "development";
if (process.argv && process.argv[2]) {
    global.mode = process.argv[2];
}
console.info('current global.mode: ' + global.mode);
process.chdir(__dirname);


const https = require('https');
const http = require('http');
const express = require('express');
const expressLogger = require('morgan');
const requestIp = require('request-ip');
const bodyParser = require('body-parser');
const compress = require('compression');
const cookieParser = require('cookie-parser');
const serveStatic = require('serve-static');
const sessions = require('client-sessions');


//config express app
var app = module.exports = express();
app.use(bodyParser.urlencoded({ extended: false }));

//support file upload
app.use(bodyParser.raw({
    type:'multipart/form-data',
    limit:'2mb',inflate:false}));
    



process.on('uncaughtException', (err) => {
//    logger.error('TMCAS_UI_CRITICAL_uncaughtException ' + util.inspect(err));
    process.exit(-1);
});

process.on('exit', (code) => {
 //   logger.error('TMCAS_UI_CRITICAL_processExit', code);
});


app.use(serveStatic(__dirname + '/ui/nova/', {
    maxAge: 0
}));

/**
 * *************************************************************
 * Start UI Server
 * 
 * *************************************************************
 */
if (global.mode.indexOf('azure') === 0) {
    let port = process.env.PORT;
    console.log("env.port is "+port);
    http.createServer(app).listen(port, function () {
        logger.info('Express server listening on port ' + port);
    });
}

if (global.mode === 'development') {
    // https.createServer(mockOptions, app).listen(443, function () {
    //     console.log('Express server listening on port 443');
    // });
    http.createServer(app).listen(8080, function () {
        console.log('Express server listening on port ' + 808);
    });
}
