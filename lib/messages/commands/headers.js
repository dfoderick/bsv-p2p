
const Message = require( '../message' );

const bsv = require( 'bsv' );
const utils = require( '../utils' );
const BufferReader = bsv.encoding.BufferReader;
const BufferWriter = bsv.encoding.BufferWriter;
const _ = bsv.deps._;
const $ = bsv.util.preconditions;

/**
 * Sent in response to a `getheaders` message. It contains information about
 * block headers.
 * @param {Array} arg - An array of BlockHeader instances
 * @param {Object=} options
 * @param {Array=} options.headers - array of block headers
 * @param {Function} options.BlockHeader - a BlockHeader constructor
 * @extends Message
 * @constructor
 */
class HeadersMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.BlockHeader = options.BlockHeader;
    this.command = 'headers';
    $.checkArgument(
      _.isUndefined( arg ) || ( Array.isArray( arg ) && arg[ 0 ] instanceof this.BlockHeader ),
      'First argument is expected to be an array of BlockHeader instances'
    );
    this.headers = arg;
  }
  setPayload ( payload ) {
    $.checkArgument( payload && payload.length > 0, 'No data found to create Headers message' );
    const parser = new BufferReader( payload );
    const count = parser.readVarintNum();

    this.headers = [];
    for ( let i = 0; i < count; i++ ) {
      const header = this.BlockHeader.fromBufferReader( parser );
      this.headers.push( header );
      const txn_count = parser.readUInt8();
      $.checkState( txn_count === 0, 'txn_count should always be 0' );
    }
    utils.checkFinished( parser );
  };

  getPayload () {
    const bw = new BufferWriter();
    bw.writeVarintNum( this.headers.length );
    for ( let i = 0; i < this.headers.length; i++ ) {
      const buffer = this.headers[ i ].toBuffer();
      bw.write( buffer );
      bw.writeUInt8( 0 );
    }
    return bw.concat();
  };
}
module.exports = HeadersMessage;
