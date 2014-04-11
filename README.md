[![Build Status](https://travis-ci.org/socket-express/core.svg?branch=develop)](https://travis-ci.org/socket-express/core)
[![Coverage Status](https://coveralls.io/repos/socket-express/core/badge.png)](https://coveralls.io/r/socket-express/core)
[![NPM version](https://badge.fury.io/js/socket-express.svg)](http://badge.fury.io/js/socket-express)
[![Dependency Status](https://david-dm.org/socket-express/core.svg)](https://david-dm.org/socket-express/core)
[![devDependency Status](https://david-dm.org/socket-express/core/dev-status.svg)](https://david-dm.org/socket-express/core#info=devDependencies)

[![NPM](https://nodei.co/npm/socket-express.png?downloads=true&stars=true)](https://nodei.co/npm/socket-express/)

![Socket Express](https://socket-express.github.io/core/media/full-logo.svg "Socket Express")

Socket Express (SX for short)
=============

When realtime and stateless HTTP get together, and live happily ever after.
Inspired somehow by the simplicity of PHP Kohana framework (sorry, not another Rails clone/port for Node for you), using _almost_
nothing more than already existing packages in NPM but with some consistent, maintainable, _cascading "class-based" Javascript_ glue
together, relying on dependency injection and the D.R.Y. principle, alongside some autoloading magic.

HMVC (Hierarchical model–view–controller) framework built on top of [Primus](https://github.com/primus/primus) and
[Express.js](https://github.com/visionmedia/express) (that might change to [Koa](https://github.com/koajs/koa) in near future when
generators arrive to node stable) for [Node.js](http://nodejs.org).

Highlights
=============

* No DSL and no new jargon to learn, with intuitive naming for system classes, minimizing the need for you to keep coming back to the
documentation to understand what something does
* Based on the idea that there's no need to reinvent the wheel, just add the monster truck over them!
* Focused on convention over configuration
* Built around the _Repository Pattern_ and _Dependency Injection Pattern_
* Plain Javascript (or Coffeescript if you fancy that, the source of `sx` itself is written in Coffeescript)
* Nothing is enforced, you may only follow folder structure, place the files where they belong, and you are set (but you might as well not)
* Flexible enough so you can use many ways to accomplish the same result, depending on your style
* Everything are _classes_ that you can extend to override behavior or add functionality, but favoring _Object Composition_
over _Class Inheritance_ in most cases (that means, changing base classes don't change subsequent classes and perform faster)
using [ES5Class](https://github.com/pocesar/ES5-Class)
* Many global variables are frowned upon, so there's only one sexy global namespace that rhymes: `sx` that you may or may not use (
usually when you are in a hurry, but it's best to use dependency injection and proper structure your project)
* No nested _callback hell_, almost everywhere you can use Promises (using [Bluebird](https://github.com/petkaantonov/bluebird))
* Ready for node 0.10+
* Free from _require hell_, using some **magic** through convention and loading mechanisms using automated dependency injection
* Focused on tests (testing and testability), it's really easy to test, `modules`, `controllers`, `views`, `models` or any `class` in your project
* Ready for large scale, well organized applications
* Most of the system classes are "agnostic" and abstracted and can be used separated from the entire framework
(as you can see in the tests)
* Super performance! The framework won't be your bottleneck, the database and external requests could (but shouldn't)
* Thought security from the ground up

Install
=============

```bash
$ npm install socket-express -g
```

Create a new app
=============

```bash
$ sx new app
```

Will create a new SX application on the `app` folder

Update an existing app
=============

Inside your app path

```bash
$ sx update
```

It will update the Socket Express system folder and dependencies depending on your global installed version

Classes
=============

Check the [Wiki](https://github.com/socket-express/core/wiki/_pages) for the explanation of each system
class that comes with SX

This `README.md` is just an one-page overview of the entire framework.

Coming from Ruby or PHP background?
=============

Your whole app is loaded when the server is loaded. In Node.js realm, there's no such thing as
per request compilation + execution.

So, every config, every controller, route, view, are loaded on the startup, and the calls are
directed to their places and are always available through your instance.

Just to make clear that it's not the same as PHP that the code is compiled everytime you visit
a page and load only the _important_ parts to save memory.

Files are loaded from the folders in this order: `system`, then `modules` then `app` folder, and
each folder class can overwrite / overload existing classes and/or extend/get rid of it.

Conventions
=============

## Cascading File System (CFS), Factory pattern and classes Repositories

Most of the time you'll want to create your own classes, or extend the core classes using the `sx.factory` method,
this is what makes your classes and code be available in your entire app, without needing to use `require` or
reading the files manually. All the classes created are stored in the `sx.classes` _repository_, and they return
the uninstantiated class. The `sx.*classname*` is the shortcut class taken from the `sx.classes.*classname*`:

```js
sx.classes.View // this is a base class, that you can extend your own classes
sx.View // this doesn't exists
sx.classes.Url // this exists and it's a $singleton
sx.Url // since it's a $singleton, it's automatically "instantiated"
```

Every time you define a file under the `classes` folder, it becomes a class, that means, the `sx.factory` call is
done automatically, normalized and put into the `sx.classes` repository for you.

You may not want a `$singleton` class, like the `Url` class, but instead, for the `View` class, because it's a building
block and must be extended to have a functionality. For example:

```js
// we are in app/classes/test.js
module.exports = {
    $extend: 'View', // special definition key that do the magic, it will load the View class and create a new class from it
                     // $extend creates prototypal inheritance, while $implement is object composition
    execute: function(){
    },
    main: function(){
    },
    construct: function(){
        this.$super();
    }
}
// you can call it sx.classes.Test.$create().main() for example
```

Singletons are always instantiated, because they serve as static helpers and must be available everywhere in your code. To create a
singleton, you can use:

```js
// we are in app/classes/myhelper.js
module.exports = {
    $singleton: true, // another special definition that tells the factory to create a static class (that don't need instantiation)
    staticMethod: function(){},
    staticMethod2: function(){
        return function(){};
    },
    staticVar: 1
}

sx.Myhelper.staticMethod();

sx.Myhelper.$implement({
    newMethod: function(){
    }
});

sx.Myhelper.newMethod();
```

You may also separate your static class methods and variables from the prototype functions:

```js
// we are in app/classes/my_class.js
module.exports = {
    $static: { // another special definition that separates everything from your prototype
        staticFunction: function(){ }
    },
    prototypeFunction: function(){ }
}
// later on
console.log(sx.classes.MyClass.staticFunction); // function
console.log(sx.classes.MyClass.prototypeFunction); // undefined
console.log(sx.classes.MyClass.$create().prototypeFunction); // function
```

##### You can extend any core classes, rewrite how it works, or simply add more functionality.

To do this simply do

```js
sx.Url.$implement({
    cool: function(){ }
});
```

this will extend the core class `Url` and add the `cool` method, because the `Url` class is a
singleton. The nature of a singleton cannot be changed, a singleton will always be a singleton.

You may also want to rewrite some of the functionality maybe? Using `$implement`, you can extend an existing class

```js
sx.Url.$implement({
    title: function(name){
        return this.$super(name, '-', true);  // call the super function, that is, the original sx.Url.title
    }
});
```

or you want to create a new class from the base of another. Notice the call to the
`this.$super`, that calls the original `title` function ultra cool your-own `Url` class,
but still use the provided core `Url` class, use `$implement`.
`$implement` adds other classes to your class, but doesn't add any inheritance to them, it's
called _Object Composition_.

```js
// we are in app/classes/cool_url.js
module.exports = {
    $implement: 'Url',
    /*
    these all work the same way

    $implement: ['Url','Session'],
    $implement: sx.Url,
    $implement: [sx.Url,sx.classes.Session],
    */
    tooGood: function(){

    }
}
```

This will create a singleton in `sx.CoolUrl.tooGood();`, so you can already use it
everywhere in your app. Note that the `sx.Url` is created with `$singleton` option, that
effectivelly make it available in the `sx` global, since it has no "prototype" functions:

```js
var myUrl = sx.classes.Url.create('myUrl'); // trying to instantiate the Url class

typeof myUrl.title // undefined
typeof sx.Url.title // function
```

Below is an useful example.
Say you like Q library for promises better than Bluebird. All you have to do is:

```js
// create the file in app/classes/utils.js
module.exports = {
    $deps: [
        {'Promise': 'q'} // var Q = require('q')
    ]
}
```

BOOM! You just changed the entire framework to use Q instead. (should work out of the box, since they got compatible APIs)

##### To create your own helpers and classes

```js
// create static helpers using $singleton: true
// in this example, preferably in app/classes/specific_helper.js

module.exports = {
    $singleton: true,
    doThis: function(){
    },
    doThat: function(){
    }
}

// usage
sx.SpecificHelper.doThis(...);
```

It's a good practice to keep each class in their own file, so it's maintainable and easy to go to. But
nothing stops you to create as many `sx.factory`s in the same file:

```js
// app/classes/all.js
// since there's no "module.exports", it won't call factory automatically
sx.factory('Class1', {
});

Class2 = sx.factory('Class2', {
});

sx.factory('Class3', {
    $implement: [Class2]
});

sx.factory('Class4', {
    $implement: 'Class3'
});
// everything will be available in sx.classes, that is:
// sx.classes.Class1
// sx.classes.Class2
// sx.classes.Class3
// sx.classes.Class4
```

Extending existing classes, you don't need to do anything, but to name your file with the same name of the existing class:

```js
// we are in app/classes/route.js
module.exports = function(sx){
    // "this" is the current class definition
    // you can use this.$include() to add functions and properties to the prototype

    // Using a function instead of an object is good since you can keep private data,
    // and share between instances (called flyweight pattern)

    // Always return your definition
    // You can use all the "modifiers" here:
    // $static, $singleton (if it's always a singleton, you can't change it), $deps, etc
    return {
        $deps: ['Session'],
        superMatch: function(){}
    };
};
// this modification will add the superMatch function to sx.classes.Route automatically, plus add `Session` to it's
// dependencies along side with already included dependencies
```

#### Dependency injection

##### Now, your class might depend on some other class or require, that must be loaded in order for it to work. Dependency injection to the rescue:

```js
// we are in app/classes/some_class.js
module.exports = {
    $deps: [       // $deps = dependencies
        'Url',     //
        'Route',   // load these classes from the classes repository inside sx.classes
        'Locale',  //
        {'_s': 'underscore.string'},       // require('underscore.string')
        {'accounting': 'accounting'},      // require('accounting') and name it accounting in this.$.accounting
        {'XRegExp': ['xregexp', 'XRegExp'] // requires('xregexp') module and use the 'XRegExp' variable, like doing require('xregexp').XRegExp
    ],
    construct: function(){
        // the this.$ is the dependency injected modules (or classes) namespace
        this.$.Url
        this.$.Route
        this.$.Locale
        this.$._s.trim
        this.$.accounting
    },
    $static: {
        funct: function(){
            this.$.Url
            this.$._s.trim
            this.$.accounting
        },
        $setup: function(){
            // this is a special function that is called ONCE when this file is require'd
            // and transformed into a javascript "class"

            // Inherit the prototype of accounting plus call it's constructor when the class "SomeClass"
            // is instantiated
            this.$implement(this.$.accounting, true);
        }
    }
}
```

* Passing a string will try to inject other classes from SX. Eg: `'Url','Bootstrap'`
* Passing an object will inject a regular node.js module (from `node_modules` folder).

```js
    $deps: [
        {'_': 'lodash'}
    ]
    // work as
    var _ = require('lodash')
```

* Passing an object with an array will inject a regular node.js module but using a variable from the require.

```js
    $deps: [
        {'XRegExp': ['xregexp', 'XRegExp']}
    ]
    // work as
    var XRegExp = require('xregexp').XRegExp
```

This makes your module or code loosely coupled and more testable, but you can always
use the `sx.classes.Url` or `sx.classes.Route` or `sx.classes.Locale` for example,
since the `sx` global got everything you need.

#### File names

Naming your files is very important, so you don't lose track of the generated classes and class
names.

It's recommended that you use lowercase filenames without spaces or dashes (-). If you'd want
your class to look like `MyAwesomeClass`, you'd name your file `my_awesome_class.js`, as
underscores are converted to CamelCase. All classes start with an UPPERCASE letter.

## Controllers

Your controllers go into `app/classes/controllers/`, with a lowercase filename, and a class extending:

* `Controller`: A controller that does nothing at first, only respond to routes, you decide what it should return
* `ControllerTemplate`: A controller that automatically render content inside the 'content' var in the template
* `ControllerRest`: A regular controller that responds to REST commands (DELETE, PUT, POST, GET, that maps to destroy, insert, update and get)
* `ControllerRealtime`: A realtime controller that uses Primus to push updates to the browser using Websockets
* `ControllerAjax`: A controller that can respond to AJAX requests automatically, inherits from `ControllerTemplate` and serves ajax through `ajaxAction`

as a string (core class), CamelCased.

```js
// we are in app/classes/controllers/index.js
// will be available in sx.controllers.Index
module.exports = {
    $extend: 'Controller', // need to explicitly tell which controller to extend, any changes to the Controller class reflects in this
                           // new controller as well
    'actionIndex': function(){
    }
}

// we are in modules/mymodule/controllers/index.js
// will be available in sx.modules.Mymodule.controllers.Index
module.exports = {
    $extend: 'ControllerTemplate',
    'actionIndex': function(){
    }
}

// we are in app/classes/master.js
// will be available in sx.classes.Master
module.exports = {
    $extend: 'ControllerTemplate',
    'actionLogin': function(){
    }
}

// we are in app/classes/controllers/contact.js
// will be available in sx.controllers.Contact
module.exports = {
    $extend: 'Master', // We are extending from a class that extends from ControllerTemplate
    'actionIndex': function(){
        this.actionLogin();
    }
}

// we are in app/classes/controllers/load.js
// You can include mixins and base classes as well, changes to original classes
// won't reflect in the mixin'd class
module.exports = {
    $implement: ['Master','ControllerRest'] // effectivelly, we are extending from ControllerTemplate and ControllerRest, and mixin their declarations together
    /* ... */
}
```

All controllers from the app are available in `sx.controllers`. Controllers inside folders have their own namespace:

```js
console.log(sx.controllers.Index) // in app/classes/controllers/index.js
console.log(sx.controllers.Admin.Index) // in app/classes/controllers/admin/index.js
console.log(sx.controller('Admin.Index')); // getter that makes it easier to return a controller using an string
console.log(sx.controller(['Admin','Index'])); // getter that makes it easier to return a controller using an array
```

Since each module has also their own namespace, they will be available in their respective module:

```js
console.log(sx.modules.Mymodule.controllers.Index) // index from the module
console.log(sx.module('Mymodule.controllers.Index')); // getter that makes it easier to return a module using an string
console.log(sx.module(['Mymodule','controllers','Index'])); // getter that makes it easier to return a module using an array
```

NOTE: Controllers of same name are overwritten (controllers don't extend each other, you must explicitly extend them)

You may return values on your controllers, and they will be sent to the client as-is.

You may return any literals (strings, objects, etc) or you can return promises, that will be sent accordingly when you're done:

```js
// app/classes/controllers/main.js
module.exports = {
  $deps: ['model/User','view/template'],
  $extend: 'Controller',
  actionIndex: function(){
    return 'doh'; // will send a text/plain response
  },
  actionPromise: function(){
    return this.$.model.User.find(1); // will send a application/json response
  },
  actionView: function(){
    return this.$.view.template.render({hello:'world'}); // will send an text/html response
  }
};
```

Failing promises will return a `500`, while `false` will return a `404`

Also, you might ditch oldschool `req` and `res` and use `this` (for preparation for the upcoming of generators and
a painless migration for [Koa](https://github.com/koajs/koa), if you want future proof code, use this
way):

```js
// app/classes/controllers/main.js
module.exports = {
  $deps: ['model/User','view/template'],
  $extend: 'Controller',
  actionIndex: function(){
    this.body = 'body';
  },
  actionPromise: function(){
    this.body = this.$.model.User.find(1);
  },
  actionView: function(){
    this.body = this.$.view.template.render({hello:'world'});
  }
};
```

So you have 3 ways of accomplishing the same task in your controllers.

##### Controllers are reached through Routes (which is covered later on).

## Modules

##### Want to add functionality either to the core, or add a way modulerize an specific function on the app, comprising of controllers, views, models?

Create a module:

1. Create a new folder inside `modules` folder, eg. 'mymodule' or using the command line `sx generate module mymodule`
2. if you are doing it manually, enable it in `app/config/modules.js` adding `{'mymodule': 'mymodule'}`
3. If you need to load additional files, create the file `modules/mymodule/index.js`, and the code inside will be automatically called when the app starts
4. Place your config inside `modules/mymodule/config/mymodule.js`
5. You can call `sx.modules.Mymodule.config` to access the current config, and also, you can access the module namespace using `sx.modules.Mymodule` (views, controllers, models, etc)
6. You may create routes in your module, and it can be used everywhere. You can also inject globals into views using `sx.View.bindGlobal` or `sx.View.setGlobal` (got jealous of Meteor's `{{loginButton}}`? you can have that as well)
7. A module folder structure can be exactly as the `app` folder, but the module will be extended by the `app` if you want. eg.

```
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
// we are in modules/mymodule/classes/test.js
module.exports = function(base, parent){
    var channel = sx.events.channel('Test');

    return {
        pipe: function(data){
          channel.publish('pipe', data);
        },
        channel: function(){
            return channel;
        }
    };
}

// we are in app/classes/lol.js
module.exports = {
    construct: function(){
        var channel = sx.modules.Mymodule.Test.channel();

        channel.subscribe('pipe', function(data){
            /* deal with data */
        });
    }
}

// we are in app/classes/lmao.js
module.exports = {
    construct: function(){
        var pipe = sx.modules.Mymodule.Test.pipe;

        pipe({init: true});
    }
}
```

A module can also have it's own `package.json` file and it's own `node_modules` folder without any interference to the rest of the app.

## Config

Configs are loaded the same way the classes are loaded, they are merged from bottom up. The order is `system`, `modules` then `app` folders.

Defining a config file is as simple as:

```js
// we are in app/config/myconfig.js
module.exports = {
  myThing: 1,
  myOtherThing: 'yes' // etc
}
```

Config files are defined as a module because you may set functions and other executable code in it (like when you do in your `routes.js`, where you can define filters).

Every config loaded is placed in `sx.configs` repository. The key is determined by the filename:

```js
// we are in app/config/my_config.js
// becomes sx.configs.MyConfig
module.exports = {
  myconfig: true
}
// you can read it as sx.configs.MyConfig.get('myconfig') or sx.configs.MyConfig.data.myconfig (if you are concerned about performance on using a getter)
```

Another thing is that you can use nested rules and still be able to access them using the `get` function:

```js
// we are in app/config/myconfig.js
module.exports = {
  my: {
    deep: {
      property: true
    }
  }
}
// can be accessed using sx.configs.Myconfig.get('my.deep.property') or sx.configs.Myconfig.get(['my','deep','property'])
// the same goes for "set"
```

If you, instead of exporting an object, you pass in a function, the function will be executed, and the first parameter will be the `sx` instance, so you can access other configs and classes from your config (not usually necessary):

```js
module.exports = function(sx){
  return { // you must return your object definition
      existingConfig: sx.configs.OtherClass,
      myThing: 1,
      myOtherThing: 'yes' // etc
  };
}
```

The config turns into a `Config` class that has a couple of functions to manipulate your settings:

##### Config.clone()

deep clone your data, leave the original untouched

##### Config.set(key, value)

set values on your config. can pass in `'key', 'value'`, or an object with `{'key':'value'}`.
Existing values will be overwritten.

##### Config.wipe(\[newdata\])

either wipe your data, or exchange it if you pass in another object

##### Config.unset(name)

deletes a key on your config

##### Config.get(name, \[inexistant\])

returns the value of the `name` if it exists, or the `inexistant` value. Eg.: `Config.get('dontexist', 'boo')` returns `'boo'`

##### Config.isset(name)

checks if a key is set (it can be null, false or zero, but not undefined)

##### Config.env(name)

you may have a setting for each environment, and the Config makes it easy to set which environment it should use.
This is a destructive function that alters your config instance depending on the name you pass in.

You define your config file like this:

```js
module.exports = {
    '*': { // the "star" means a common definition that should exist in any cases below
      value1: 1,
      value2: 2
    }
    'development': { // value1 will have it's value overwritten if you set Config.env('development') and set to 0, and 'staging' and 'production' will be deleted
      value1: 0
    },
    'staging': { // value1 will have it's value overwritten if you set Config.env('staging') and set to 3, and 'production' and 'development' will be deleted
      value1: 3
    },
    'production': { // value1 will have it's value overwritten if you set Config.env('production') and set to 5, and 'staging' and 'development' will be deleted
      value1: 5
    }
}
```

If you call it `Config.env()` (without a name), it will try to use the `process.env.NODE_ENV`, and the other definitions will be
deleted (including the `*` and will be merged in one config).

## Views

Conversely, in SX, all your views are preloaded on bootstrap (for performance reasons) and they are all available in `sx.views`
repository.

It's much faster to use something that is already instantiated than instantiating on every request, which makes no sense in the node.js realm.
Also, by saving it in memory, it won't be hitting the disk for such a trivial task, plus it can be forced-reloaded on-the-fly.

Although, depending on the number of views and templates, it can be a bit overwhelming to find the best balance on your folder structure,
but the hierarchy of your folders will reflect in your views repository.

##### Template languages

You can write the templates from any of these template engines, and use them interchangeably:

##### Template engines

  - [atpl](http://documentup.com/soywiz/atpl.js) - Compatible with twig templates
  - [coffeecup](http://documentup.com/gradus/coffeecup) - pure coffee-script templates (fork of coffeekup)
  - [dot](http://documentup.com/olado/doT) [(website)](https://github.com/Katahdin/dot-packer) - focused on speed
  - [dust](http://documentup.com/akdubya/dustjs) [(website)](http://akdubya.github.com/dustjs/) - asyncronous templates
  - [eco](http://documentup.com/sstephenson/eco) - Embedded CoffeeScript templates
  - [ect](http://documentup.com/baryshev/ect) [(website)](http://ectjs.com/) - Embedded CoffeeScript templates
  - [ejs](http://documentup.com/visionmedia/ejs) - Embedded JavaScript templates
  - [haml](http://documentup.com/visionmedia/haml.js) [(website)](http://haml-lang.com/) - dry indented markup
  - [haml-coffee](http://documentup.com/netzpirat/haml-coffee/) [(website)](http://haml-lang.com/) - haml with embedded CoffeeScript
  - [handlebars](http://documentup.com/wycats/handlebars.js/) [(website)](http://handlebarsjs.com/) - extension of mustache templates
  - [hogan](http://documentup.com/twitter/hogan.js) [(website)](http://twitter.github.com/hogan.js/) - Mustache templates
  - [jade](http://documentup.com/visionmedia/jade) [(website)](http://jade-lang.com/) - robust, elegant, feature rich template engine
  - [jazz](http://documentup.com/shinetech/jazz)
  - [jqtpl](http://documentup.com/kof/jqtpl) [(website)](http://api.jquery.com/category/plugins/templates/) - extensible logic-less templates
  - [JUST](http://documentup.com/baryshev/just) - EJS style template with some special syntax for layouts/partials etc.
  - [liquor](http://documentup.com/chjj/liquor) - extended EJS with significant white space
  - [mustache](http://documentup.com/janl/mustache.js) - logic less templates
  - [QEJS](http://documentup.com/jepso/QEJS) - Promises + EJS for async templating
  - [swig](http://documentup.com/paularmstrong/swig) [(website)](http://paularmstrong.github.com/swig/) - Django-like templating engine
  - [templayed](http://documentup.com/archan937/templayed.js/) [(website)](http://archan937.github.com/templayed.js/) - Mustache focused on performance
  - [toffee](http://documentup.com/malgorithms/toffee) - templating language based on coffeescript
  - [underscore](http://documentup.com/documentcloud/underscore) [(website)](http://documentcloud.github.com/underscore/)
  - [walrus](http://documentup.com/jeremyruppel/walrus) - A bolder kind of mustache
  - [whiskers](http://documentup.com/gsf/whiskers.js/tree/) - logic-less focused on readability

##### Stylesheet Languages

  - [less](http://documentup.com/cloudhead/less.js) [(website)](http://lesscss.org/) - LESS extends CSS with dynamic behavior such as variables, mixins, operations and functions.
  - [stylus](http://documentup.com/learnboost/stylus) [(website)](http://learnboost.github.com/stylus/) - revolutionary CSS generator making braces optional
  - [sass](http://documentup.com/visionmedia/sass.js) [(website)](http://sass-lang.com/) - Sassy CSS

##### Minifiers

  - [uglify-js](http://documentup.com/mishoo/UglifyJS2) - No need to install anything, just minifies/beautifies JavaScript
  - [uglify-css](https://github.com/visionmedia/css) - No need to install anything, just minifies/beautifies CSS
  - ugilify-json - No need to install anything, just minifies/beautifies JSON

##### Other

  - cdata - No need to install anything, just wraps input as `<![CDATA[${INPUT_STRING]]>` with the standard escape for `]]>` (`]]]]><![CDATA[>`).
  - cdata-js - as `cdata`, but with surrounding comments suitable for inclusion into a HTML/JavaScript `<script>` block: `//<![CDATA[\n${INPUT_STRING\n//]]>`.
  - cdata-css - as `cdata`, but with surrounding comments suitable for inclusion into a HTML/CSS `<style>` block: `/*<![CDATA[*/\n${INPUT_STRING\n/*]]>*/`.
  - verbatim - No need to install anything, acts as a verbatim passthrough `${INPUT_STRING}`
  - escape-html - No need to install anything, just replaces special characters to sanitize input for html/xml
  - [coffee-script](http://coffeescript.org/) - `npm install coffee-script`
  - [cson](https://github.com/bevry/cson) - coffee-script based JSON format
  - markdown - You can use `marked`, `supermarked`, `markdown-js` or `markdown`

SX will try to guess (if you don't pass the `$type` of your view) what engine it uses by file extension.

This is possible because of the underlaying [Transformers](https://github.com/ForbesLindesay/transformers) module.

##### Automatic render of view

You can render a view associated with the current request by using `res.view` (or using `sx.view('viewpath')` to load
other views inside the controller):

```js
// app/classes/controllers/about.js
// url like http://localhost:3000/about/index
module.exports = {
    $extends: 'Controller',
    actionIndex: function(req, res){
        res.view({name: 'name', other: 'variable'});
        // if there's no associated view, it will throw a 404 error
        // will try to lookup app/views/about/index.*, but since the view is already loaded
        // when the app started, it will try, through a hash table, find your .about.index view (regardless of the extension)
    }
};
```

Most of the time you'll want to reuse many views in many controllers of your app.
By using `sx.view('name/of/view.ext')`, you can access it.

You can also access all your views through `sx.classes.View.views` (messy repository) or add it as a dependency on your controller:

```js
module.exports = {
    $deps: [
        'View'
    ],
    $extend: 'Controller',
    actionIndex: function(req, res){
        this.$.View.factory('name/of/view.ejs').render({
            your:'variable'
        }).done(res.render);
    }
};
```

## Routes

All the routes in your app are named. That means, after you define them, you can look them up by name, and "build" an URI with them.

Inside your `app/config/routes.js`:

```js
module.exports = {
    downloadIt: {
        uri: 'downloadEndpoint',
        defaults: {
            controller: 'download', // accept only GET requests to /downloadEndpoint
            action: 'index'
        },
        cache: true, // allow caching, because it's an static route, it won't perform a regex lookup each time
        methods: ['GET'] // by default, the route accepts ALL methods
    },
    uploadIt: {
        uri: 'uploadEndpoint',
        defaults: {
            controller: 'upload',
            action: 'index'
        },
        cache: true, // allow caching, because it's an static route, it won't perform a regex lookup each time
        methods: ['POST','PUT'] // accept only POST and PUT in /uploadEndpoint
    },
    user: {
        uri: 'user/<username>',
        regex: {
            username: '[a-z0-9]{1,15}' //check the non optional "username" for the regex param
        },
        defaults: {
            controller: 'user',
            action: 'index'
        }
        // routes that are highly mutable like URIs that match user names, pages, etc, are not advised to cache,
        // since they can take up a lot of memory
    }
    adminPanel: {
        uri: 'admin(/<controller>(/<action>(/<id>)))',
        defaults: {
            directory: 'admin', // make it look inside the app/classes/controllers/admin/ instead
            controller: 'dash', // the controller is in app/classes/controllers/admin/dash.js
            action: 'index' // actionIndex
        }
    },
    default: {
        // everything inside parenthesis are optional.
        uri: '(<controller>(/<action>(/<id>)))', // this will match /, /user, /user/create, /user/update/1 for example
        defaults: { // if the optional parts of the URL aren't defined, it will use the defaults below
            controller: 'Home', // app/classes/controllers/home.js
            action: 'index' // and actionIndex method
        },
        filters: function(req){
            // filters are optional, and can inject data inside the request.
            // the returned value of the function will be used instead of the original req.params
            // if you return false, the route will be rejected. this function like an express middleware (sort of)

            var params = req.params;
            if (req.method === 'POST') {
                params['hello'] = true;
            }
            return params;
        }
    }
};
```

In your app, you can create your URI from the route like this:

```js
sx.Route.url('default', {controller: 'index', action: 'use', id: 1}); // will generate /index/use/1
sx.Route.url('adminPanel', {controller: 'index', action: 'use', id: 1}); // will generate /admin/index/use/1
```

or with Dependency Injection:

```js
module.exports = {
    $deps: ['Route'],
    actionIndex: function(){
        this.$.Route.url('default', {controller: 'index', action: 'use', id: 1});
    }
};
```

or inside your views:

```ejs
<a href="<%= sx.Route.url('default', {controller: 'index', action: 'use', id: 1}) %>">Home</a>
```

## Models

Models in SX are merely a wrapper for the [promised-jugglindb](https://github.com/pocesar/promised-jugglindb) module,
that is [jugglingdb](https://github.com/1602/jugglingdb) with some "promises" sauce.
Every callback that you would do in jugglingdb becomes a promise:

First your define your model:

```js
// we are in app/classes/models/user.js, accessible in sx.models.User or sx.model('User')
module.exports = {
    $deps: [ // can use deps like any other class
        'models/Rights'
    ],
    $static: {
        // can also define static functions like any other class
    },
    $extend: 'Model', // must extend 'Model' or any derivatives
    $db: 'mongodb', // If not provided, it will be set to 'memory'
    $attrs: function(deferred){
        // the context (this) is the newly created model class (aka, this very own class, not the jugglingdb model!)

        // to access the jugglingdb model, use the deferred callback:
        deferred(function(model){
            // this function is intended to fine grain, patch, change, the created schema

            // this is called **ONCE** on app startup

            // its executed after the model was initialized with the schema below, it's a "promise resolve" callback
            // the context (this) is the same as the $attrs context

            model.validatesPresenceOf('name');

            model.prototype.getStatus = function(){
               return this.name + ': ' + (this.married ? 'Married': 'Single');
            };

            model.prototype.marry = function(date){
                this.married = true;
                this.extra = 'Married in ' + date;
            };

            model.prototype.isActive = function(){
                if (this.role !== 1) {
                    return this.active;
                }
                return false;
            };

            // You can also ensure the load of the needed model by using sx.model('Rights')
            // or this.Schema.models.Rights or sx.models.Rights, but those might not have been loaded yet,
            // so using $deps is the prefered way

            model.belongsTo(sx.model('Rights'), {as: 'right', foreignKey: 'userId'});
            model.hasMany(this.$.Rights, {as: 'rights', foreignKey: 'userId'}]);
            model.hasAndBelongsToMany('rights');
        });

        return {
            name: String,
            gender: String,
            married: Boolean,
            age: {type: Number, index: true},
            dob: Date,
            extra: this.Schema.Text, // special type Text
            createdAt: {type: Number, default: Date.now}
        };
    }
};
```

```js
// the model can be simplified:
module.exports = {
    $extend: 'Model',
    $db: 'redis', // if you don't specify this, it will be "memory"
    $attrs: {
        name: String,
        active: Boolean,
        role: Number
    },
    $functions: { // functions are included in the **jugglingdb model prototype**
        isActive: function(){
            if (this.role !== 1) {
                return this.active;
            }
            return false;
        }
    },
    $relations: {
        hasMany: 'Configs', // string = simple
        hasMany: ['Posts', {model: 'article'}], // array = elaborated
        //belongsTo: 'Admin', // model = Admin
        //hasAndBelongsToMany: 'Groups' // model = Group
    },
    findByUsername: function(username){
        // functions outside will be added to the sx model itself, and can act as helpers
        return this.findOne({where: {username: username}});
    }
};
```

Then you use it in your controller (or other models):

```js
// we are in app/classes/controllers/user.js
// those are reached through HTTP verbs
module.exports = {
    $deps: [
        'models/User'
    ],
    $extend: 'ControllerRest',
    find: function(req, res){ // GET, in this case, GET localhost/user(/1?)
        // or sx.models.User or sx.model('User')
        if (req.param('id')) {

            this.$.User.find(req.param('id')).then(function(user){
                if (user.isActive()) {
                    res.json(user);
                } else {
                    res.json({error: error});
                }
            }, function(error){
                res.json({error: error});
            });

        } else {

            this.$.User.all({where: {active: true}}).then(function(users){
                res.json(users);
            });

        }
    },
    update: function(req, res){ // POST, in this case, POST localhost/user/1
        // or sx.models.User or sx.model('User')

        this.$.User.find(req.param('id')).then(function(user){
            return user.updateAttributes(req.params);
        }, function(err){
            res.json({error: err});
        })
        .then(function(user){
            res.json(user);
        });

    },
    insert: function(req, res){ // PUT, in this case, PUT localhost/user

        var user = this.$.User.createNew(req.params);

        user.save().then(function(){
            res.json(true);
        }, function(){
            res.json(false);
        });

    },
    destroy: function(req, res){

    }
};
```

Notice that you may have multiple databases in your app, and use them all at once interchangeably. You may use Redis, Mongodb, Mysql, Postgre,
everything jugglingdb supports.

## Public data

`public` folders are available inside `system`, `modules` and `app` folder, so how can you serve them all at once?

If you are using Express to deliver your (please see FAQ below) public assets (css, images, javascript, etc),
then all your folders are "hooked up" when your app starts and served automatically.

Notice that the `app` folder will have a precedence over `modules` and `system`, that means, if you have two files
with the same name (eg: `logo.png`) inside a module in `modules/mymodule/public/logo.png` and in `app/public/logo.png`
it will serve only the `app` one.

## Testing

You notice the importance of testing when you have a lot of controllers and models that are decoupled, but must work in synergy.
Another thing that you notice is that, when you do code like this:

```js
// we are in app/classes/mystuff.js
var stuff = require('stuff');

function mystuff(){
    // use "stuff" inside
    return stuff({more: 'stuff'}).send();
};

module.exports = mystuff;

// ----------

// we are in test/mystuff.js
var mystuff = require('../app/classes/mystuff.js');

describe('mystuff', function(){
    it('should return a promise', function(){
        var myStuff = new mystuff();
        myStuff.stuff // ?! can't spy, mock, stub "stuff", it's not even available
    });
});
```

You cannot test it properly, what if "stuff" is a network module? What if it's a binding or you can't do much with it, like if it uses
lenghty timeouts, endless loops or asynchronous code?
You can't mock, stub, spy on "stuff". That's the importance of dependency injection:

```js
module.exports = {
    $deps: [
        {"stuff": "stuff"}
    ],
    construct: function(){
        // use this.$.stuff
    }
};
```

Now you have access to "stuff" and can mock any of these functions and it's prototype:

```js
describe('mystuff', function(){
    it('should return a promise', function(){
        var MyStuff = sx.classes.Mystuff;

        var stub  = sinon.stub(Mystuff.$.stuff, 'timeout', function(){ return; });

        var myNewStuff = new Mystuff();

        /* test it */
        expect(stub.calledWith(1,2)).to.be(true);

        Mystuff.$.stuff.timeout.restore();
    });
});
```

All you have to do is remember to restore any modifications you do to the functions, since they are part of your whole application.
SX comes with a file named 'common.js' and you can add your globals for your tests in there, and you must load it before your
spec files, so you have access to the sx global.

```js
// for example, the ./Gruntfile.js config with grunt-mocha-test
module.exports = function (grunt){
  grunt.initConfig({
    mochaTest: {
      test: {
        src    : ['./test/**/*.spec.js'],
        options: {
          require: ['./test/common.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['mochaTest']);
};
```

When testing controllers, you can load a controller on-the-fly by calling `sx.controller('yourcontroller')` and you may instantiate
it at will

```js
define('Home control', function(){
    it('should return a valid json', function(){
        var HomeCtrl = sx.controller('home');
        var User = sx.model('user');

        var req = {params: {id: '1'}};
        var after = sinon.spy(HomeCtrl, 'after');
        var findOne = sinon.spy(User, 'findOne');

        var res = sinon.stub({
            json: function(){}
        });

        HomeCtrl.execute(req, res);

        expect(res.json.args[0][0]).to.eql({username: 'joe', password: '...'});
        expect(after.called).to.be(true);
        expect(findOne.called).to.be(true);

        // Also, if you done any dependency injection on your controller, you may access it through
        // HomeCtrl.$.yourClass
        after.reset();
        res.json.reset();

        req.params.id = 'invalid';

        expect(function(){
            HomeCtrl.execute(req, res);
        }).to.throwException();

        expect(after.called).to.be(false);
    });
});
```

## Localization

The localization is done through the [l20n](https://github.com/l20n/l20n.js) module, it's a wrapper that extends the View to
support localizing strings in your templates.

As usual, you might want to use other localization engine, such as [i18n](https://github.com/mashpie/i18n-node)

Your localization files goes inside the `locales` folder, usually you'd want to put it in `app/locales`, but you may as well create
a module for each of your languages, and put them in `modules/en_module/locales/en.locale`. All `.locale` files are automatically
loaded (if any). l20n enables you to keep your translation files D.R.Y. (don't repeat yourself), so you can have one file
with all the variances on each language.

Example how a `default.locale` (or any other filename you'd want) would look like (that holds all your translation strings):

```php
<helloWorld[$lang]{
    *en: """
        Hello World
    """,
    de:"""
        Hallo Welt
    """,
    pt:"""
        Olá mundo
    """
}>
```

But you may want to put them in different files (this is the way preferred by l20n docs):

```php
// app/locales/en.locale
<helloWorld "Hello world">
```

```php
// app/locales/de.locale
<helloWorld "Hallo Welt">
```

```php
// app/locales/pt.locale
<helloWorld "Olá mundo">
```

The only drawback in this method is having to always keep all translation files up-to-date and
repeating code (when you shouldn't).

## FAQ (semi-srsly)

##### What kind of black magic does SX offer me?

It loads all your "classes" when your app starts, applies the config to each class that needs a config, and glue your routes to your
controllers automagically.

The assets, usually images, css, client-side javascript are entirely up to you (and your task runner \[like Grunt\]), it's advised
to use NGINX with Phusion Passenger, to deal with your public assets though, express shouldn't deal with content delivery and it isn't
up par to NGINX performance in that sense.

You can get away with an working app in a couple of minutes with minimal configuration.

##### Why the dollar ($) signs everywhere?

Mainly to avoid collisions with your own functions, plus, when you see a function with a leading $, you can almost assure it's a definition
from the framework.

##### What if I want to move to another framework? Isn't my code tied to SX?

Nope, hardly. Since everything (controllers, configs, routes, etc) is a module, and prefer to use dependency injection instead of using globals,
you can easily port over most of the code with minimal refactoring. Isn't this just "counter-advertising" _(?)_ to sx? Not in my book.

##### Where do I put my Express middleware?

Usually inside `$setup` in `$static`, since it's automatically executed when the class is loaded:

```js
// for example, in app/classes/myuses.js
module.exports = {
    $static: {
        use1: function(req, res, next) {
            next();
        },
        use2: function(req, res, next) {
            next();
        },
        $setup: function(sx){
            sx.app.use(this.use1);
            sx.app.use(this.use2);
        }
    }
}
```

But nothing stops you to go full sloppycode mode and do:

```js
// app/classes/my_middleware.js
sx.app.use(function(req, res, next){
    // I can't be tested, ever /o\
});
```

Or even (a little better):

```js
// modules/mymodulemiddleware/classes/stuff.js
module.exports = function(sx){
    sx.app.use(require('nodejs-middleware-module'));
    sx.app.use(require('nodejs-middleware-module2'));
};
```

##### But, but... writing code like that is a pain in the ass, I want an app full of globals, I never test my code and I hate conventions

That's not a question, but fret not, sir/madam. There are a plethora of other 'frameworks' that allow you to write sloppycode and
unmaintainable code for smaller _(?)_ projects! You got that base covered.

##### How can I contribute?

You may contribute to Socket Express by sending pull requests with proper testing.
Always create a new branch on your github repo for your feature before issuing a pull request.

License
=============

The MIT License (MIT)

Copyright © 2013-2014 Paulo Cesar http://socketexpress.net/

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

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/socket-express/core/trend.png)](https://bitdeli.com/free "Bitdeli Badge")