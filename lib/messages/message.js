const bsv = require( 'bsv' );
const $ = bsv.util.preconditions;
const Buffer = require( 'buffer' ).Buffer;
const BufferWriter = bsv.encoding.BufferWriter;
const Hash = bsv.crypto.Hash;

/**
 * Base message that can be inherited to add an additional
 * `getPayload` method to modify the message payload.
 * @param {Object=} options
 * @param {String=} options.command
 * @param {Network=} options.network
 * @constructor
 */
class Message {
  constructor ( options ) {
    this.command = options.command;
    this.network = options.network;
  }

  /**
   * @returns {Buffer} - Serialized message
   * @constructor
   */
  toBuffer () {
    $.checkState( this.network, 'Need to have a defined network to serialize message' );
    const commandBuf = Buffer.from( Array( 12 ) );
    commandBuf.write( this.command, 'ascii' );

    const payload = this.getPayload();
    const checksum = Hash.sha256sha256( payload ).slice( 0, 4 );

    const bw = new BufferWriter();
    bw.write( this.network.networkMagic );
    bw.write( commandBuf );
    bw.writeUInt32LE( payload.length );
    bw.write( checksum );
    bw.write( payload );

    return bw.concat();
  };
  serialize = this.toBuffer
}
module.exports = Message;
