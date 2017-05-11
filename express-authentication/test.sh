#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

function test {
    cd "${DIR}/${1}";
	pwd
    npm test;
    cd ${DIR};
    pwd
}

test "test";
