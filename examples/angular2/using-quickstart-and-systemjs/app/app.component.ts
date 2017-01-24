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
