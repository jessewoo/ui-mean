#!/usr/bin/env bash

function build {
  ./node_modules/node-sass/bin/node-sass "./styles/${1}.scss" "./public/stylesheets/${1}.css" --output-style compressed
}

build main
