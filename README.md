[![Build Status](https://travis-ci.org/pocesar/node-socketexpress.png?branch=develop)](https://travis-ci.org/pocesar/node-socketexpress)

Socket Express (SX for short)
=============

When realtime and stateless HTTP get together, and live happily ever after.
HMVC (Hierarchical model–view–controller) framework built on top of [SocketStream](https://github.com/socketstream/socketstream) and [Express.js](https://github.com/visionmedia/express) for [Node.js](http://nodejs.org),
inspired somehow by the simplicity of PHP Kohana framework (sorry, not another Rails clone for Node for you)

Using nothing more than already existing packages in NPM but with some consistent, maintainable, _cascading class-based Javascript_ glue together.

Install
=============

```
$ npm install socket-express -g
```

Start a new app
=============

```
user@~$ sx new app
```

Will create a new SX application on the `app` folder

Highlights
=============

* No DSL
* No new jargon to learn
* Plain Javascript (or Coffeescript if you fancy that)
* Nothing is enforced, you only need to follow folder structure
* Convention over configuration
* Everything are classes that you can extend to override behavior or add functionality
* There's only one sexy global variable that rhymes: SX
* Focused on dependency injection
* No nested callback hell, almost everywhere you can use Promises/Futures and Async library
* Ready for node 0.8, 0.10 and 0.11
* Intuitive naming for classes, no specific project namespaces that you need to keep going to the documentation to understand
* Free from 'require hell'

License
=============

The MIT License (MIT)

Copyright © 2013 Paulo Cesar http://socketexpress.net/

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the Software), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.