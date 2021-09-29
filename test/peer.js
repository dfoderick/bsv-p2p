
// const chai = require('chai');
// const Net = require('net');
// const Socks5Client = require('socks5-client');

// /* jshint unused: false */
// const should = chai.should();
// const expect = chai.expect;
const sinon = require('sinon');
// const fs = require('fs');

const bsv = require('bsv');
// const _ = bsv.deps._;
const P2P = require('../');
const Peer = P2P.Peer;
const EventEmitter = require('events').EventEmitter;
const Messages = P2P.Messages;
const messages = new Messages();
const Networks = bsv.Networks;

describe('Peer', function() {

  // describe('Integration test', function() {
  //   it('parses this stream of data from a connection', function(callback) {
  //     const peer = new Peer('');
  //     const stub = sinon.stub();
  //     const dataCallback;
  //     const connectCallback;
  //     const expected = {
  //       version: 1,
  //       verack: 1,
  //       inv: 18,
  //       addr: 4
  //     };
  //     const received = {
  //       version: 0,
  //       verack: 0,
  //       inv: 0,
  //       addr: 0
  //     };
  //     stub.on = function() {
  //       if (arguments[0] === 'data') {
  //         dataCallback = arguments[1];
  //       }
  //       if (arguments[0] === 'connect') {
  //         connectCallback = arguments[1];
  //       }
  //     };
  //     stub.write = function() {};
  //     stub.connect = function() {
  //       connectCallback();
  //     };
  //     peer._getSocket = function() {
  //       return stub;
  //     };
  //     peer.on('connect', function() {
  //       dataCallback(fs.readFileSync('./test/data/connection.log'));
  //     });
  //     const check = function(message) {
  //       received[message.command]++;
  //       if (_.isEqual(received, expected)) {
  //         callback();
  //       }
  //     };
  //     peer.on('version', check);
  //     peer.on('verack', check);
  //     peer.on('addr', check);
  //     peer.on('inv', check);
  //     peer.connect();
  //   });
  // });

  it('create instance', function() {
    const peer = new Peer('localhost');
    peer.host.should.equal('localhost');
    peer.network.should.equal(Networks.livenet);
    peer.port.should.equal(Networks.livenet.port);
  });

  it('create instance setting a port', function() {
    const peer = new Peer({host: 'localhost', port: 8111});
    peer.host.should.equal('localhost');
    peer.network.should.equal(Networks.livenet);
    peer.port.should.equal(8111);
  });

  it('create instance setting a network', function() {
    const peer = new Peer({host: 'localhost', network: Networks.testnet});
    peer.host.should.equal('localhost');
    peer.network.should.equal(Networks.testnet);
    peer.port.should.equal(Networks.testnet.port);
  });

  it('create instance setting port and network', function() {
    const peer = new Peer({host: 'localhost', port: 8111, network: Networks.testnet});
    peer.host.should.equal('localhost');
    peer.network.should.equal(Networks.testnet);
    peer.port.should.equal(8111);
  });

  // it('create instance without new', function() {
  //   const peer = Peer({host: 'localhost', port: 8111, network: Networks.testnet});
  //   peer.host.should.equal('localhost');
  //   peer.network.should.equal(Networks.testnet);
  //   peer.port.should.equal(8111);
  // });

  // it('set a proxy', function() {
  //   const peer, peer2, socket;

  //   peer = new Peer('localhost');
  //   expect(peer.proxy).to.be.undefined();
  //   socket = peer._getSocket();
  //   socket.should.be.instanceof(Net.Socket);

  //   peer2 = peer.setProxy('127.0.0.1', 9050);
  //   peer2.proxy.host.should.equal('127.0.0.1');
  //   peer2.proxy.port.should.equal(9050);
  //   socket = peer2._getSocket();
  //   socket.should.be.instanceof(Socks5Client);

  //   peer.should.equal(peer2);
  // });

  it('send pong on ping', function(done) {
    const peer = new Peer({host: 'localhost'});
    const pingMessage = messages.Ping();
    peer.sendMessage = function(message) {
      message.command.should.equal('pong');
      message.nonce.should.equal(pingMessage.nonce);
      done();
    };
    peer.emit('ping', pingMessage);
  });

  it('relay error from socket', function(done) {
    const peer = new Peer({host: 'localhost'});
    const socket = new EventEmitter();
    socket.connect = sinon.spy();
    socket.destroy = sinon.spy();
    peer._getSocket = function() {
      return socket;
    };
    const error = new Error('error');
    peer.on('error', function(err) {
      err.should.equal(error);
      done();
    });
    peer.connect();
    peer.socket.emit('error', error);
  });

  it('will not disconnect twice on disconnect and error', function(done) {
    const peer = new Peer({host: 'localhost'});
    const socket = new EventEmitter();
    socket.connect = sinon.stub();
    socket.destroy = sinon.stub();
    peer._getSocket = function() {
      return socket;
    };
    peer.on('error', sinon.stub());
    peer.connect();
    let called = 0;
    peer.on('disconnect', function() {
      called++;
      called.should.not.be.above(1);
      done();
    });
    peer.disconnect();
    peer.socket.emit('error', new Error('fake error'));
  });

  it('disconnect with max buffer length', function(done) {
    const peer = new Peer({host: 'localhost'});
    const socket = new EventEmitter();
    socket.connect = sinon.spy();
    peer._getSocket = function() {
      return socket;
    };
    peer.disconnect = function() {
      done();
    };
    peer.connect();
    const buffer = Buffer.alloc(Peer.MAX_RECEIVE_BUFFER + 1);
    peer.socket.emit('data', buffer);

  });

  it('should send version on version if not already sent', function(done) {
    const peer = new Peer({host:'localhost'});
    const commands = {};
    peer.sendMessage = function(message) {
      commands[message.command] = true;
      if (commands.verack && commands.version) {
        done();
      }
    };
    peer.socket = {};
    peer.emit('version', {
      version: 'version',
      subversion: 'subversion',
      startHeight: 'startHeight'
    });
  });

  it('should not send version on version if already sent', function(done) {
    const peer = new Peer({host:'localhost'});
    peer.versionSent = true;
    peer.sendMessage = function(message) {
      message.command.should.not.equal('version');
      done();
    };
    peer.socket = {};
    peer.emit('version', {
      version: 'version',
      subversion: 'subversion',
      startHeight: 'startHeight'
    });
  });

  it('relay set properly', function() {
    const peer = new Peer({host: 'localhost'});
    peer.relay.should.equal(true);
    const peer2 = new Peer({host: 'localhost', relay: false});
    peer2.relay.should.equal(false);
    const peer3 = new Peer({host: 'localhost', relay: true});
    peer3.relay.should.equal(true);
  });

  // it('relay setting respected', function() {
  //   [true,false].forEach(function(relay) {
  //     const peer = new Peer({host: 'localhost', relay: relay});
  //     const peerSendMessageStub = sinon.stub(Peer.prototype, 'sendMessage', function(message) {
  //       message.relay.should.equal(relay);
  //     });
  //     peer._sendVersion();
  //     peerSendMessageStub.restore();
  //   });
  // });

});
