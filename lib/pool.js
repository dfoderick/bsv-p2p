const dns = require( 'dns' );
const EventEmitter = require( 'eventemitter3' );
const bsv = require( 'bsv' );
const Buffer = require( 'buffer' ).Buffer;
const sha256 = bsv.crypto.Hash.sha256;
const Peer = require( './peer' );
const Networks = bsv.Networks;
const net = require( 'net' );
const { subversions } = require( './versions' )

function now () {
  return Math.floor( new Date().getTime() / 1000 );
}

/**
 * A pool is a collection of Peers. A pool will discover peers from DNS seeds, and
 * collect information about new peers in the network. When a peer disconnects the pool
 * will connect to others that are available to maintain a max number of
 * ongoing peer connections. Peer events are relayed to the pool.
 *
 * @example
 * ```javascript
 *
 * const pool = new Pool({network: Networks.livenet});
 * pool.on('peerinv', function(peer, message) {
 *   // do something with the inventory announcement
 * });
 * pool.connect();
 * ```
 *
 * @param {Object=} options
 * @param {Network=} options.network - The network configuration
 * @param {Boolean=} options.listenAddr - Prevent new peers being added from addr messages
 * @param {Array=} options.dnsSeeds - seed array with DNS discovered known peers
 * @param {Boolean=} options.relay - Prevent inventory announcements until a filter is loaded
 * @param {Number=} options.maxSize - The max number of peers
 * @returns {Pool}
 * @constructor
 */

class Pool extends EventEmitter {

  constructor ( options ) {
    super()

    options = options || {};
    this.keepalive = false;

    this._connectedPeers = {};
    this._addrs = [];

    this.listenAddr = options.listenAddr !== false;
    this.dnsSeeds = options.dnsSeeds ? options.dnsSeeds : false;
    this.maxSize = options.maxSize || Pool.MaxConnectedPeers;
    this.messages = options.messages;
    this.network = Networks.get( options.network ) || Networks.defaultNetwork;
    this.relay = options.relay === false ? false : true;

    if ( options.addrs ) {
      for ( let i = 0; i < options.addrs.length; i++ ) {
        this._addAddr( options.addrs[ i ] );
      }
    }

    if ( this.listenAddr ) {
      this.on( 'peeraddr', ( peer, message ) => {
        const addrs = message.addresses;
        const length = addrs.length;
        for ( let i = 0; i < length; i++ ) {
          const addr = addrs[ i ];
          const future = new Date().getTime() + ( 10 * 60 * 1000 );
          if ( addr.time.getTime() <= 100000000000 || addr.time.getTime() > future ) {
            // In case of an invalid time, assume "5 days ago"
            const past = new Date( new Date().getTime() - 5 * 24 * 60 * 60 * 1000 );
            addr.time = past;
          }
          this._addAddr( addr );
        }
      } );
    }

    this.on( 'seed', ( ips ) => {
      ips.forEach( ( ip ) => {
        this._addAddr( {
          ip: {
            v4: ip
          }
        } );
      } );
      if ( this.keepalive ) {
        this._fillConnections();
      }
    } );

    this.on( 'peerdisconnect', ( peer, addr ) => {
      this._deprioritizeAddr( addr );
      this._removeConnectedPeer( addr );
      if ( this.keepalive ) {
        this._fillConnections();
      }
    } );

    return this;

  }

  /**
   * Will initiate connection to peers, if available peers have been added to
   * the pool, it will connect to those, otherwise will use DNS seeds to find
   * peers to connect. When a peer disconnects it will add another.
   */
  connect () {
    this.keepalive = true;
    if ( this.dnsSeeds ) {
      this._addAddrsFromSeeds();
    } else {
      this._fillConnections();
    }
    return this;
  };

  /**
   * Will disconnect all peers that are connected.
   */
  disconnect () {
    this.keepalive = false;
    for ( let key in Object.keys( this._connectedPeers ) ) {
      const peer = this._connectedPeers[ key ];
      if ( peer ) {
        peer.disconnect();
      }
    }
    return this;
  };

  /**
   * @returns {Number} The number of peers currently connected.
   */
  numberConnected () {
    return Object.keys( this._connectedPeers ).length;
  };

  /**
   * Will fill the connected peers to the maximum amount.
   */
  _fillConnections () {
    const length = this._addrs.length;
    for ( let i = 0; i < length; i++ ) {
      if ( this.numberConnected() >= this.maxSize ) {
        break;
      }
      const addr = this._addrs[ i ];
      if ( !addr.retryTime || now() > addr.retryTime ) {
        this._connectPeer( addr );
      }
    }
    return this;
  };

  /**
   * Will remove a peer from the list of connected peers.
   * @param {Object} addr - An addr from the list of addrs
   */
  _removeConnectedPeer ( addr ) {
    if ( this._connectedPeers[ addr.hash ].status !== Peer.STATUS.DISCONNECTED ) {
      this._connectedPeers[ addr.hash ].disconnect();
    } else {
      delete this._connectedPeers[ addr.hash ];
    }
    return this;
  };

  /**
   * Will connect a peer and add to the list of connected peers.
   * @param {Object} addr - An addr from the list of addrs
   */
  _connectPeer ( addr ) {
    if ( !this._connectedPeers[ addr.hash ] ) {
      const port = addr.port || this.network.port;
      const ip = addr.ip.v4 || addr.ip.v6;
      const peer = new Peer( {
        host: ip,
        port: port,
        messages: this.messages,
        network: this.network,
        relay: this.relay
      } );

      peer.on( 'connect', () => {
        this.emit( 'peerconnect', peer, addr );
      } );

      this._addPeerEventHandlers( peer, addr );
      peer.connect();
      this._connectedPeers[ addr.hash ] = peer;
    }

    return this;
  };

