var chai = require('chai');
var assert = chai.assert;

describe('Test mocha  ',function() {

    before(function(done) {
        // Create something before testing
        // then using done() to finish
        done();
    });

    it('should equal test',function() {
        assert.equal( 'test', 'test' );
    });

});
