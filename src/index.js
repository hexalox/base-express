import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

export const configSchema = {
    express: {
        cookie: "boolean",
        // for simple key value pair, value holds the allowed datatype
        helmet: "boolean",
        views: {
            path: "string",
            engine: ["string", ["ejs"]]
        },
        proxy: {
            trust: "boolean"
        }
    },
    webserver: {
        http: {
            port: ["number", [], true],
            //if value of the schema is a array then 0th index is allowed datatype, which is string, 
            // 1st index can be blank string or array, if array provided that will allowed list of values, 
            // 2nd index is requiredflag
        },
        https: {
            enabled: "boolean",
            ssl: {
                key: "string",
                cert: "string",
                ca: "string"
            },
            ciphers: "string",
            honorCipherOrder: "boolean",
            port: "number",
            keepAliveTimeout: "number",
            headersTimeout: "number"
        }
    }
};

export const sampleConfig = {
    express: {
        cookie: true,
        helmet: true,
        views: {
            path: "views",
            engine: "ejs"
        },
        proxy: {
            trust: true
        }
    },
    webserver: {
        http: {
            port: 1901
        },
        https: {
            enabled: false,
            ssl: {
                key: "",
                cert: "",
                ca: ""
            },
            ciphers: "",
            honorCipherOrder: true,
            port: 1900,
            keepAliveTimeout: 4800,
            headersTimeout: 4800
        }
    }
};



export class baseExpressServer {
    constructor(config) {
      this.config = config ?? {};
      this.app = express();
      this.parseJSON = this.parseJSON.bind(this);
      this.addRawBody = this.addRawBody.bind(this);
      this.errorHandler = this.errorHandler.bind(this);
      this.prepareBaseServer();
    }
  
    errorHandler(err, req, res, next) {
      console.error(
        `${new Date().toLocaleString()} - ERROR - ${req.path} - ${req.ip} - ${JSON.stringify(
          req.body
        )} - ${JSON.stringify(req.headers)}`
      );
      console.log(err);
      res.status(503).send({
        error: 'server_error',
        error_description: 'Service Unavailable',
      });
    }
  
    parseJSON(req, res, next) {
      express.json({
        verify: this.addRawBody,
      })(req, res, (err) => {
        if (err) {
          console.log(err);
          res.status(400).send({
            error: 'syntax_error',
            error_description: 'The request could not be understood by the server due to malformed syntax.',
          });
          return;
        }
        next();
      });
    }
  
    addRawBody(req, res, buf, encoding) {
      req.rawBody = buf.toString();
    }
  
    prepareBaseServer() {
      const { express: expressConfig } = this.config;
      this.enableCookie(expressConfig?.cookie ?? true);
      this.enableHelmet(expressConfig?.helmet ?? true);
      this.app.use(this.parseJSON);
      
      // this.app.use(express.raw({ type: 'application/vnd.custom-type' }));
      // parse an HTML body into a string
      this.app.use(express.text({ type: 'text/html' }));
      this.app.use(express.text({ type: 'text/html' }));
      this.app.use(express.text());
      this.app.use(express.raw());
      this.app.use(express.urlencoded({extended: true}))
      // this.app.use(express.json());
      // this.app.use();
      this.app.use(this.errorHandler);
      if (expressConfig?.views) {
        this.app.set('views', expressConfig?.views.path);
        this.app.set('view engine', expressConfig?.views?.engine ?? 'ejs');
      }
  
      if (expressConfig?.proxy) {
        if (expressConfig.proxy.trust) {
          this.app.set('trust proxy', expressConfig.proxy.trust);
        }
      }
    }
  
    use(middleware) {
      this.app.use(middleware);
    }
  
    setRoutes(routes = []) {
      routes.forEach((route) => {
        this.addRoute(route.type, route.routePath, route.callback);
      });
    }
  
    addRoute(type, routePath, callback) {
      switch (type) {
        case 'use':
          this.app.use(routePath, callback);
          break;
        case 'get':
          this.app.get(routePath, callback);
          break;
        case 'post':
          this.app.post(routePath, callback);
          break;
        default:
          break;
      }
    }
  
    enableCookie(flag = true) {
      if (flag) {
        this.app.use(cookieParser());
      }
    }
  
    enableHelmet(flag = true) {
      if (flag) {
        this.app.use(helmet());
      }
    }
  
    startHTTP(webserver) {
      if (webserver?.http && webserver?.http?.port) {
        http
          .createServer(this.app)
          .listen(webserver.http.port, () => {
            console.log(`Listening on port ${webserver.http.port}`);
          });
      }
    }
  
    startHTTPs(webserver) {
      if (webserver?.https && webserver?.https?.enabled) {
        const privateKey = fs.readFileSync(webserver.https.ssl.key, 'utf8');
        const certificate = fs.readFileSync(webserver.https.ssl.cert, 'utf8');
        const digicert = fs.readFileSync(webserver.https.ssl.ca, 'utf8');
  
        var options = {
          key: privateKey,
          cert: certificate,
          ca: digicert,
        };
  
        if (webserver.https.ciphers && Array.isArray(webserver.https.ciphers)) {
          options.ciphers = webserver.https.ciphers.join(':');
          options.honorCipherOrder = webserver.https.honorCipherOrder || true;
        }
  
        let server = https.createServer(options, this.app);
        server.listen(webserver.https.port, () =>
          console.log(`Listening on port ${webserver.https.port}`)
        );
        if (webserver.https?.keepAliveTimeout) {
          server.keepAliveTimeout = webserver.https.keepAliveTimeout;
        }
        if (webserver.https?.headersTimeout) {
          server.headersTimeout = webserver.https.headersTimeout;
        }
      }
    }
  
    startServer() {
      const webserverConfig = this.config?.webserver ?? {};
      this.startHTTP(webserverConfig);
      this.startHTTPs(webserverConfig);
    }
  }
  
  

export default {
    baseExpressServer
}


