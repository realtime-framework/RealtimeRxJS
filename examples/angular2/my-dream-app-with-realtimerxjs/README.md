# MyDreamAppWithRealtimeRxJS

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.25.5.

We have simply added the `realtime-rxjs` module dependency in the `package.json` file:

```
"dependencies": {
    ...
    "realtime-rxjs": "^2.1.0"
  },
```

and added the `constructor` method in `/src/app/app.component.ts` to connect, subscribe and send a message to a Realtime channel.

```
constructor() {
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
	
	    // Add message to the component title
	    this.title += message;
	  });
	
	// Send a message
	rxConnection.send("myChannel", "... and Realtime Observables are working too!")
}
```

## Install dependencies
Before you start your development server to run the app, don't forget to run the following command in the example root directory to install all dependencies:

```
npm install
```

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
