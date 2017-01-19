import * as RealtimeMessaging from 'realtime-messaging';
import { Observable, Observer } from 'rxjs/Rx';

export type PresenceParameters = RealtimeMessaging.PresenceParameters;
export type PresenceResult = RealtimeMessaging.PresenceResult;
export type MessageOptions = RealtimeMessaging.MessageOptions;

export interface ConnectionEvent {
  type: string;
  channel?: string;
  exception?: string;
}

export class ObservableConnection {
  private client: RealtimeMessaging.Client;
  private channels = {};
  private connectionObservable: Observable<ConnectionEvent> = null;
  private connectedReady: Promise<{}>;
  private reconnectedReady: Promise<{}> = null;
  private reconnectedResolveFn: any = null;
  private isReconnecting: boolean = false; 

  constructor() {
    this.client = RealtimeMessaging.createClient();
  }

  setClusterUrl(url: string): void {
    this.client.setClusterUrl(url);
  }

	getAnnouncementSubChannel(): string {
    return this.client.getAnnouncementSubChannel();
  }

	getClusterUrl(): string {
    return this.client.getClusterUrl();
  }

	getConnectionMetadata(): string {
    return this.client.getConnectionMetadata();
  }

	getConnectionTimeout(): number {
    return this.client.getConnectionTimeout();
  }

	getHeartbeatActive(): boolean {
    return this.client.getHeartbeatActive();
  }

	getHeartbeatFails(): number {
    return this.client.getHeartbeatFails();
  }

	getHeartbeatTime(): number {
    return this.client.getHeartbeatTime();
  }

	getId(): string {
    return this.client.getId();
  }

	getProtocol(): string {
    return this.client.getProtocol();
  }

	getSessionId(): string {
    return this.client.getSessionId();
  }

	getUrl(): string {
    return this.client.getUrl();
  }

	getIsConnected(): boolean {
    return this.client.getIsConnected();
  }

	isSubscribed(channel: string): boolean {
    return this.client.isSubscribed(channel);
  }

	presence(params: PresenceParameters): Observable<PresenceResult> {
    return Observable.create((observer: Observer<PresenceResult>) => {
      this.client.presence(params, (error: string, result: RealtimeMessaging.PresenceResult) => {
        if(error) {
          observer.error(error);
        } else {
          observer.next(result);
        }
      })
    });
  }

	setAnnouncementSubChannel(channel: string): void {
    this.client.setAnnouncementSubChannel(channel);
  }

	setConnectionMetadata(connectionMetadata: string): void {
    this.client.setConnectionMetadata(connectionMetadata);
  }

	setConnectionTimeout(connectionTimeout: number): void {
    this.client.setConnectionTimeout(connectionTimeout);
  }

	setHeartbeatActive(active: boolean): void {
    this.client.setHeartbeatActive(active);
  }

	setHeartbeatFails(newHeartbeatFails: number): void {
    this.client.setHeartbeatFails(newHeartbeatFails);
  }

	setHeartbeatTime(newHeartbeatTime: number): void {
    this.client.setHeartbeatTime(newHeartbeatTime);
  }

	setId(id: string): void {
    this.client.setId(id);
  }

	setProtocol(protocol: string): void {
    this.client.setProtocol(protocol);
  }

	setUrl(url: string): void {
    this.client.setUrl(url);
  }

	getPublishTimeout(): number {
    return this.client.getPublishTimeout();
  }

  setPublishTimeout(newTimeout: number): void {
    this.client.setPublishTimeout(newTimeout);
  }

  // Establishes a connection to a Realtime server
  connect(appkey: string, token: string): void {
    if(!this.client.getUrl() && !this.client.getClusterUrl()) {
      // set the default cluster url to use a secure connection
      this.client.setClusterUrl("https://ortc-developers.realtime.co/server/ssl/2.1");
    }
    
    // set the connected promise
    this.connectedReady = new Promise((resolve, reject) => {
      this.client.connect(appkey, token);

      this.client.onConnected = (client) => {
        this.reconnectedReady = new Promise((resolve, reject) => {
          // resolve onReconnected promise immediately until we
          // start a reconnection loop
          resolve();
        });

        // resolve the connected promise
        resolve();
      }

      this.client.onException = (client, exception) => {
        // exception while connecting, reject the connected promise
        reject(exception);
      };
    });
  }

