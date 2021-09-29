
const Message = require( '../message' );

const Buffer = require( 'buffer' ).Buffer;

/**
 * Request information about active peers
 * @extends Message
 * @param {Object} options
 * @constructor
 */
class GetaddrMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'getaddr';
  }

  setPayload () { };

  getPayload () {
    return Buffer.alloc( 32, 0 );
  };
}
module.exports = GetaddrMessage;
