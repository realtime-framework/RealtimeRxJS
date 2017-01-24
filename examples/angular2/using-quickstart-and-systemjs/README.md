# Angular QuickStart Example with systemjs and Realtime RxJS

This example is a clone of the TypeScript source code of the [angular.io quickstart](https://angular.io/docs/ts/latest/quickstart.html),
the foundation for most of the documentation samples and potentially a good starting point for your application.

It's been extended with Realtime RxJS library to demo the channel subscription as Observables.

**This is not the perfect arrangement for your application. It is not designed for production.
It exists primarily to get you started quickly with learning and prototyping in Angular**

## Additions to the cloned example

In order to use Realtime RxJS module you need to include it in the project `package.json` under the  `dependencies` section:

```
"dependencies": {
   ...    
   "realtime-rxjs": "^2.1.2"
}
```

Next you need to map the modules entry paths under the `map` section of your `systemjs.config.js`:

```
map: {
  ...
  
  'realtime-rxjs':             'npm:realtime-rxjs/dist/realtime-rxjs.js',
  'realtime-messaging':        'npm:realtime-messaging/dist/ortc-umd-min.js' 
}
```

Last but not the least, enter the following code into your app.component.ts to connect, subscribe and send a message using Realtime RxJS:

```
import { Component, OnInit } from '@angular/core';
import * as RealtimeRx from 'realtime-rxjs';

@Component({
  selector: 'my-app',
  template: `<h1>Hello {{name}}</h1><h2>Message received: {{ message }}</h2>`,
})

export class AppComponent implements OnInit { 
  name = 'Angular with Realtime RxJS';
  message = 'Waiting for Realtime message ...';
  rxConnection: RealtimeRx.ObservableConnection;

   ngOnInit() {
     // Instantiates a new Realtime client connection
    const rxConnection = new RealtimeRx.ObservableConnection();

    // Sets the connection metadata (optional)
    rxConnection.setConnectionMetadata("Realtime RxJs example");

    // Establishes the connection to the Realtime server
    // Note: we are using our demo appkey, you should replace it with your own Realtime appkey
    rxConnection.connect("2Ze1dz", "token");

    // Observe channel and subscribe to receive messages
    rxConnection.observeChannel("myChannel")
      .subscribe((message) => {
        console.log("Received message: " + message);

        // Add message to the template
       this.message = message;
      });

    // Send a message
    rxConnection.send("myChannel", "... and Realtime Observables are working too!")
   }
}
```

## Prerequisites

Node.js and npm are essential to Angular development. 
    
<a href="https://docs.npmjs.com/getting-started/installing-node" target="_blank" title="Installing Node.js and updating npm">
Get it now</a> if it's not already installed on your machine.
 
**Verify that you are running at least node `v4.x.x` and npm `3.x.x`**
by running `node -v` and `npm -v` in a terminal/console window.
Older versions produce errors.

We recommend [nvm](https://github.com/creationix/nvm) for managing multiple versions of node and npm.

## Install npm packages

> See npm and nvm version notes above

Install the npm packages described in the `package.json` and verify that it works:

```shell
npm install
npm start
```

>Doesn't work in _Bash for Windows_ which does not support servers as of January, 2017.

The `npm start` command first compiles the application, 
then simultaneously re-compiles and runs the `lite-server`.
Both the compiler and the server watch for file changes.

Shut it down manually with `Ctrl-C`.

You're ready to write your application.

### npm scripts

We've captured many of the most useful commands in npm scripts defined in the `package.json`:

* `npm start` - runs the compiler and a server at the same time, both in "watch mode".
* `npm run tsc` - runs the TypeScript compiler once.
* `npm run tsc:w` - runs the TypeScript compiler in watch mode; the process keeps running, awaiting changes to TypeScript files and re-compiling when it sees them.
* `npm run lite` - runs the [lite-server](https://www.npmjs.com/package/lite-server), a light-weight, static file server, written and maintained by
[John Papa](https://github.com/johnpapa) and
[Christopher Martin](https://github.com/cgmartin)
with excellent support for Angular apps that use routing.


