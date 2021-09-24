# Peer
Represents a node from the p2p bitcoin network. The Peer class supports connecting directly to other nodes or through a socks5 proxy like Tor.

## Creating a peer
The code to create a new peer looks like this:

```javascript
const Peer = require('bitcore-p2p').Peer;

// default port
const livenetPeer = new Peer({host: '5.9.85.34'});
const testnetPeer = new Peer({host: '5.9.85.34', network: Networks.testnet});

// custom port
const livenetPeer = new Peer({host: '5.9.85.34', port: 8334});
const testnetPeer = new Peer({host: '5.9.85.34', port: 18334, network: Networks.testnet});

// use sock5 proxy (Tor)
const peer = new Peer({host: '5.9.85.34'}).setProxy('localhost', 9050);
```

## States
A peer instance is always in one of the following states:
- `disconnected`: No connection with the remote node.
- `connecting`: While establishing the connection.
- `connected`: Exchanging version packages.
- `ready`: Connection ready for sending and receiving messages.

You can subscribe to the change of those states as follows:

```javascript
const Peer = require('bitcore-p2p').Peer;

const peer = new Peer({host: '5.9.85.34'});

peer.on('ready', function() {
  // peer info
  console.log(peer.version, peer.subversion, peer.bestHeight);
});

peer.on('disconnect', function() {
  console.log('connection closed');
});

peer.connect();
```

## Handle messages
Once connected, a peer instance can send and receive messages. Every time a message arrives it's emitted as a new event. Let's see an example of this:

```javascript
const Peer = require('bitcore-p2p').Peer;
const peer = new Peer({host: '5.9.85.34'});

// handle events
peer.on('inv', function(message) {
  // message.inventory[]
});

peer.on('tx', function(message) {
  // message.transaction
});

peer.on('addr', function(message) {
  // message.addresses[]
});

peer.connect();
```

## Sending messages
In order to send messages the Peer class offers the `sendMessage(message)` method, which receives an instance of a message. All supported messages can be found in the `Messages` module. For more information about messages refer to the [protocol specification](https://en.bitcoin.it/wiki/Protocol_specification).

An example for requesting other connected nodes to a peers looks like this:

```javascript
const p2p = require('bitcore-p2p')
const Peer = p2p.Peer;
const Messages = p2p.Messages;
const peer = new Peer({host: '5.9.85.34'});

peer.on('ready', function() {
  const message = new Messages.GetAddresses();
  peer.sendMessage(message);
});

peer.on('addr', function(message) {
  message.addresses.forEach(function(address) {
    // do something
  });
});

peer.connect();
```
