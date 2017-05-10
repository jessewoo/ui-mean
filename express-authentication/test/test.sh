#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

function test {
    cd "${DIR}/${1}";
    npm test;
    cd ${DIR};
}

test "login";
