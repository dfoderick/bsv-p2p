
const Message = require( '../message' );

const bsv = require( 'bsv' );
const Buffer = require( 'buffer' ).Buffer;
const utils = require( '../utils' );
const BufferWriter = bsv.encoding.BufferWriter;
const BufferReader = bsv.encoding.BufferReader;
const $ = bsv.util.preconditions;
const _ = bsv.deps._;

/**
 * Request peer to add data to a bloom filter already set by 'filterload'
 * @param {Buffer=} data - Array of bytes representing bloom filter data
 * @param {Object=} options
 * @extends Message
 * @constructor
 */
class FilteraddMessage extends Message {
  constructor ( arg, options ) {
    super(options );
    this.command = 'filteradd';
    $.checkArgument(
      _.isUndefined( arg ) || Buffer.isBuffer( arg ),
      'First argument is expected to be a Buffer or undefined'
    );
    this.data = arg || Buffer.alloc( 0 );
  }


  setPayload ( payload ) {
    $.checkArgument( payload );
    const parser = new BufferReader( payload );
    this.data = parser.readVarLengthBuffer();
    utils.checkFinished( parser );
  };

  getPayload () {
    const bw = new BufferWriter();
    bw.writeVarintNum( this.data.length );
    bw.write( this.data );
    return bw.concat();
  };
}

module.exports = FilteraddMessage;
