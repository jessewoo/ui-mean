#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

function test {
    npm test "${DIR}/${1}";
}

test "converter/test";

# http://stackoverflow.com/questions/10753288/how-to-specify-test-directory-for-mocha