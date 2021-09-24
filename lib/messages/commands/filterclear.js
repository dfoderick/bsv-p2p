
const Message = require( '../message' );

const bsv = require( 'bsv' );
const Buffer = require( 'buffer' ).Buffer;

/**
 * Request peer to clear data for a bloom filter
 * @extends Message
 * @constructor
 */
class FilterclearMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'filterclear';
  }

  setPayload () { };

  getPayload () {
    return Buffer.alloc( 0 );
  };
}
module.exports = FilterclearMessage;
