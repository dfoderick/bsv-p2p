
const Message = require( '../message' );

const bsv = require( 'bsv' );
const Buffer = require( 'buffer' ).Buffer;
const BufferWriter = bsv.encoding.BufferWriter;
const BufferReader = bsv.encoding.BufferReader;
const BN = bsv.crypto.BN

const utils = require( '../utils' );
// const packageInfo = require( '../../../package.json' );

/**
 * The version message is used on connection creation to advertise
 * the type of node. The remote node will respond with its version, and no
 * communication is possible until both peers have exchanged their versions.
 *
 * @see https://en.bitcoin.it/wiki/Protocol_documentation#version
 * @param {Object=} arg - properties for the version message
 * @param {Buffer=} arg.nonce - a random 8 byte buffer
 * @param {String=} arg.subversion - version of the client
 * @param {BN=} arg.services
 * @param {Date=} arg.timestamp
 * @param {Number=} arg.startHeight
 * @param {Object} options
 * @extends Message
 * @constructor
 */
class VersionMessage extends Message {
  constructor ( arg, options ) {
    /* jshint maxcomplexity: 10 */
    if ( !arg ) {
      arg = {};
    }
    super( options );
    this.command = 'version';
    this.version = arg.version || 70015//options.protocolVersion;
    this.nonce = arg.nonce || utils.getNonce();
    this.services = arg.services || new BN( 1, 10 );
    this.timestamp = arg.timestamp || new Date();
    //Don't ban us
    this.subversion = arg.subversion || '/Bitcoin SV:1.0.8/'; //'/bitcore:' + packageInfo.version + '/';
    this.startHeight = arg.startHeight || 0;
    this.relay = !arg.relay ? false : true;
  }
  setPayload ( payload ) {
    const parser = new BufferReader( payload );
    this.version = parser.readUInt32LE();
    this.services = parser.readUInt64LEBN();
    this.timestamp = new Date( parser.readUInt64LEBN().toNumber() * 1000 );

    this.addrMe = {
      services: parser.readUInt64LEBN(),
      ip: utils.parseIP( parser ),
      port: parser.readUInt16BE()
    };
    this.addrYou = {
      services: parser.readUInt64LEBN(),
      ip: utils.parseIP( parser ),
      port: parser.readUInt16BE()
    };
    this.nonce = parser.read( 8 );
    this.subversion = parser.readVarLengthBuffer().toString();
    this.startHeight = parser.readUInt32LE();

    if ( parser.finished() ) {
      this.relay = true;
    } else {
      this.relay = !!parser.readUInt8();
    }
    //FIXME: new BSV node added ass id
    //utils.checkFinished(parser);
  };

  getPayload () {
    const bw = new BufferWriter();
    bw.writeUInt32LE( this.version );
    bw.writeUInt64LEBN( this.services );

    const timestampBuffer = Buffer.from( Array( 8 ) );
    timestampBuffer.writeUInt32LE( Math.round( this.timestamp.getTime() / 1000 ), 0 );
    bw.write( timestampBuffer );

    utils.writeAddr( this.addrMe, bw );
    utils.writeAddr( this.addrYou, bw );
    bw.write( this.nonce );
    bw.writeVarintNum( this.subversion.length );
    bw.write( Buffer.from( this.subversion, 'ascii' ) );
    bw.writeUInt32LE( this.startHeight );
    bw.writeUInt8( this.relay );

    return bw.concat();
  };
}
module.exports = VersionMessage;
