const Message = require( '../message' );

const bsv = require( 'bsv' );
const $ = bsv.util.preconditions;
const _ = bsv.deps._;

/**
 * @param {Block=} arg - An instance of a Block
 * @param {Object} options
 * @param {Function} options.Block - A block constructor
 * @extends Message
 * @constructor
 */
class BlockMessage extends Message {
  constructor ( arg, options ) {
    super(options );
    this.Block = options.Block;
    this.command = 'block';
    $.checkArgument(
      _.isUndefined( arg ) || arg instanceof this.Block,
      'An instance of Block or undefined is expected'
    );
    this.block = arg;
  }

  setPayload ( payload ) {
    this.block = this.Block.fromBuffer( payload );
  };

  getPayload () {
    return this.block.toBuffer();
  };
}

module.exports = BlockMessage;
