const assert = require("chai").assert;

describe('testing login', function() {
    describe('bionumber2bioassembly', function () {
        it('asym', function () {
            assert.strictEqual(bionumber2bioassembly("asym"), "__AU");
        });
        it('bionumber 1', function () {
            assert.strictEqual(bionumber2bioassembly(1), "BU1");
        });
    });

});
