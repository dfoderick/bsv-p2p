
const Message = require( '../message' );

const bsv = require( 'bsv' );
const Buffer = require( 'buffer' ).Buffer;
const BloomFilter = require( '../../bloomfilter' );
const $ = bsv.util.preconditions;
const _ = bsv.deps._;

/**
 * Request peer to send inv messages based on a bloom filter
 * @param {BloomFilter=} arg - An instance of BloomFilter
 * @param {Object} options
 * @extends Message
 * @constructor
 */
class FilterloadMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'filterload';
    $.checkArgument(
      _.isUndefined( arg ) || arg instanceof BloomFilter,
      'An instance of BloomFilter or undefined is expected'
    );
    this.filter = arg;
  }

  setPayload ( payload ) {
    this.filter = BloomFilter.fromBuffer( payload );
  };

  getPayload () {
    if ( this.filter ) {
      return this.filter.toBuffer();
    } else {
      return Buffer.alloc( 0 );
    }
  };

}
module.exports = FilterloadMessage;
