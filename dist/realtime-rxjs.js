'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ObservableConnection = undefined;

var _realtimeMessaging = require('realtime-messaging');

var RealtimeMessaging = _interopRequireWildcard(_realtimeMessaging);

var _Rx = require('rxjs/Rx');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var ObservableConnection = function () {
    function ObservableConnection() {
        this.channels = {};
        this.connectionObservable = null;
        this.reconnectedReady = null;
        this.reconnectedResolveFn = null;
        this.isReconnecting = false;
        this.client = RealtimeMessaging.createClient();
    }
    ObservableConnection.prototype.setClusterUrl = function (url) {
        this.client.setClusterUrl(url);
    };
    ObservableConnection.prototype.getAnnouncementSubChannel = function () {
        return this.client.getAnnouncementSubChannel();
    };
    ObservableConnection.prototype.getClusterUrl = function () {
        return this.client.getClusterUrl();
    };
    ObservableConnection.prototype.getConnectionMetadata = function () {
        return this.client.getConnectionMetadata();
    };
    ObservableConnection.prototype.getConnectionTimeout = function () {
        return this.client.getConnectionTimeout();
    };
    ObservableConnection.prototype.getHeartbeatActive = function () {
        return this.client.getHeartbeatActive();
    };
    ObservableConnection.prototype.getHeartbeatFails = function () {
        return this.client.getHeartbeatFails();
    };
    ObservableConnection.prototype.getHeartbeatTime = function () {
        return this.client.getHeartbeatTime();
    };
    ObservableConnection.prototype.getId = function () {
        return this.client.getId();
    };
    ObservableConnection.prototype.getProtocol = function () {
        return this.client.getProtocol();
    };
    ObservableConnection.prototype.getSessionId = function () {
        return this.client.getSessionId();
    };
    ObservableConnection.prototype.getUrl = function () {
        return this.client.getUrl();
    };
    ObservableConnection.prototype.getIsConnected = function () {
        return this.client.getIsConnected();
    };
    ObservableConnection.prototype.isSubscribed = function (channel) {
        return this.client.isSubscribed(channel);
    };
    ObservableConnection.prototype.presence = function (params) {
        var _this = this;
        return _Rx.Observable.create(function (observer) {
            _this.client.presence(params, function (error, result) {
                if (error) {
                    observer.error(error);
                } else {
                    observer.next(result);
                }
            });
        });
    };
    ObservableConnection.prototype.setAnnouncementSubChannel = function (channel) {
        this.client.setAnnouncementSubChannel(channel);
    };
    ObservableConnection.prototype.setConnectionMetadata = function (connectionMetadata) {
        this.client.setConnectionMetadata(connectionMetadata);
    };
    ObservableConnection.prototype.setConnectionTimeout = function (connectionTimeout) {
        this.client.setConnectionTimeout(connectionTimeout);
    };
    ObservableConnection.prototype.setHeartbeatActive = function (active) {
        this.client.setHeartbeatActive(active);
    };
    ObservableConnection.prototype.setHeartbeatFails = function (newHeartbeatFails) {
        this.client.setHeartbeatFails(newHeartbeatFails);
    };
    ObservableConnection.prototype.setHeartbeatTime = function (newHeartbeatTime) {
        this.client.setHeartbeatTime(newHeartbeatTime);
    };
    ObservableConnection.prototype.setId = function (id) {
        this.client.setId(id);
    };
    ObservableConnection.prototype.setProtocol = function (protocol) {
        this.client.setProtocol(protocol);
    };
    ObservableConnection.prototype.setUrl = function (url) {
        this.client.setUrl(url);
    };
    ObservableConnection.prototype.getPublishTimeout = function () {
        return this.client.getPublishTimeout();
    };
    ObservableConnection.prototype.setPublishTimeout = function (newTimeout) {
        this.client.setPublishTimeout(newTimeout);
    };
    // Establishes a connection to a Realtime server
    ObservableConnection.prototype.connect = function (appkey, token) {
        var _this = this;
        if (!this.client.getUrl() && !this.client.getClusterUrl()) {
            // set the default cluster url to use a secure connection
            this.client.setClusterUrl("https://ortc-developers.realtime.co/server/ssl/2.1");
        }
        // set the connected promise
        this.connectedReady = new Promise(function (resolve, reject) {
            _this.client.connect(appkey, token);
            _this.client.onConnected = function (client) {
                _this.reconnectedReady = new Promise(function (resolve, reject) {
                    // resolve onReconnected promise immediately until we
                    // start a reconnection loop
                    resolve();
                });
                // resolve the connected promise
                resolve();
            };
            _this.client.onException = function (client, exception) {
                // exception while connecting, reject the connected promise
                reject(exception);
            };
        });
    };
    // Get an observable for the connection events    
    ObservableConnection.prototype.observeConnection = function () {
        var _this = this;
        if (!this.connectionObservable) {
            // set the connection observable
            this.connectionObservable = _Rx.Observable.create(function (observer) {
                // handle the connection events 
                // and emit them through the subscribed observers
                _this.client.onSubscribed = function (client, channel) {
                    observer.next({ type: "SUBSCRIBED", channel: channel });
                };
                _this.client.onUnsubscribed = function (client, channel) {
                    observer.next({ type: "UNSUBSCRIBED", channel: channel });
                };
                _this.client.onException = function (client, exception) {
                    if (exception === "Invalid connection") {
                        // fatal connection error, stop the observable
                        observer.error("Invalid connection");
                    } else {
                        observer.next({ type: "EXCEPTION", exception: exception });
                    }
                };
                _this.client.onReconnecting = function (client) {
                    if (!_this.isReconnecting) {
                        // start a new reconnected promise 
                        // and save the resolve function for later usage (onReconnecting)
                        _this.reconnectedReady = new Promise(function (resolve, reject) {
                            _this.reconnectedResolveFn = resolve;
                        });
                        _this.isReconnecting = true;
                    }
                    observer.next({ type: "RECONNECTING" });
                };
                _this.client.onReconnected = function (client) {
                    observer.next({ type: "RECONNECTED" });
                    if (_this.reconnectedResolveFn) {
                        // resolve the reconnected promise created
                        // on the onReconnecting event
                        _this.reconnectedResolveFn();
                    }
                    _this.isReconnecting = false;
                };
                _this.client.onDisconnected = function (client) {
                    observer.next({ type: "DISCONNECTED" });
                };
            });
            this.connectionObservable.share();
        }
        return this.connectionObservable;
    };
    // Get a channel observable based on the Realtime subscribe method
    ObservableConnection.prototype.observeChannel = function (channel) {
        var _this = this;
        if (this.channels[channel] && this.channels[channel].withOptions) {
            console.error("Channel " + channel + " is already being subscribed with options. You can't mix subscription types over the same channel using the same Realtime connection");
            return;
        }
        if (!this.channels[channel]) {
            var channelObservable = new _Rx.Observable(function (observer) {
                _this.connectedReady.then(function () {
                    _this.reconnectedReady.then(function () {
                        _this.client.subscribe(channel, true, function (client, channel, msg) {
                            // emit received message to all channel observers
                            observer.next(msg);
                        });
                    });
                });
                return function () {
                    // no more channel observers
                    // we can unsubscribe from the Realtime channel
                    delete _this.channels[channel];
                    _this.client.unsubscribe(channel);
                };
            });
            // share the channel observable 
            // so we can handle multiple observers
            var sharedChannelObservable = channelObservable.share();
            // save the shared channel observable to return on future subscriptions
            this.channels[channel] = {
                observable: sharedChannelObservable,
                withOptions: false
            };
        }
        return this.channels[channel].observable;
    };
    // Get a channel observable using the Realtime subscribeWithOptions method
    ObservableConnection.prototype.observeChannelWithOptions = function (channel, subscriberId, filter, autoUnsubscribe) {
        var _this = this;
        if (autoUnsubscribe === void 0) {
            autoUnsubscribe = true;
        }
        if (this.channels[channel] && !this.channels[channel].withOptions) {
            console.error("Channel " + channel + " is already being subscribed without options. You can't mix subscription types over the same channel using the same Realtime connection");
            return;
        }
        var _channel = this.channels[channel];
        if (_channel && _channel.optionsKey !== subscriberId + "_" + filter + "_" + autoUnsubscribe) {
            console.error("Channel " + channel + " is already being subscribed with different options. You can't mix subscription options over the same channel using the same Realtime connection");
            return;
        }
        if (!_channel) {
            if (this.client.getIsConnected() && this.client.isSubscribed(channel)) {
                console.error("Channel " + channel + " is already being subscribed but has no observers. Probably you disabled autoUnsubscribe for this channel in some previous observerable");
                return;
            }
            // Create a new observable for the channel
            var channelObservable = new _Rx.Observable(function (observer) {
                _this.connectedReady.then(function () {
                    _this.reconnectedReady.then(function () {
                        var subscriptionOptions = {
                            channel: channel,
                            subscriberId: subscriberId,
                            filter: filter
                        };
                        _this.client.subscribeWithOptions(subscriptionOptions, function (client, messageOptions) {
                            // emit received message to all channel observers
                            observer.next(messageOptions);
                        });
                    });
                });
                return function () {
                    // no more observers for this channel
                    // we can unsubscribe from the Realtime channel if autoUnsubscribe is set
                    if (_this.channels[channel] && _this.channels[channel].autoUnsubscribe) {
                        _this.client.unsubscribe(channel);
                    }
                    delete _this.channels[channel];
                };
            });
            // share the channel observable 
            // so we can handle multiple observers
            var sharedChannelObservable = channelObservable.share();
            // save the shared channel observable to return on future subscriptions
            this.channels[channel] = {
                observable: sharedChannelObservable,
                withOptions: true,
                optionsKey: subscriberId + "_" + filter + "_" + autoUnsubscribe,
                autoUnsubscribe: autoUnsubscribe
            };
        }
        return this.channels[channel].observable;
    };
    // Sends a message to the channel
    ObservableConnection.prototype.send = function (channel, message) {
        var _this = this;
        this.connectedReady.then(function () {
            _this.reconnectedReady.then(function () {
                _this.client.send(channel, message);
            });
        });
    };
    ObservableConnection.prototype.publish = function (channel, message, ttl) {
        var _this = this;
        return _Rx.Observable.create(function (observer) {
            _this.connectedReady.then(function () {
                _this.reconnectedReady.then(function () {
                    _this.client.publish(channel, message, ttl, function (error, seqId) {
                        if (error) {
                            observer.error(error);
                        } else {
                            observer.next(seqId);
                        }
                    });
                });
            });
        });
    };
    // Disconnects from Realtime
    ObservableConnection.prototype.disconnect = function () {
        // clean up before disconnecting
        this.connectedReady = null;
        this.reconnectedReady = null;
        this.reconnectedResolveFn = null;
        delete this.channels;
        this.channels = {};
        this.client.disconnect();
    };
    return ObservableConnection;
}();
exports.ObservableConnection = ObservableConnection;
//# sourceMappingURL=realtime-rxjs.js.map
