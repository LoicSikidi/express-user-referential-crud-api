const tmpdir = require('os').tmpdir();
const { ENV } = require('./configuration');
const bunyan = require('bunyan');


function getStream(env){
    return env === 'development' ? 
        [{
            type: 'rotating-file',
            path: tmpdir + '/app.log',
            period: '1d',   // daily rotation
            count: 10       // keep 10 back copies
        },{
            stream: process.stdout,
            level: "info"
        },{
            stream: process.stderr,
            level: "error"
        }] 
        :
        [{
            stream: process.stdout,
            level: "info"
        },{
            stream: process.stderr,
            level: "error"
        }]
}

const logger = {
    loggerInstance(correlationId) {
        return bunyan.createLogger({
            name: 'user-ref-crud-api',
            correlationId: correlationId,
            serializers: {
                req: bunyan.stdSerializers.req,
                res: bunyan.stdSerializers.res,
                err: bunyan.stdSerializers.err
            },
            streams: getStream(ENV)
        })
    },
    getAction (req) {
        let action;
        // Match only "/api/v1/users" or "/api/v1/users/"
        const onlyBasepathRegex = /^(\/api\/v1\/users)(\/)?$/
        // Match "/api/v1/users/{email}" or "/api/v1/users/{email}/"
        const onlyFullRegex = /^(\/api\/v1\/users\/)(([^<>()\[\]\\\/.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))(\/)?$/g
        // Match all strings mentioned above
        const onlyBasepathOrFullRegex = /^(\/api\/v1\/users)(\/)?(\/(([^<>()\[\]\\\/.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))(\/)?)?$/g
        if(req.originalUrl.match(onlyBasepathOrFullRegex)){
            const isSpecificUserEndPoint = req.originalUrl.match(onlyFullRegex);
            switch (req.method) {
              case 'GET':    action = isSpecificUserEndPoint ?  "get_user" : "get_users"; break;
              case 'PUT':    action = isSpecificUserEndPoint ? "put_user" : action; break;
              case 'POST':   action = req.originalUrl.match(onlyBasepathRegex) ? "post_user" : action; break;
              case 'DELETE': action = isSpecificUserEndPoint ? "delete_user" : action; break;
            }
        }
        return action;  
    }
}

module.exports = Object.freeze(logger);