# Realtime Messaging SDK for JavaScript Reactive Extensions (RxJS)
Part of the [The Realtime® Framework](http://framework.realtime.co), Realtime Cloud Messaging (aka ORTC) is a secure, fast and highly scalable cloud-hosted Pub/Sub real-time message broker for web and mobile apps.

If your application has data that needs to be updated in the user’s interface as it changes (e.g. real-time stock quotes or ever changing social news feed) Realtime Cloud Messaging is the reliable, easy, unbelievably fast, “works everywhere” solution.

# Overview
This project provides Reactive Extensions for JavaScript ([RxJS](https://github.com/ReactiveX/rxjs)) bindings for the Realtime Messaging JavaScript SDK, allowing easy channel subscription as Rx Observables.

This project can be easily used within Angular2 and Ionic2 apps.

# Installing with NPM

```bash
npm install realtime-rxjs --save
```

# Usage example


```javascript
import * as RealtimeRx from 'realtime-rxjs';
import { Observable } from 'rxjs/Rx';
...
// Instantiates a new Realtime client connection
rxConnection = new RealtimeRx.ObservableConnection();

// Sets the connection metadata (optional)
rxConnection.setConnectionMetadata("Realtime RxJs example");

// Establishes the connection to the Realtime server
rxConnection.connect("YOUR_APP_KEY", "token");

// Observe channel and subscribe to receive messages
rxConnection.observeChannel("myChannel")
  .subscribe((message) => {
    console.log("Received message: " + message);
  });

```
Note that you don't need to manage the connection state yourself (e.g. waiting for the onConnected event before subscribing a channekl) as it's performed internally (subscriptions and sends will be pending until the underlying Realtime connection is ready).

# API Reference

## connect(appkey: string, token: string): void
Establishes a connection to a Realtime server using the given appkey and security token.

```
rxConnection.connect("YOUR_APP_KEY", "token");
```

## observeConnection(): Observable&lt;ConnectionEvent>
Returns an Observable of connection events (e.g. onSubscribed, onReconneting, ...).

```
rxConnection.observeConnection()
	.subscribe((event) => {
      console.log("Realtime connection event:", event);
    });
```
## observeChannel(channel: string): Observable&lt;string>
Returns an Observable for a Realtime channel. Each message received on the channel will emit a next event for each subscribed observer.

```
rxConnection.observeChannel("myChannel")
  .subscribe((message) => {
    console.log("Received message: " + message);
  });
``` 

Note: the underlying Realtime channel unsubscription is performed automatically when there are no more observers subscribing the channel.

## observeChannelWithOptions(channel: string, subscriberId?: string, filter?: string, autoUnsubscribe?: boolean): Observable&lt;MessageOptions>
Same as `observeChannel` but uses other subscription options like buffered messages and filters.

```
rxConnection.observeChannelWithOptions("myChannel", "mySubscriberId")
	.subscribe((m) => {
    	console.log("Received message: " + m.message);
    	console.log("Message id: " + m.seqId);
    });
``` 

The default unsubscribe behaviour is the same as observeChannel (unsubscribe from the channel when there no more active channel observers), but passing `autoUnsubscribe = false` will not perform unsubscribes at all (useful for buffered subscriptions).

## send(channel: string, message: string): void
Sends a message to the given channel using the "at-most-once" delivery contract.

```
rxConnection.send("myChannel", JSON.stringify({ foo: "bar" }));
```

## publish(channel: string, message: string, ttl: number): Observable&lt;string>
Publishes a message to the given channel using the "at-least-once" delivery contract.

```
rxConnection.publish("myChannel", JSON.stringify({ foo: "bar" }), 60)
	.subscribe((seqId) => {
    	console.log("Message published with seqId: " + seqId);
    },
    (error) => console.log("Error publishing: " + error));
```

*Note: Don't forget to subscribe to get the publish result otherwise the message publish won't be performed at all.*
 
## disconnect(): void
Disconnects from the Realtime server. 

```
rxConnection.disconnect();
```


## Other methods 
This project wraps all public methods of the underlying Realtime JavaScript SDK. Complete reference can be found at
[http://messaging-public.realtime.co/documentation/javascript/2.1.0/OrtcClient.html](http://messaging-public.realtime.co/documentation/javascript/2.1.0/OrtcClient.html)


## Authors
Realtime.co

