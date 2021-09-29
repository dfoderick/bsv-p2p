
const Message = require( '../message' );

const bsv = require( 'bsv' );
const utils = require( '../utils' );
const $ = bsv.util.preconditions;
const _ = bsv.deps._;
const Buffer = require( 'buffer' ).Buffer;
const BufferReader = bsv.encoding.BufferReader;

/**
 * A message in response to a ping message.
 * @param {Number} arg - A nonce for the Pong message
 * @param {Object=} options
 * @extends Message
 * @constructor
 */
class PongMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'pong';
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
module.exports = PongMessage;
