
const Message = require( '../message' );

const bsv = require( 'bsv' );
const Buffer = require( 'buffer' ).Buffer;
const $ = bsv.util.preconditions;
const _ = bsv.deps._;

/**
 * Contains information about a MerkleBlock
 * @see https://en.bitcoin.it/wiki/Protocol_documentation
 * @param {MerkleBlock} arg - An instance of MerkleBlock
 * @param {Object=} options
 * @param {Function} options.MerkleBlock - a MerkleBlock constructor
 * @extends Message
 * @constructor
 */
class MerkleblockMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.MerkleBlock = options.MerkleBlock; // constructor
    this.command = 'merkleblock';
    $.checkArgument(
      _.isUndefined( arg ) || arg instanceof this.MerkleBlock,
      'An instance of MerkleBlock or undefined is expected'
    );
    this.merkleBlock = arg;
  }
  setPayload ( payload ) {
    $.checkArgument( Buffer.isBuffer( payload ) );
    this.merkleBlock = this.MerkleBlock.fromBuffer( payload );
  };

  getPayload () {
    return this.merkleBlock ? this.merkleBlock.toBuffer() : Buffer.alloc( 0 );
  };
}
module.exports = MerkleblockMessage;
