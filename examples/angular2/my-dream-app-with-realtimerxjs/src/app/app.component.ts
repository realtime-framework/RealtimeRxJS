import { Component } from '@angular/core';
import * as RealtimeRx from 'realtime-rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  message = 'Waiting for Realtime message ...';

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
        this.message = message;
      });

    // Send a message
    rxConnection.send("myChannel", "... and Realtime Observables are working too!")
  }
}
