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
$ sx new app
```

Will create a new SX application on the `app` folder

Highlights
=============

* No DSL
* No new jargon to learn
* Built around the _Repository Pattern_, _Dependency Injection Pattern_ and based on _Pub/Sub_ (through `postal.js`)
* Plain Javascript (or Coffeescript if you fancy that)
* Nothing is enforced, you only need to follow folder structure and don't clutter the global namespace
* Convention over configuration
* Everything are _classes_ that you can extend to override behavior or add functionality
* There's only one sexy global variable that rhymes: `sx`
* No nested _callback hell_, almost everywhere you can use Promises/Futures and Async library
* Ready for node 0.8, 0.10 and 0.11
* Intuitive naming for classes, no specific project namespaces that you need to keep going to the documentation to understand
* Free from _require hell_, using some convention magic
* Really easy to test, `modules`, `controllers`, `views`, `models`

Conventions
=============

### Cascading class extend and Factory

Most of the time you'll want to create your own classes, or extend the core classes using the `sx.factory` or 
`sx.class.extend` methods, this is what makes your classes and code be available in your entire app, without
needing to use `require` or reading the files manually. All the classes created are stored in the `sx.classes` 
repository, and they return the uninstantiated class. The `sx.classname` is the instantiated class taken from
 the `sx.classes`: 
 
```js
sx.classes.View // this is a base class, that you can extend your own classes, 
sx.View // this doesn't exists
sx.classes.Url // this exists and it's a $singleton
sx.Url // since it's a singleton, it's automatically instantiated
```

You may not want to instantiate a class (like the case of `View` class), for that, because it's a building block and 
must be extended to have a functionality. 

```js
sx.factory('Test', {
    execute: function(){},
    main: function(){},
    constructor: function(){}
});
```

Singletons are always instantiated, because they serve as static helpers
and must be available everywhere in your code. To create a singleton, you can use:

```js
sx.factory('MyHelper', {
    $singleton: true, 
    staticMethod: function(){},
    staticMethod2: function(){
        return function(){};
    },
    staticVar: 1
});

sx.MyHelper.staticMethod();

sx.MyHelper.implement({
    newMethod: function(){
    }
});

sx.MyHelper.newMethod();
``` 

* You can extend any core classes, rewrite how it works, or simply add more functionality. 
    
To do this simply do 

```js
sx.Url.implement({
    cool: function(){ }
});
```

this will extend the core class `Url` and add the `cool` method. 
You may also want to rewrite some of the functionality maybe? Using `implement`, 
you can extend a helper

```js
sx.Url.implement({
    title: function(name){ 
        name = name.replace('-','_');  
        return this.$super(name);     
    }
});
```

or you want to create a new. Notice the call to the `this.$super`, that calls the original `title` function
ultra cool your-own `Url` class, but still use the provided core `Url` class, use `$inherits`.

```js
sx.factory('CoolUrl', {
    $inherits: 'Url',
    /*
    these all work the same way
    
    $inherits: ['Url'],
    $inherits: sx.Url,
    $inherits: [sx.Url],
    */
    tooGood: function(){
    }
});
```

This will create a singleton in `sx.CoolUrl.tooGood();`, so you can already use it 
everywhere in your app. Note that the `sx.Url` is created with `$singleton`, that 
effectivelly make it available in the `sx` global, since it has no "prototype" functions:

```js
var myUrl = sx.classes.Url.create('myUrl');

typeof myUrl.title // undefined
typeof sx.Url.title // function
```

* To create your own helpers and classes, use `sx.factory`

```js
// create static helpers using $singleton: true
// in this example, preferably in app/classes/specifichelper.js

sx.factory('SpecificHelper', {
    $singleton: true,
    doThis: function(){
    },
    doThat: function(){
    }
});

// usage
sx.SpecificHelper.doThis(...);
```

It's a good practice to keep each class in their own file, so it's maintainable. But nothing stops you to create
as many `factory`s in the same file:

```js
// app/classes/all.js
sx.factory('Class1', {
});

Class2 = sx.factory('Class2', {
});

sx.factory('Class3', [Class2], {
});

