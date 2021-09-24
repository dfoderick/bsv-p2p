
const should = require('chai').should();
const P2P = require('../../');
const Message = P2P.Messages.Message;
const Networks = require('bsv').Networks;

describe('Message', function() {

  describe('@constructor', function() {
    it('construct with magic number and command', function() {
      const message = new Message({
        network: {
          networkMagic: 0xd9b4bef9
        },
        command: 'command'
      });
      should.exist(message);
      message.command.should.equal('command');
      message.network.networkMagic.should.equal(0xd9b4bef9);
    });
  });

  describe('#toBuffer', function() {
    it('serialize to a buffer', function() {
      const message = new Message({
        command: 'command',
        network: Networks.livenet
      });
      message.getPayload = function() {
        return Buffer.alloc(0);
      };
      const buffer = message.toBuffer();
      const expectedBuffer = Buffer.from('e3e1f3e8636f6d6d616e640000000000000000005df6e0e2', 'hex');
      buffer.should.deep.equal(expectedBuffer);
    });
  });

});
