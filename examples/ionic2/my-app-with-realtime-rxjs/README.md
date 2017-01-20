# my-app-with-realtime-rxjs

This project was generated with [ionic cli](https://ionicframework.com/getting-started/) version 2.1.18 through the following command:

```
ionic start --v2 my-ap-with-realtime-rxjs blank
```

We have simply added the `realtime-rxjs` module dependency in the `package.json` file:

```
"dependencies": {
    ...
    "realtime-rxjs": "^2.1.0"
  },
```

and added the `constructor` method in `/src/pages/home/home.ts` to connect, subscribe and send a message to a Realtime channel.

```
import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import * as RealtimeRx from 'realtime-rxjs';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  message: string = "Waiting for Realtime message ...";

  constructor(public navCtrl: NavController) {
    // Instantiates a new Realtime client connection
    const rxConnection = new RealtimeRx.ObservableConnection();

    // Sets the connection metadata (optional)
    rxConnection.setConnectionMetadata("Realtime RxJs Ionic2 example");

    // Establishes the connection to the Realtime server
    // Note: we are using our demo appkey, you should replace it with your own Realtime appkey
    rxConnection.connect("2Ze1dz", "token");

    // Observe channel and subscribe to receive messages
    rxConnection.observeChannel("myChannel")
      .subscribe((message) => {
        console.log("Received message: " + message);
        this.message = message;
      });

    // Send a message
    rxConnection.send("myChannel", "Message received. Realtime Observables are working!");
  }

}
```

We have also changed the page template in `/src/pages/home/home.html` to include the received message:

```
<ion-content padding>
  {{ message }}
</ion-content>
```

## Install dependencies
Before you run the app, don't forget to run the following command in the example root directory to install all dependencies:

```
npm install
```

## Development server
Run `ionic serve` for a dev server. It will launch a browser window with the app running in localhost. The app will automatically reload if you change any of the source files.

We should see the following text rendered in the home page:

```
Message received. Realtime Observables are working!
```

