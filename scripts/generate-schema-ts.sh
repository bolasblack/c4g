#!/usr/bin/env bash

schemaFilenameToTsFilename() {
  local f=$1
  echo "$(dirname $f)/$(basename -s '.json' $f).ts"
}

for f in ./src/**/schema.json; do
  yarn quicktype -s schema $f -l ts --just-types -o "$(schemaFilenameToTsFilename $f)"
done
