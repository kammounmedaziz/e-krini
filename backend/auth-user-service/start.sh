#!/bin/bash

cd "$(dirname "$0")"
export NODE_ENV=development
exec node src/app.js
