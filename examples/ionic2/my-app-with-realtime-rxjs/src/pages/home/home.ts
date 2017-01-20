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
