
const Message = require( '../message' );

const Buffer = require( 'buffer' ).Buffer;
const bsv = require( 'bsv' );
const utils = require( '../utils' );
const $ = bsv.util.preconditions;
const BufferReader = bsv.encoding.BufferReader;
const BufferWriter = bsv.encoding.BufferWriter;

/**
 * A message to announce protocol configuration immediately after sending VERACK.
 * @param {Object=} arg - an object of protocol configurations
 * @param {Integer=} arg.maxRecvPayloadLength - max protocol payload length, should not be less than 1 * 1024 * 1024
 * @param {Object=} options
 * @extends Message
 * @constructor
 */
class ProtoconfMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'protoconf';
    if ( arg ) {
      this.maxRecvPayloadLength = arg.maxRecvPayloadLength
    }
  }

  setPayload ( payload ) {
    const parser = new BufferReader( payload );
    $.checkArgument( !parser.finished(), 'No data received in payload' );

    const numberOfFields = parser.readVarintNum();
    if ( numberOfFields > 0 ) {
      this.maxRecvPayloadLength = parser.readUInt32LE();
    }

    // There may be more configurations in the future
    // utils.checkFinished(parser);
  };

  getPayload () {
    const bw = new BufferWriter();

    if ( this.maxRecvPayloadLength ) {
      bw.writeVarintNum( 1 );
      bw.writeUInt32LE( this.maxRecvPayloadLength );
    } else {
      bw.writeVarintNum( 0 );
    }

    return bw.concat();
  };
}

module.exports = ProtoconfMessage;
