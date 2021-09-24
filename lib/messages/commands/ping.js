
const Message = require( '../message' );

const bsv = require( 'bsv' );
const utils = require( '../utils' );
const $ = bsv.util.preconditions;
const _ = bsv.deps._;
const Buffer = require( 'buffer' ).Buffer;
const BufferReader = bsv.encoding.BufferReader;

/**
 * A message to confirm that a connection is still valid.
 * @param {Number} arg - A nonce for the Ping message
 * @param {Object=} options
 * @extends Message
 * @constructor
 */
class PingMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'ping';
    $.checkArgument(
      _.isUndefined( arg ) || ( Buffer.isBuffer( arg ) && arg.length === 8 ),
      'First argument is expected to be an 8 byte buffer'
    );
    this.nonce = arg || utils.getNonce();
  }
  setPayload ( payload ) {
    const parser = new BufferReader( payload );
    this.nonce = parser.read( 8 );

    utils.checkFinished( parser );
  };

  getPayload () {
    return this.nonce;
  };
}

module.exports = PingMessage;
