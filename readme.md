# @hexalox/base-express

`base-express` provides a basic setup for an Express server with configurable options. It includes features such as cookie parsing, helmet security middleware, JSON parsing, error handling, and the ability to start both HTTP and HTTPS servers.

## Installation

```bash
npm i @hexalox/base-express
```

## Usage

```javascript
import { baseExpressServer } from '@hexalox/base-express';

// Create an instance with a configuration object
const config = {
  //...your configuration
};
const server = new baseExpressServer(config);

// Set up routes
const routes = [
  //...your routes
];
server.setRoutes(routes);

// Start the server
server.startServer();
```

## Configuration

The `config` object passed to the constructor follows the schema defined in `configSchema`. You can customize the behavior of the server by providing your configuration.

Example:

```javascript
const config = {
  express: {
    cookie: true,
    helmet: true,
    //...other express configurations
  },
  webserver: {
    http: {
      port: 3000,
    },
    https: {
      enabled: true,
      ssl: {
        key: 'path/to/key.pem',
        cert: 'path/to/cert.pem',
        ca: 'path/to/ca.pem',
      },
      //...other https configurations
    },
    //...other webserver configurations
  },
};
```

## API

### Constructor

#### `new baseExpressServer(config?: object)`

Creates a new instance of `baseExpressServer` with an optional configuration object.

- `config`: An optional configuration object that follows the schema defined in `configSchema`.

### Methods

#### `setRoutes(routes: Array<object>)`

Sets up the routes for the Express server.

- `routes`: An array of route objects, each containing `type`, `routePath`, and `callback`.

#### `addRoute(type: string, routePath: string, callback: Function)`

Adds a single route to the Express server.

- `type`: The HTTP method type ('use', 'get', 'post').
- `routePath`: The route path.
- `callback`: The callback function for the route.

#### `use(middleware: Function)`

Adds middleware to the Express server.

- `middleware`: The middleware function.

#### `enableCookie(flag?: boolean)`

Enables or disables cookie parsing middleware.

- `flag`: A boolean indicating whether to enable or disable the cookie parsing middleware.

#### `enableHelmet(flag?: boolean)`

Enables or disables the helmet security middleware.

- `flag`: A boolean indicating whether to enable or disable the helmet security middleware.

#### `startServer()`

Starts the HTTP and HTTPS servers based on the provided configuration.


