const Message = require( '../message' );

const bsv = require( 'bsv' );
const utils = require( '../utils' );
const $ = bsv.util.preconditions;
const _ = bsv.deps._;
const BufferReader = bsv.encoding.BufferReader;
const BufferWriter = bsv.encoding.BufferWriter;

/**
 * @param {Array=} arg - An array of addrs
 * @param {Object=} options
 * @extends Message
 * @constructor
 */
class AddrMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'addr';
    $.checkArgument(
      _.isUndefined( arg ) ||
      ( Array.isArray( arg ) &&
        !_.isUndefined( arg[ 0 ].services ) &&
        !_.isUndefined( arg[ 0 ].ip ) &&
        !_.isUndefined( arg[ 0 ].port ) ),
      'First argument is expected to be an array of addrs'
    );
    this.addresses = arg;
  }


  setPayload ( payload ) {
    const parser = new BufferReader( payload );

    const addrCount = parser.readVarintNum();

    this.addresses = [];
    for ( let i = 0; i < addrCount; i++ ) {
      // todo: time only available on versions >=31402
      const time = new Date( parser.readUInt32LE() * 1000 );

      const addr = utils.parseAddr( parser );
      addr.time = time;
      this.addresses.push( addr );
    }

    utils.checkFinished( parser );
  };

  getPayload () {
    const bw = new BufferWriter();
    bw.writeVarintNum( this.addresses.length );

    for ( let i = 0; i < this.addresses.length; i++ ) {
      const addr = this.addresses[ i ];
      bw.writeUInt32LE( addr.time.getTime() / 1000 );
      utils.writeAddr( addr, bw );
    }

    return bw.concat();
  };
}

module.exports = AddrMessage;
