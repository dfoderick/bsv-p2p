
const chai = require('chai');
const should = chai.should();
const Buffers = require('../lib/buffers');

describe('Buffers', function() {

  const buffs = function buffs() {
    const b = new Buffers();
    b.push(Buffer.from('0123', 'hex'));
    b.push(Buffer.from('4567', 'hex'));
    b.push(Buffer.from('89ab', 'hex'));
    b.push(Buffer.from('cdef', 'hex'));
    return b;
  };

  it('set buffers to empty if "i" is greater than the total length', function() {
    const b = buffs();
    b.length.should.equal(8);
    b.skip(100);
    b.buffers.should.deep.equal([]);
    b.length.should.equal(0);
  });

  it('set buffers to empty if "i" is equal than the total length', function() {
    const b = buffs();
    b.length.should.equal(8);
    b.skip(8);
    b.buffers.should.deep.equal([]);
    b.length.should.equal(0);
  });

  it('do not skip if "i" is zero', function() {
    const b = buffs();
    b.skip(0);
    b.length.should.equal(8);
  });

  it('remove part of the first buffer', function() {
    const b = buffs();
    b.skip(1);
    b.length.should.equal(7);
    b.buffers[0].should.deep.equal(Buffer.from('23', 'hex'));
  });

  it('remove the first three buffers', function() {
    const b = buffs();
    b.skip(6);
    b.length.should.equal(2);
    should.not.exist(b.buffers[1]);
    should.not.exist(b.buffers[2]);
    should.not.exist(b.buffers[3]);
  });

  it('remove part of the fourth buffer', function() {
    const b = buffs();
    b.skip(7);
    b.length.should.equal(1);
    b.buffers[0].should.deep.equal(Buffer.from('ef', 'hex'));
  });

});
