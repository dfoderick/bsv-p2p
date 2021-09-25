
const Message = require( '../message' );

const bsv = require( 'bsv' );
const utils = require( '../utils' );
const Buffer = require( 'buffer' ).Buffer;
const BufferReader = bsv.encoding.BufferReader;
const BufferWriter = bsv.encoding.BufferWriter;

/**
 * @param {Object=} arg
 * @param {Buffer=} arg.payload
 * @param {Buffer=} arg.signature
 * @param {Object} options
 * @extends Message
 * @constructor
 */
class AlertMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'alert';
    if ( !arg ) {
      arg = {};
    }
    this.payload = arg.payload || Buffer.alloc( 32 );
    this.signature = arg.signature || Buffer.alloc( 32 );
  }

  setPayload ( payload ) {
    const parser = new BufferReader( payload );
    this.payload = parser.readVarLengthBuffer();
    this.signature = parser.readVarLengthBuffer();
    utils.checkFinished( parser );
  };

  getPayload () {
    const bw = new BufferWriter();
    bw.writeVarintNum( this.payload.length );
    bw.write( this.payload );

    bw.writeVarintNum( this.signature.length );
    bw.write( this.signature );

    return bw.concat();
  };
}
module.exports = AlertMessage;
