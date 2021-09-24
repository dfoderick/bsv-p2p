
const Message = require( '../message' );

const bsv = require( 'bsv' );
const utils = require( '../utils' );
const BufferReader = bsv.encoding.BufferReader;
const BufferWriter = bsv.encoding.BufferWriter;
const _ = bsv.deps._;

/**
 * @param {Object|Array=} - options - If options is an array will use as "inventory"
 * @param {Array=} options.inventory - An array of inventory items
 * @extends Message
 * @constructor
 */
class GetdataMessage extends Message {
  constructor ( arg, options ) {
    super(options );
    this.command = 'getdata';
    utils.checkInventory( arg );
    this.inventory = arg;
  }
  setPayload ( payload ) {
    this.inventory = [];

    const parser = new BufferReader( payload );
    const count = parser.readVarintNum();
    for ( let i = 0; i < count; i++ ) {
      const type = parser.readUInt32LE();
      const hash = parser.read( 32 );
      this.inventory.push( { type: type, hash: hash } );
    }

    utils.checkFinished( parser );
  };
  getPayload () {
    const bw = new BufferWriter();
    utils.writeInventory( this.inventory, bw );
    return bw.concat();
  };
}
module.exports = GetdataMessage;
