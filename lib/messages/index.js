const bsv = require( 'bsv' );
const Networks = bsv.Networks;
const Buffer = require( 'buffer' ).Buffer;
const Hash = bsv.crypto.Hash;
const $ = bsv.util.preconditions;

/**
 * A factory to build Bitcoin protocol messages.
 * @param {Object=} options
 * @param {Network=} options.network
 * @param {Function=} options.Block - A block constructor
 * @param {Function=} options.BlockHeader - A block header constructor
 * @param {Function=} options.MerkleBlock - A merkle block constructor
 * @param {Function=} options.Transaction - A transaction constructor
 * @constructor
 */
class Messages {
  constructor ( options ) {
    this.builder = Messages.builder( options );

    // map message constructors by name
    for ( let key in this.builder.commandsMap ) {
      const name = this.builder.commandsMap[ key ];
      this[ name ] = this.builder.commands[ key ];
    }

    if ( !options ) {
      options = {};
    }
    this.network = options.network || Networks.defaultNetwork;
  }


  /**
   * @param {Buffers} dataBuffer
   */
  parseBuffer ( dataBuffer ) {
    /* jshint maxstatements: 18 */
    if ( dataBuffer.length < Messages.MINIMUM_LENGTH ) {
      return;
    }

    // Search the next magic number
    if ( !this._discardUntilNextMessage( dataBuffer ) ) {
      return;
    }

    const payloadLen = ( dataBuffer.get( Messages.PAYLOAD_START ) ) +
      ( dataBuffer.get( Messages.PAYLOAD_START + 1 ) << 8 ) +
      ( dataBuffer.get( Messages.PAYLOAD_START + 2 ) << 16 ) +
      ( dataBuffer.get( Messages.PAYLOAD_START + 3 ) << 24 );

    const messageLength = 24 + payloadLen;
    if ( dataBuffer.length < messageLength ) {
      return;
    }

    const command = dataBuffer.slice( 4, 16 ).toString( 'ascii' ).replace( /\0+$/, '' );
    const payload = dataBuffer.slice( 24, messageLength );
    const checksum = dataBuffer.slice( 20, 24 );

    const checksumConfirm = Hash.sha256sha256( payload ).slice( 0, 4 );
    const buf1 = Buffer.from( checksumConfirm );
    const buf2 = Buffer.from( checksum );

    if ( !buf1.equals( buf2 ) ) {
      dataBuffer.skip( messageLength );
      return;
    }

    dataBuffer.skip( messageLength );
    try {
      return this._buildFromBuffer( command, payload );
    } catch ( e ) {
      console.log( e.message | e )
      return
    }
  };

  _discardUntilNextMessage ( dataBuffer ) {
    $.checkArgument( dataBuffer );
    $.checkState( this.network, 'network must be set' );
    let i = 0;
    for ( ; ; ) {
      // check if it's the beginning of a new message
      const packageNumber = dataBuffer.slice( 0, 4 ).toString( 'hex' );
      if ( packageNumber === this.network.networkMagic.toString( 'hex' ) ) {
        dataBuffer.skip( i );
        return true;
      }

      // did we reach the end of the buffer?
      if ( i > ( dataBuffer.length - 4 ) ) {
        dataBuffer.skip( i );
        return false;
      }

      i++; // continue scanning
    }
  };

  _buildFromBuffer ( command, payload ) {
    if ( !this.builder.commands[ command ] ) {
      throw new Error( 'Unsupported message command: ' + command );
    }
    return this.builder.commands[ command ].fromBuffer( payload );
  };

  add ( key, name, Command ) {
    this.builder.add( key, Command );
    this[ name ] = this.builder.commands[ key ];
  };

}

Messages.MINIMUM_LENGTH = 20;
Messages.PAYLOAD_START = 16;
Messages.Message = require( './message' );
Messages.builder = require( './builder' );

module.exports = Messages;
