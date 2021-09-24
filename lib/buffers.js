const Buffers = require('buffers');
const Buffer = require('buffer').Buffer

Buffers.prototype.skip = function(i) {
  if (i === 0) {
    return;
  }

  if (i >= this.length) {
    this.buffers = [];
    this.length = 0;
    return;
  }

  const pos = this.pos(i);
  this.buffers = this.buffers.slice(pos.buf);
  this.buffers[0] = Buffer.from(this.buffers[0].slice(pos.offset));
  this.length -= i;
};

module.exports = Buffers;

