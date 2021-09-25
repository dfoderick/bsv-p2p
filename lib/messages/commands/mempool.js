
const Message = require( '../message' );

const Buffer = require( 'buffer' ).Buffer;

/**
 * The mempool message sends a request to a node asking for information about
 * transactions it has verified but which have not yet confirmed.
 * @see https://en.bitcoin.it/wiki/Protocol_documentation#mempool
 * @param {Object} options
 * @extends Message
 * @constructor
 */
class MempoolMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'mempool';
  }
  setPayload () { };

  getPayload () {
    return Buffer.alloc( 0 );
  };
}

module.exports = MempoolMessage;
