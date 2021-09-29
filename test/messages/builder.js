
const should = require('chai').should();
const P2P = require('../../');
const builder = P2P.Messages.builder;
const bsv = require('bsv');

describe('Messages Builder', function() {

  describe('@constructor', function() {

    it('should return commands based on default', function() {
      // instantiate
      const b = builder();
      should.exist(b);
    });

    it('should return commands with customizations', function() {
      // instantiate
      const b = builder({
        network: bsv.Networks.testnet,
        Block: bsv.Block,
        Transaction: bsv.Transaction
      });
      should.exist(b);
    });

  });

});