sx.factory('Class4', 'Class3', {
});
```

### Controllers

* Your controllers go into `app/classes/controller/`, with a lowercase filename, and a class extending:

* `Controler`: A controller that does nothing at first, you decide what it should return
* `ControllerTemplate`: A controller that automatically render content inside the 'content' var
* `ControllerREST`: A regular controller that responds to REST commands (DELETE, PUT, POST, GET)
* `ControllerRealtime`: A realtime controller that uses Socketstream to push updates to the browser, and do long polling

as a string (core class), CamelCased.

```js
// file app/classes/controller/index.js
// will be available in sx.controllers.Index
sx.factory('Index', ['Controller'], {
    'actionIndex': function(){
    }
});

// file modules/mymodule/controller/index.js
// will be available in sx.modules.mymodule.controllers.Index
sx.factory('Index', 'ControllerTemplate', {
    'actionIndex': function(){
    }
});

// file app/classes/master.js
// will be available in sx.classes.Master
sx.factory('Master', 'ControllerTemplate', {
    'actionLogin': function(){
    }
});

// file app/classes/controller/contact.js
// will be available in sx.controllers.Contact
sx.factory('Contact', 'Master', {
    'actionIndex': function(){
        this.actionLogin();
    }
});

// You can inherit mixins and base classes as well
sx.factory('Contact', ['Master','ControllerREST'], {
    /* ... */
});
```

All controllers from the app are available in `sx.controllers`. Controllers inside folders have their own namespace:

```js
console.log(sx.controllers.Index.$render()) // in app/classes/controller/index.js
console.log(sx.controllers.Admin.Index.$render()) // in app/classes/controller/admin/index.js
console.log(sx.controller('Admin.Index').render()); // getter that makes it easier to return a controller using an string
console.log(sx.controller(['Admin','Index']).$render()); // getter that makes it easier to return a controller using an array
```

Since each module has also their own namespace, they will be available in their respective module:

```js
console.log(sx.modules.mymodule.controllers.Index.$render()) // index from the module
console.log(sx.module('mymodule.controllers.Index').$render()); // getter that makes it easier to return a module using an string
console.log(sx.module(['mymodule','controllers','Index').$render()); // getter that makes it easier to return a module using an array
```

### Modules

* Want to add functionality either to the core, or add a way modulerize an specific function on the app, comprising of controllers, views, models?

Create a module:

1. Create a new folder inside `modules` folder, eg. 'mymodule' or using the command line `sx generate module mymodule`
2. Enable it in `app/config/modules.js` adding `{'mymodule': 'mymodule'}`
3. If you need to load additional files, create the file `modules/mymodule/index.js`, and the code inside will be automatically called when the app starts
4. Place your config inside `modules/mymodule/config/mymodule.js`, in form of a export, eg. `module.exports = {myvar: 1, loadextra: true}`
5. You can call `sx.modules.mymodule.config` to access the current config, and also, you can access the module namespace using `sx.modules.mymodule` (views, controllers, models, etc)
6. You may create routes in your module, and it can be used everywhere. You can also inject globals into views using `sx.View.bindGlobal` or `sx.View.setGlobal` (got jealous of Meteor's `{{loginButton}}`? you can have that as well)
7. A module folder structure can be exactly as the `app` folder, but the module will be extended by the `app` if you want. eg.

```js
/modules
    |
    |- mymodule
      |- config
         |- mymodule.js
      |- views
         |- mymodule
            |- index.js
            |- action.js
      |- classes
         |- mymodule.js
         |- url.js
```

A module can also extend core classes, create new classes, but can't access `app` classes, they are self contained. You may, in case, communicate from `modules` to `app` using pub/sub:

```js
// modules/mymodule/classes/test.js
sx.factory('Test', function(){
    var channel = sx.events.channel('Test');
    
    return {
        pipe: function(data){
          channel.publish('pipe', data);
        },
        channel: function(){
            return channel;
        }
    };
});

// app/classes/lol.js
sx.factory('LOL', {
    main: function(){
        var channel = sx.modules.mymodule.Test.channel();
        
        channel.subscribe('pipe', function(data){
            /* deal with data */
        });
    }
});

// app/classes/lmao.js
sx.factory('LMAO', {
    main: function(){
        var pipe = sx.modules.mymodule.Test.pipe;
        
        pipe({init: true});
    }
});
```

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