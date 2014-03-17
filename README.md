# pollday server [![Build Status](https://secure.travis-ci.org/LaNetscouade/pollday.png?branch=master)](http://travis-ci.org/LaNetscouade/pollday)

## Getting Started

It's recommanded to update your node
```bash
sudo npm install -g n
```

Install latest stable NodeJS version
```bash
sudo n stable
```

Install "node package module" dependencies
```bash
npm install
```

Launch the server
```bash
node bin/pollday
```

```
node bin/pollday --help

Usage: pollday [options]

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -p, --port <value>             Listening port
    -f, --flashpolicyport <value>  Flash policy port
    -t, --timeout <value>          Reset timeout in seconds after the end of a poll
```

Copyright (c) 2014 . Licensed under the MIT license.
