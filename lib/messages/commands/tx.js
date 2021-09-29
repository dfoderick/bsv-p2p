
const Message = require( '../message' );

const bsv = require( 'bsv' );
const $ = bsv.util.preconditions;
const _ = bsv.deps._;

/**
 * @param {Transaction=} arg - An instance of Transaction
 * @param {Object} options
 * @extends Message
 * @constructor
 */
class TransactionMessage extends Message {
  constructor ( arg, options ) {
    super( options );
    this.command = 'tx';
    this.Transaction = options.Transaction;
    $.checkArgument(
      _.isUndefined( arg ) || arg instanceof this.Transaction,
      'An instance of Transaction or undefined is expected'
    );
    this.transaction = arg;
    if ( !this.transaction ) {
      this.transaction = new this.Transaction();
    }
  }
  setPayload ( payload ) {
    if ( this.Transaction.prototype.fromBuffer ) {
      this.transaction = new this.Transaction().fromBuffer( payload );
    } else {
      this.transaction = this.Transaction.fromBuffer( payload );
    }
  };

  getPayload () {
    return this.transaction.toBuffer();
  };
}

module.exports = TransactionMessage;