  /**
   * Adds a peer with a connected socket to the _connectedPeers object, and
   * initializes the associated event handlers.
   * @param {Socket} - socket - A new connected socket
   * @param {Object} - addr - The associated addr object for the peer
   */
  _addConnectedPeer ( socket, addr ) {
    if ( !this._connectedPeers[ addr.hash ] ) {
      const peer = new Peer( {
        socket: socket,
        network: this.network,
        messages: this.messages
      } );

      this._addPeerEventHandlers( peer, addr );
      this._connectedPeers[ addr.hash ] = peer;
      this.emit( 'peerconnect', peer, addr );
    }

    return this;
  };

  /**
   * Will add disconnect and ready events for a peer and intialize
   * handlers for relay peer message events.
   */
  _addPeerEventHandlers ( peer, addr ) {
    peer.on( 'disconnect', () => {
      this.emit( 'peerdisconnect', peer, addr );
    } );
    peer.on( 'ready', () => {
      if ( !subversions.includes( peer.subversion ) ) {
        peer.disconnect();
        delete this._connectedPeers[ addr.hash ];
        for ( let i = 0; i < this._addrs.length; i++ ) {
          if ( this._addrs[ i ].hash === addr.hash ) {
            const beginning = this._addrs.splice( 0, i );
            const end = this._addrs.splice( i + 1, this._addrs.length );
            this._addrs = beginning.concat( end );
          }
        }
      } else {
        this.emit( 'peerready', peer, addr );
      }
    } );
    Pool.PeerEvents.forEach( ( event ) => {
      peer.on( event, ( message ) => {
        this.emit( 'peer' + event, peer, message );
      } );
    } );
  };

  /**
   * Will deprioritize an addr in the list of addrs by moving it to the end
   * of the array, and setting a retryTime
   * @param {Object} addr - An addr from the list of addrs
   */
  _deprioritizeAddr ( addr ) {
    for ( let i = 0; i < this._addrs.length; i++ ) {
      if ( this._addrs[ i ].hash === addr.hash ) {
        const middle = this._addrs[ i ];
        middle.retryTime = now() + Pool.RetrySeconds;
        const beginning = this._addrs.splice( 0, i );
        const end = this._addrs.splice( i + 1, this._addrs.length );
        const combined = beginning.concat( end );
        this._addrs = combined.concat( [ middle ] );
      }
    }
    return this;
  };

  /**
   * Will add an addr to the beginning of the addrs array
   * @param {Object}
   */
  _addAddr ( addr ) {
    // Use default port if not specified
    addr.port = addr.port || this.network.port;

    // make a unique key
    addr.hash = sha256( Buffer.from( addr.ip.v6 + addr.ip.v4 + addr.port ) ).toString( 'hex' );

    const length = this._addrs.length;
    let exists = false;
    for ( let i = 0; i < length; i++ ) {
      if ( this._addrs[ i ].hash === addr.hash ) {
        exists = true;
      }
    }
    if ( !exists ) {
      this._addrs.unshift( addr );
    }
    return addr;
  };

  /**
   * Will add addrs to the list of addrs from a DNS seed
   * @param {String} seed - A domain name to resolve known peers
   * @param {Function} done
   */
  _addAddrsFromSeed ( seed ) {
    dns.resolve( seed, ( err, ips ) => {
      if ( err ) {
        this.emit( 'seederror', err );
        return;
      }
      if ( !ips || !ips.length ) {
        this.emit( 'seederror', new Error( 'No IPs found from seed lookup.' ) );
        return;
      }
      // announce to pool
      this.emit( 'seed', ips );
    } );
    return this;
  };

  /**
   * Will add addrs to the list of addrs from network DNS seeds
   * @param {Function} done
   */
  _addAddrsFromSeeds () {
    const seeds = this.dnsSeeds;// || this.network.dnsSeeds;
    seeds.forEach( ( seed ) => {
      this._addAddrsFromSeed( seed );
    } );
    return this;
  };

  /**
   * @returns {String} A string formatted for the console
   */
  inspect () {
    return '<Pool network: ' +
      this.network + ', connected: ' +
      this.numberConnected() + ', available: ' +
      this._addrs.length + '>';
  };

  /**
   * Will send a message to all of the peers in the pool.
   * @param {Message} message - An instance of the message to send
   */
  sendMessage ( message ) {
    // broadcast to peers
    for ( let key in Object.keys( this._connectedPeers ) ) {
      const peer = this._connectedPeers[ key ];
      if ( peer ) {
        peer.sendMessage( message );
      }
    }
  };

  /**
   * Will enable a listener for peer connections, when a peer connects
   * it will be added to the pool.
   */
  listen () {
    // Create server
    this.server = net.createServer( ( socket ) => {
      let addr = {
        ip: {}
      };
      if ( net.isIPv6( socket.remoteAddress ) ) {
        addr.ip.v6 = socket.remoteAddress;
      } else {
        addr.ip.v4 = socket.remoteAddress;
      }
      addr.port = socket.remotePort;

      addr = this._addAddr( addr );
      this._addConnectedPeer( socket, addr );
    } );
    this.server.listen( this.network.port );
  };

}

Pool.MaxConnectedPeers = 8;
Pool.RetrySeconds = 30;
Pool.PeerEvents = [ 'version', 'inv', 'getdata', 'ping', 'pong', 'addr',
  'getaddr', 'verack', 'reject', 'alert', 'headers', 'block', 'merkleblock',
  'protoconf', 'tx', 'getblocks', 'getheaders', 'error', 'filterload', 'filteradd',
  'filterclear', 'notfound'
];


module.exports = Pool;
