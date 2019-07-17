var winston_log = require("winston");
var expressWinston = require("express-winston");

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    // return `${timestamp}[${level}]: ${message}`;
    return `[${level}]: ${message}`;
});

const appInsights = require("applicationinsights");
const { AzureApplicationInsightsLogger } = require('winston-azure-application-insights');
 
if (process.env.APP_INSIGHTS_INSTRUMENTATION_KEY) {
    appInsights.setup(process.env.APP_INSIGHTS_INSTRUMENTATION_KEY).start();
}

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5
  }

function getTransports(logType) {
    var trans = [
        new winston_log.transports.Console({level: 'debug'}),
        //disable disk log, all use appInsights
        // new winston_log.transports.File(
        //     {
        //         filename: 'logs/error.log',
        //         level: 'error',
        //         maxsize: 31457280,
        //         maxFiles: 3,
        //         json: false,
        //         tailable: true
        //     }
        // ),
        // new winston_log.transports.File(
        //     {
        //         filename: 'logs/log.log',
        //         level: 'debug',
        //         maxsize: 31457280,
        //         maxFiles: 3,
        //         json: false,
        //         tailable: true
        //     }
        // ),
        
    ];
    if(process.env.APP_INSIGHTS_INSTRUMENTATION_KEY){
        trans.push(new AzureApplicationInsightsLogger({
            insights: appInsights
        }));
    }
    // if (env === 'production') {
    //     if (logType === 'access') {
    //         trans.push(new (winston_log.transports.AzureTable) (getAzureOption('accesslog')));
    //     } else if (logType === 'error') {
    //         trans.push(new (winston_log.transports.AzureTable) (getAzureOption('errorlog')));
    //     } else {
    //         trans.push(new (winston_log.transports.AzureTable) (getAzureOption('applog')));
    //     }
    // }
    return trans;
}

var accessLogger = expressWinston.logger({
    transports: getTransports('access'),
    format: winston_log.format.combine(
        winston_log.format.timestamp(),
        // winston.format.colorize(),
        myFormat
    ),
    // level: "info",
    // meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "{{req.clientIp}} {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    // expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    // colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    // ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
});

var errorLogger = expressWinston.errorLogger({
    transports: getTransports('error'),
    format: winston_log.format.combine(
        winston_log.format.timestamp(),
        winston_log.format.json()
    )
});

var appLogger = createLogger({
    level: 'info',
    transports: getTransports('app'),
    format: combine(
        timestamp(),
        myFormat
    ),
    // format: winston.format.combine(
    //     winston.format.timestamp(),
    //     // winston.format.colorize(),
    //     winston.format.json()
    // )
});


module.exports = {
    appLogger,
    accessLogger,
    errorLogger
};