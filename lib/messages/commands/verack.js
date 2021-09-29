
const Message = require( '../message' );

const Buffer = require( 'buffer' ).Buffer;

/**
 * A message in response to a version message.
 * @extends Message
 * @constructor
 */
class VerackMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'verack';
  }
  setPayload () { };

  getPayload () {
    return Buffer.alloc( 0 );
  };

}
module.exports = VerackMessage;
