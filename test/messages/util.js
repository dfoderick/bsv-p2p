
/* jshint unused: false */

const utils = require('../../lib/messages/utils');
const bsv = require('bsv');
const BufferReader = bsv.encoding.BufferReader;

describe('Message Utils', function() {

  describe('checkFinished', function() {
    it('should throw an error if buffer reader is not finished', function() {
      /*jshint immed: false */
      const buffer = Buffer.alloc(32);
      const br = new BufferReader(buffer);
      (function() {
        utils.checkFinished(br);
      }).should.throw('Data still available after parsing');
    });
  });

  describe('sanitizeStartStop', function() {
    it('should throw an error if starts is invalid length', function() {
      /*jshint immed: false */
      const stop = '000000000000000013413cf2536b491bf0988f52e90c476ffeb701c8bfdb1db9';
      (function() {
        utils.sanitizeStartStop({starts: ['0000'], stop: stop});
      }).should.throw('Invalid hash');
    });
    it('should keep buffers as buffers', function() {
      /*jshint immed: false */
      const starts = [Buffer.alloc(32)];
      const obj = utils.sanitizeStartStop({starts: starts});
      obj.starts[0].should.deep.equal(starts[0]);
    });
  });

});
