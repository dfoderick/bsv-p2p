const bsv = require( 'bsv' );
const $ = bsv.util.preconditions;
const Buffer = require( 'buffer' ).Buffer;
const reverse = require( 'buffer-reverse' );
const BufferReader = bsv.encoding.BufferReader;
const BufferWriter = bsv.encoding.BufferWriter;
const _ = bsv.deps._;

/**
 * A constructor for inventory related Bitcoin messages such as
 * "getdata", "inv" and "notfound".
 * @param {Object} obj
 * @param {Number} obj.type - Inventory.TYPE
 * @param {Buffer} obj.hash - The hash for the inventory
 * @constructor
 */

class Inventory {
  constructor ( obj ) {
    this.type = obj.type;
    if ( !Buffer.isBuffer( obj.hash ) ) {
      throw new TypeError( 'Unexpected hash, expected to be a buffer' );
    }
    this.hash = obj.hash;
  }

  /**
   * A convenience constructor for Inventory.
   * @param {Number} type - Inventory.TYPE
   * @param {Buffer|String} hash - The hash for the inventory
   * @returns {Inventory} - A new instance of Inventory
   */
  static forItem ( type, hash ) {
    $.checkArgument( hash );
    if ( _.isString( hash ) ) {
      hash = reverse( Buffer.from( hash, 'hex' ) );
    }
    return new Inventory( { type: type, hash: hash } );
  };

  /**
   * A convenience constructor for Inventory for block inventory types.
   * @param {Buffer|String} hash - The hash for the block inventory
   * @returns {Inventory} - A new instance of Inventory
   */
  static forBlock ( hash ) {
    return Inventory.forItem( Inventory.TYPE.BLOCK, hash );
  };

  /**
   * A convenience constructor for Inventory for filtered/merkle block inventory types.
   * @param {Buffer|String} hash - The hash for the filtered block inventory
   * @returns {Inventory} - A new instance of Inventory
   */
  static forFilteredBlock ( hash ) {
    return Inventory.forItem( Inventory.TYPE.FILTERED_BLOCK, hash );
  };

  /**
   * A convenience constructor for Inventory for transaction inventory types.
   * @param {Buffer|String} hash - The hash for the transaction inventory
   * @returns {Inventory} - A new instance of Inventory
   */
  static forTransaction ( hash ) {
    return Inventory.forItem( Inventory.TYPE.TX, hash );
  };

  /**
   * @returns {Buffer} - Serialized inventory
   */
  toBuffer () {
    const bw = new BufferWriter();
    bw.writeUInt32LE( this.type );
    bw.write( this.hash );
    return bw.concat();
  };

  /**
   * @param {BufferWriter} bw - An instance of BufferWriter
   */
  toBufferWriter ( bw ) {
    bw.writeUInt32LE( this.type );
    bw.write( this.hash );
    return bw;
  };

  /**
 * @param {Buffer} payload - Serialized buffer of the inventory
 */
  static fromBuffer ( payload ) {
    const parser = new BufferReader( payload );
    const obj = {};
    obj.type = parser.readUInt32LE();
    obj.hash = parser.read( 32 );
    return new Inventory( obj );
  };

  /**
   * @param {BufferWriter} br - An instance of BufferWriter
   */
  static fromBufferReader ( br ) {
    const obj = {};
    obj.type = br.readUInt32LE();
    obj.hash = br.read( 32 );
    return new Inventory( obj );
  };

}


// https://en.bitcoin.it/wiki/Protocol_specification#Inventory_Vectors
Inventory.TYPE = {};
Inventory.TYPE.ERROR = 0;
Inventory.TYPE.TX = 1;
Inventory.TYPE.BLOCK = 2;
Inventory.TYPE.FILTERED_BLOCK = 3;
Inventory.TYPE_NAME = [
  'ERROR',
  'TX',
  'BLOCK',
  'FILTERED_BLOCK'
];

module.exports = Inventory;