  // Get an observable for the connection events    
  observeConnection(): Observable<ConnectionEvent> {
    if(!this.connectionObservable) {

      // set the connection observable
      this.connectionObservable = Observable.create((observer: Observer<ConnectionEvent>) => {

        // handle the connection events 
        // and emit them through the subscribed observers
        this.client.onSubscribed = (client, channel) => {
          observer.next({ type: "SUBSCRIBED", channel: channel });  
        }

        this.client.onUnsubscribed = (client, channel) => {
          observer.next({ type: "UNSUBSCRIBED", channel: channel });   
        }

        this.client.onException = (client, exception) => {
          if(exception === "Invalid connection") {
            // fatal connection error, stop the observable
            observer.error("Invalid connection");
          } else {
            observer.next({ type: "EXCEPTION", exception: exception });
          }
        };

        this.client.onReconnecting = (client) => {
          if(!this.isReconnecting) {
            // start a new reconnected promise 
            // and save the resolve function for later usage (onReconnecting)
            this.reconnectedReady = new Promise((resolve, reject) => {
              this.reconnectedResolveFn = resolve;
            });

            this.isReconnecting = true;
          }
          
          observer.next({ type: "RECONNECTING" });
        }

        this.client.onReconnected = (client) => {
          observer.next({ type: "RECONNECTED" });

          if(this.reconnectedResolveFn) {
            // resolve the reconnected promise created
            // on the onReconnecting event
            this.reconnectedResolveFn();
          }

          this.isReconnecting = false;
        }

        this.client.onDisconnected = function (client) {
          observer.next({ type: "DISCONNECTED" });
        };
      });
      
      this.connectionObservable.share();
    }

    return this.connectionObservable;
  }

  // Get a channel observable based on the Realtime subscribe method
  observeChannel(channel: string): Observable<string> {
    if (this.channels[channel] && this.channels[channel].withOptions) {
       console.error("Channel " + channel + " is already being subscribed with options. You can't mix subscription types over the same channel using the same Realtime connection");
       return;
    }

    if (!this.channels[channel]) {
      const channelObservable = new Observable<string>((observer) => {

        this.connectedReady.then(() => {
          this.reconnectedReady.then(() => {
            this.client.subscribe(channel, true, function (client, channel, msg) {
              // emit received message to all channel observers
              observer.next(msg);
            });
          });
        });

        return () => {
          // no more channel observers
          // we can unsubscribe from the Realtime channel
          delete this.channels[channel];
          this.client.unsubscribe(channel);
        }
      });

      // share the channel observable 
      // so we can handle multiple observers
      const sharedChannelObservable = channelObservable.share();

      // save the shared channel observable to return on future subscriptions
      this.channels[channel] = {
        observable: sharedChannelObservable,
        withOptions: false
      }
    }

    return this.channels[channel].observable;
  }

  // Get a channel observable using the Realtime subscribeWithOptions method
  observeChannelWithOptions(channel: string, subscriberId?: string, filter?: string, autoUnsubscribe: boolean = true): Observable<MessageOptions> {
    if (this.channels[channel] && !this.channels[channel].withOptions) {
      console.error("Channel " + channel + " is already being subscribed without options. You can't mix subscription types over the same channel using the same Realtime connection");
      return;
    }

    const _channel = this.channels[channel];
    if(_channel && _channel.optionsKey !== (subscriberId + "_" + filter + "_" + autoUnsubscribe)) {
      console.error("Channel " + channel + " is already being subscribed with different options. You can't mix subscription options over the same channel using the same Realtime connection");
      return;
    }

    if (!_channel) {

      if(this.client.getIsConnected() && this.client.isSubscribed(channel)) {
        console.error("Channel " + channel + " is already being subscribed but has no observers. Probably you disabled autoUnsubscribe for this channel in some previous observerable");
        return;
      }

      // Create a new observable for the channel
      const channelObservable = new Observable<MessageOptions>((observer) => {

        this.connectedReady.then(() => {
          this.reconnectedReady.then(() => {
            const subscriptionOptions: RealtimeMessaging.SubscribeOptions = {
              channel: channel,
              subscriberId: subscriberId,
              filter: filter
            };
            this.client.subscribeWithOptions(subscriptionOptions, function (client, messageOptions) {
              // emit received message to all channel observers
              observer.next(messageOptions);
            });
          });
        });

        return () => {
          // no more observers for this channel
          // we can unsubscribe from the Realtime channel if autoUnsubscribe is set

          if(this.channels[channel] && this.channels[channel].autoUnsubscribe) {
            this.client.unsubscribe(channel);
          }

           delete this.channels[channel];
        }
      });

      // share the channel observable 
      // so we can handle multiple observers
      const sharedChannelObservable = channelObservable.share();

      // save the shared channel observable to return on future subscriptions
      this.channels[channel] = {
        observable: sharedChannelObservable,
        withOptions: true,
        optionsKey: subscriberId + "_" + filter + "_" + autoUnsubscribe,
        autoUnsubscribe: autoUnsubscribe
      }
    }

    return this.channels[channel].observable;
  }

  // Sends a message to the channel
  send(channel: string, message: string) : void {
    this.connectedReady.then(() => {
      this.reconnectedReady.then(() => {
        this.client.send(channel, message);
      });
    });
  }

  publish(channel: string, message: string, ttl: number) : Observable<string> {
    return Observable.create((observer: Observer<string>) => {

      this.connectedReady.then(() => {
        this.reconnectedReady.then(() => {
          this.client.publish(channel, message, ttl, (error: string, seqId: string) => {
            if(error) {
              observer.error(error);
            } else {
              observer.next(seqId);
            }
          });   
        });
      });
      
    });
  }

  // Disconnects from Realtime
  disconnect(): void {
    // clean up before disconnecting
    this.connectedReady = null;
    this.reconnectedReady = null;
    this.reconnectedResolveFn = null;
    delete this.channels;
    this.channels = {};
    this.client.disconnect();
  }

}



