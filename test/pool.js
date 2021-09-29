
const chai = require('chai');

/* jshint unused: false */
const should = chai.should();
const expect = chai.expect;

const bsv = require('bsv');
const P2P = require('../');
const Peer = P2P.Peer;
const Pool = P2P.Pool;
const Networks = bsv.Networks;

const sinon = require('sinon');

// function getPayloadBuffer(messageBuffer) {
//   return Buffer.from(messageBuffer.slice(48), 'hex');
// }

describe('Pool', function() {

  it('create instance', function() {
    const pool = new Pool();
    should.exist(pool.network);
    expect(pool.network).to.satisfy(function(network) {
      return network === Networks.testnet || network === Networks.livenet;
    });
  });

  it('create instance setting the network', function() {
    const pool = new Pool({network: Networks.testnet});
    pool.network.should.equal(Networks.testnet);
  });

  // it('discover peers via dns', function() {
  //   const stub = sinon.stub(dns, 'resolve', function(seed, callback) {
  //     callback(null, ['10.10.10.1', '10.10.10.2', '10.10.10.3']);
  //   });
  //   const pool = new Pool({network: Networks.livenet});
  //   pool.connect();
  //   pool.disconnect();
  //   pool._addrs.length.should.equal(3);
  //   stub.restore();
  // });

  // it('optionally connect without dns seeds', function() {
  //   sinon.stub(Peer.prototype, 'connect', function() {
  //     this.socket = {
  //       destroy: sinon.stub()
  //     };
  //   });
  //   const stub = sinon.stub(dns, 'resolve', function(seed, callback) {
  //     throw new Error('DNS should not be called');
  //   });
  //   const options = {
  //     network: Networks.livenet,
  //     dnsSeed: false,
  //     maxSize: 1,
  //     addrs: [
  //       {
  //         ip: {
  //           v4: 'localhost'
  //         }
  //       },
  //       {
  //         ip: {
  //           v4: 'localhost2'
  //         }
  //       }
  //     ]
  //   };
  //   const pool = new Pool(options);
  //   pool.connect();
  //   pool.disconnect();
  //   pool._addrs.length.should.equal(2);
  //   stub.restore();
  //   Peer.prototype.connect.restore();
  // });

  it('will add addrs via options argument', function() {
    const options = {
      network: Networks.livenet,
      dnsSeed: false,
      addrs: [
        {
          ip: {
            v4: 'localhost'
          }
        }
      ]
    };
    const pool = new Pool(options);
    pool._addrs.length.should.equal(1);
  });

  // it('add new addrs as they are announced over the network', function(done) {

  //   // only emit an event, no need to connect
  //   const peerConnectStub = sinon.stub(Peer.prototype, 'connect', function() {
  //     this._readMessage();
  //     this.emit('ready');
  //   });

  //   // mock a addr peer event
  //   const peerMessageStub = sinon.stub(Peer.prototype, '_readMessage', function() {
  //     const payloadBuffer = getPayloadBuffer(MessagesData.addr.message);
  //     const message = messages._buildFromBuffer('addr', payloadBuffer);
  //     this.emit(message.command, message);
  //   });

  //   const options = {
  //     network: Networks.testnet,
  //     dnsSeed: false,
  //     addrs: [
  //       {
  //         ip: {
  //           v4: 'localhost'
  //         }
  //       }
  //     ]
  //   };

  //   const pool = new Pool(options);

  //   // listen for the event
  //   pool.on('peeraddr', function(peer, message) {
  //     pool._addrs.length.should.equal(502);

  //     // restore stubs
  //     peerConnectStub.restore();
  //     peerMessageStub.restore();

  //     for (let i = 0; i < pool._addrs.length; i++) {
  //       should.exist(pool._addrs[i].hash);
  //       should.exist(pool._addrs[i].ip);
  //       should.exist(pool._addrs[i].ip.v4);
  //     }

  //     // done
  //     done();
  //   });

  //   pool.connect();

  // });

  // it('can optionally not listen to new addrs messages', function(done) {

  //   // only emit an event, no need to connect
  //   const peerConnectStub = sinon.stub(Peer.prototype, 'connect', function() {
  //     this._readMessage();
  //     this.emit('ready');
  //   });

  //   // mock a addr peer event
  //   const peerMessageStub = sinon.stub(Peer.prototype, '_readMessage', function() {
  //     const payloadBuffer = getPayloadBuffer(MessagesData.addr.message);
  //     const message = messages._buildFromBuffer('addr', payloadBuffer);
  //     this.emit(message.command, message);
  //   });

  //   const options = {
  //     network: Networks.testnet,
  //     dnsSeed: false,
  //     listenAddr: false,
  //     addrs: [
  //       {
  //         ip: {
  //           v4: 'localhost'
  //         }
  //       }
  //     ]
  //   };

  //   const pool = new Pool(options);

  //   // listen for the event
  //   pool.on('peeraddr', function(peer, message) {
  //     pool._addrs.length.should.equal(1);

  //     // restore stubs
  //     peerConnectStub.restore();
  //     peerMessageStub.restore();

  //     for (let i = 0; i < pool._addrs.length; i++) {
  //       should.exist(pool._addrs[i].hash);
  //       should.exist(pool._addrs[i].ip);
  //       should.exist(pool._addrs[i].ip.v4);
  //     }

  //     // done
  //     done();
  //   });

  //   pool.connect();

  // });

  // it('propagate connect, ready, and disconnect peer events', function(done) {
  //   const peerConnectStub = sinon.stub(Peer.prototype, 'connect', function() {
  //     this.emit('connect', this, {});
  //     this.emit('ready');
  //   });
  //   const peerDisconnectStub = sinon.stub(Peer.prototype, 'disconnect', function() {
  //     this.emit('disconnect', this, {});
  //   });
  //   const poolRemoveStub = sinon.stub(Pool.prototype, '_removeConnectedPeer', function() {});

  //   const pool = new Pool({
  //     dnsSeed: false,
  //     addrs: [
  //       {
  //         ip: {
  //           v4: 'localhost'
  //         }
  //       }
  //     ]
  //   });

  //   const poolDisconnectStub;
  //   pool.on('peerconnect', function(peer, addr) {
  //     pool.on('peerready', function(peer, addr) {
  //       // disconnect when the peer is ready
  //       poolDisconnectStub = sinon.stub(Pool.prototype, 'disconnect', function() {
  //         peer.disconnect();
  //       });
  //       pool.disconnect();
  //     });
  //   });
  //   pool.on('peerdisconnect', function(peer, addr) {
  //     // Restore stubs
  //     peerConnectStub.restore();
  //     peerDisconnectStub.restore();
  //     poolDisconnectStub.restore();
  //     poolRemoveStub.restore();

  //     // done
  //     done();
  //   });

  //   pool.connect();
  // });

  // it('propagate relay property to peers', function(done) {
  //   const count = 0;
  //   const peerConnectStub = sinon.stub(Peer.prototype, 'connect', function() {
  //     this.emit('connect', this, {});
  //   });
  //   [true, false].forEach(function(relay) {
  //     const pool = new Pool({relay: relay, dnsSeed: false});
  //     pool._addAddr({ ip: { v4: 'localhost' } });
  //     pool.on('peerconnect', function(peer, addr) {
  //       peer.relay.should.equal(relay);
  //       pool.disconnect();
  //       if(++count == 2) {
  //         done();
  //       }
  //     });
  //     pool.connect();
  //   });
  //   peerConnectStub.restore();
  // });

  it('output the console correctly', function() {
    const pool = new Pool();
    pool.inspect().should.equal('<Pool network: livenet, connected: 0, available: 0>');
  });

  // it('emit seederrors with error', function(done) {
  //   const dnsStub = sinon.stub(dns, 'resolve', function(seed, callback) {
  //     callback(new Error('A DNS error'));
  //   });
  //   const pool = new Pool({network: Networks.livenet, maxSize: 1});
  //   pool.once('seederror', function(error) {
  //     should.exist(error);
  //     pool.disconnect();
  //     dnsStub.restore();
  //     done();
  //   });
  //   pool.connect();
  // });

  // it('emit seederrors with notfound', function(done) {
  //   const dnsStub = sinon.stub(dns, 'resolve', function(seed, callback) {
  //     callback(null, []);
  //   });
  //   const pool = new Pool({network: Networks.livenet, maxSize: 1});
  //   pool.once('seederror', function(error) {
  //     should.exist(error);
  //     pool.disconnect();
  //     dnsStub.restore();
  //     done();
  //   });
  //   pool.connect();
  // });

  // it('send message to all peers', function(done) {
  //   const message = 'message';
  //   sinon.stub(Peer.prototype, 'connect', function() {
  //     this.socket = {
  //       destroy: sinon.stub()
  //     };
  //     const self = this;
  //     process.nextTick(function() {
  //       self.emit('ready');
  //     });
  //   });
  //   sinon.stub(Peer.prototype, 'sendMessage', function(message) {
  //     message.should.equal(message);
  //     Peer.prototype.connect.restore();
  //     Peer.prototype.sendMessage.restore();
  //     pool.disconnect();
  //     done();
  //   });
  //   const pool = new Pool({
  //     network: Networks.livenet,
  //     maxSize: 1,
  //     dnsSeed: false,
  //     addrs: [
  //       {
  //         ip:{
  //           v4: 'localhost'
  //         }
  //       }
  //     ]
  //   });
  //   pool.on('peerready', function() {
  //     pool.sendMessage(message);
  //   });
  //   pool.connect();
  // });

  it('not call _fillConnections if keepalive is false on seed', function(done) {
    const pool = new Pool({network: Networks.livenet, maxSize: 1});
    pool._fillConnections = sinon.stub();
    pool.keepalive = false;
    pool.on('seed', function() {
      process.nextTick(function() {
        pool._fillConnections.called.should.equal(false);
        done();
      });
    });
    pool.emit('seed', []);
  });

  it('keep original time for handling peeraddr messages', function(done) {
    const pool = new Pool({network: Networks.livenet, maxSize: 1});
    const now = new Date();
    pool._addAddr = function(addr) {
      addr.time.should.equal(now);
      done();
    };
    pool.emit('peeraddr', {}, {
      addresses: [
        {
          time: now
        }
      ]
    });
  });

  it('replace time if time is invalid on peeraddr messages', function(done) {
    const pool = new Pool({network: Networks.livenet, maxSize: 1});
    const future = new Date(new Date().getTime() + 10 * 70 * 1000);
    const past = new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago
    pool._addAddr = function(addr) {
      addr.time.should.not.equal(future);
      addr.time.getTime().should.be.below(past.getTime());
      done();
    };
    pool.emit('peeraddr', {}, {
      addresses: [
        {
          time: future
        }
      ]
    });
  });

  describe('#_removeConnectedPeer', function() {
    it('disconnect peer if peer status is not disconnected', function(done) {
      const pool = new Pool({network: Networks.livenet, maxSize: 1});
      /* jshint sub: true */
      pool._connectedPeers['hash'] = {
        status: Peer.STATUS.CONNECTED,
        disconnect: function() {
          done();
        }
      };
      pool._removeConnectedPeer({
        hash: 'hash'
      });
    });
  });

  describe('#_connectPeer', function() {
    it('connect ipv6 peer', function() {
      const connectStub = sinon.stub(Peer.prototype, 'connect');
      const pool = new Pool({network: Networks.livenet, maxSize: 1});
      const ipv6 = '2001:0db8:85a3:0042:1000:8a2e:0370:7334';
      pool._addPeerEventHandlers = sinon.stub();
      pool._connectPeer({
        ip: {
          v6: ipv6
        },
        hash: 'hash'
      });
      /* jshint sub: true */
      should.exist(pool._connectedPeers['hash']);
      pool._addPeerEventHandlers.calledOnce.should.equal(true);
      Peer.prototype.connect.calledOnce.should.equal(true);
      connectStub.restore();
    });

    it('will pass network to peer', function() {
      const connectStub = sinon.stub(Peer.prototype, 'connect');
      const pool = new Pool({network: Networks.testnet, maxSize: 1});
      const ipv6 = '2001:0db8:85a3:0042:1000:8a2e:0370:7334';
      pool._addPeerEventHandlers = sinon.stub();
      pool._connectPeer({
        ip: {
          v6: ipv6
        },
        hash: 'hash'
      });
      /* jshint sub: true */
      pool._connectedPeers['hash'].network.should.equal(pool.network);
      connectStub.restore();
    });
  });

  describe('#_addConnectedPeer', function() {

    it('should add a peer', function() {
      /* jshint sub: true */
      const pool = new Pool({network: Networks.livenet, maxSize: 1});
      pool._addPeerEventHandlers = sinon.stub();
      pool._addConnectedPeer({
        on: sinon.stub()
      }, {hash: 'hash'});
      should.exist(pool._connectedPeers['hash']);
      pool._addPeerEventHandlers.calledOnce.should.equal(true);
    });

    it('should not already added peer', function() {
      /* jshint sub: true */
      const pool = new Pool({network: Networks.livenet, maxSize: 1});
      pool._addPeerEventHandlers = sinon.stub();
      pool._connectedPeers['hash'] = {};
      pool._addConnectedPeer({
        on: sinon.stub()
      }, {hash: 'hash'});
      should.exist(pool._connectedPeers['hash']);
      pool._addPeerEventHandlers.calledOnce.should.equal(false);
    });

    it('will pass network to peer', function() {
      /* jshint sub: true */
      const pool = new Pool({network: Networks.testnet, maxSize: 1});
      pool._addConnectedPeer({
        on: sinon.stub()
      }, {hash: 'hash'});
      should.exist(pool._connectedPeers['hash']);
      pool._connectedPeers['hash'].network.should.equal(pool.network);
    });

  });

  // describe('#listen', function() {

  //   it('create a server', function(done) {
  //     const netStub = sinon.stub(net, 'createServer', function() {
  //       return {
  //         listen: function() {
  //           netStub.restore();
  //           done();
  //         }
  //       };
  //     });
  //     const pool = new Pool({network: Networks.livenet, maxSize: 1});
  //     pool.listen();
  //   });

  //   it('should handle an ipv6 connection', function(done) {
  //     const ipv6 = '2001:0db8:85a3:0042:1000:8a2e:0370:7334';
  //     sinon.stub(net, 'createServer', function(callback) {
  //       callback({
  //         remoteAddress: ipv6
  //       });
  //       return {
  //         listen: sinon.stub()
  //       };
  //     });
  //     sinon.stub(net, 'isIPv6', function() {
  //       return true;
  //     });
  //     const pool = new Pool({network: Networks.livenet, maxSize: 1});
  //     pool._addAddr = function(addr) {
  //       should.exist(addr.ip.v6);
  //       addr.ip.v6.should.equal(ipv6);
  //       net.isIPv6.restore();
  //       net.createServer.restore();
  //       done();
  //     };
  //     pool._addConnectedPeer = sinon.stub();
  //     pool.listen();
  //   });

  //   it('include port for addr on incoming connections', function(done) {
  //     const port = 12345;
  //     sinon.stub(net, 'createServer', function(callback) {
  //       callback({
  //         remoteAddress: '127.0.0.1',
  //         remotePort: port
  //       });
  //       return {
  //         listen: sinon.stub()
  //       };
  //     });
  //     const pool = new Pool({network: Networks.livenet, maxSize: 1});
  //     pool._addAddr = function(addr) {
  //       should.exist(addr.port);
  //       addr.port.should.equal(port);
  //       net.createServer.restore();
  //       done();
  //     };
  //     pool._addConnectedPeer = sinon.stub();
  //     pool.listen();
  //   });

  //   it('should handle an ipv4 connection', function(done) {
  //     const ipv4 = '127.0.0.1';
  //     sinon.stub(net, 'createServer', function(callback) {
  //       callback({
  //         remoteAddress: ipv4
  //       });
  //       return {
  //         listen: sinon.stub()
  //       };
  //     });
  //     sinon.stub(net, 'isIPv6', function() {
  //       return false;
  //     });
  //     const pool = new Pool({network: Networks.livenet, maxSize: 1});
  //     pool._addAddr = function(addr) {
  //       should.exist(addr.ip.v4);
  //       addr.ip.v4.should.equal(ipv4);
  //       net.isIPv6.restore();
  //       net.createServer.restore();
  //       done();
  //     };
  //     pool._addConnectedPeer = sinon.stub();
  //     pool.listen();
  //   });

  // });


});
