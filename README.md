[![Build Status](https://travis-ci.org/pocesar/node-socketexpress.png?branch=develop)](https://travis-ci.org/pocesar/node-socketexpress)

Socket Express (SX for short)
=============

When realtime and stateless HTTP get together, and live happily ever after.
HMVC (Hierarchical model–view–controller) framework built on top of [Primus](https://github.com/primus/primus) and [Express.js](https://github.com/visionmedia/express) (that might change to [Koa](https://github.com/koajs/koa) in near future when generators arrive to node stable) for [Node.js](http://nodejs.org),
inspired somehow by the simplicity of PHP Kohana framework (sorry, not another Rails clone/port for Node for you), using _almost_ nothing more than already existing packages in NPM but with some consistent, maintainable, _cascading "class-based" Javascript_ glue together.

Highlights
=============

* No DSL
* No new jargon to learn
* Built around the _Repository Pattern_, _Dependency Injection Pattern_ and based on _Pub/Sub_ for events (through `postal.js`)
* Plain Javascript (or Coffeescript if you fancy that, the source of sx itself is written in Coffeescript)
* Nothing is enforced, you only need to follow folder structure, place the files where they belong, and you are set
* Convention over configuration
* Everything are _classes_ that you can extend to override behavior or add functionality, but favoring _Object Composition_ over _Class Inheritance_ in most cases (changing base classes don't change subsequent classes and perform faster)
* There's only one sexy global namespace that rhymes: `sx`
* No nested _callback hell_, almost everywhere you can use Q Promises library
* Ready for node 0.8, 0.10 and 0.11
* Intuitive naming for core classes, minimizing the need to keep going to the documentation to understand
* Free from _require hell_, using some magic through convention and loading mechanisms through automated dependency injection
* Focused on tests (testing and testability), it's really easy to test, `modules`, `controllers`, `views`, `models`, it's always available through your entire app

Install
=============

```bash
$ npm install socket-express -g
```

Start a new app
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

It will update the Socket Express system folder and dependencies

App load order
=============

Your whole app is loaded when the server is loaded. In Node.js realm, there's no such thing as per request compilation + execution (if you are coming from a Rails or PHP framework background).

So, every config, every controller, route, view, are loaded on the startup, and the calls are directed to their places and are always available.

Just to make clear that it's not the same as PHP that the code is compiled everytime you visit a page and load only the _important_ parts to save memory.

Files are loaded from the folders in this order: `system`, then `modules` then `app` folder, and each folder class can overwrite / overload existing classes and/or extend/get rid of it.

Conventions
=============

## Cascading file system (CFS), Factory and Repositories

Most of the time you'll want to create your own classes, or extend the core classes using the `sx.factory` method,
this is what makes your classes and code be available in your entire app, without needing to use `require` or
reading the files manually. All the classes created are stored in the `sx.classes` _repository_, and they return
the uninstantiated class. The `sx.*classname*` is the shortcut class taken from the `sx.classes.*classname*`:

```js
sx.classes.View // this is a base class, that you can extend your own classes
sx.View // this doesn't exists
sx.classes.Url // this exists and it's a $singleton
sx.Url // since it's a singleton, it's automatically instantiated
```

You may not want to instantiate a class (like the case of `View` class), for that, because it's a building block and
must be extended to have a functionality. For example:

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
    }
}
```

Singletons are always instantiated, because they serve as static helpers
and must be available everywhere in your code. To create a singleton, you can use:

```js
// we are in app/classes/myhelper.js
module.exports = {
    $singleton: true, // another special definition that tells the factory to create a static class (that don't need instantiation)
    staticMethod: function(){

    },
    staticMethod2: function(){
        return function(){};
    },
    staticVar: 1
}

sx.Myhelper.staticMethod();

sx.Myhelper.implement({
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

console.log(sx.classes.MyClass.staticFunction); // function
console.log(sx.classes.MyClass.prototypeFunction); // undefined
console.log(sx.classes.MyClass.create().prototypeFunction); // function
```

##### You can extend any core classes, rewrite how it works, or simply add more functionality.

To do this simply do

```js
sx.Url.implement({
    cool: function(){ }
});
```

this will extend the core class `Url` and add the `cool` method, because the `Url` class is a
singleton. The nature of a singleton cannot be changed, a singleton will always be a singleton.

You may also want to rewrite some of the functionality maybe? Using `implement`, you can extend a helper

```js
sx.Url.implement({
    title: function(name){
        return this.$super(name, '-', true);  // call the super function, that is, the original sx.Url.title
    }
});
```

or you want to create a new class from the base of another. Notice the call to the
`this.$super`, that calls the original `title` function ultra cool your-own `Url` class,
but still use the provided core `Url` class, use `$implement`.
`$implement` adds other classes to your class, but doesn't add any inheritance to them.

```js
// we are in app/classes/cool_url.js
module.exports = {
    $implement: 'Url',
    /*
    these all work the same way

    $implement: ['Url'],
    $implement: sx.Url,
    $implement: [sx.Url],
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
Take it that you don't like using [forms](https://github.com/caolan/forms) module for validation in the `Form` class, for example.
Instead, you really want to use [validator](https://github.com/chriso/node-validator):

```js
// create the file in app/classes/form.js
module.exports = {
    $deps: [
        {'validator': 'validator'} // require validator
    ]
    $setup: function(){
        // we want to configure validator as per docs
        var Validator = this.$.validator.Validator;

        Validator.prototype.error = function (msg) {
            this._errors.push(msg);
            return this;
        }

        Validator.prototype.getErrors = function () {
            return this._errors;
        }
    },
    validate: function(request, rules) {
        // let's just ignore the original code for create and do our own called sx.Form.validate(req, {rules})
        // keep it civilized by using promises, will ya?

        // overwrites the original validate, that instead of form, take rules object

        var
            validator = new this.$.validator.Validator(), errors = [],
            d = this.$.Q.defer();

        for(var field in rules){
            // rules is an object comprised of {nameOfField: {ruleType: [args]}}
            var check = validator.check(request.param(field)); // undefineds will issue an error
            for (var rule in rules[field]) {
                // rules[field] is an object comprised of {ruleType: [args], ruleType2: [args]}
                check[rule].apply(validator, rules[field][rule]);
            }
        }

        if (errors = validator.getErrors()) {
            d.reject(errors, validator);
        } else {
            d.resolve(validator);
        }

        return d.promise;
    }
}
```

##### To create your own helpers and classes, use `sx.factory`

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

It's a good practice to keep each class in their own file, so it's maintainable and easy to goto. But
nothing stops you to create as many `factory`s in the same file:

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
```

Extending existing classes, you don't need to do anything, but to name your file with the name of the existing class:

```js
// we are in app/classes/route.js
module.exports = function(parent){
    // "this" is the current class definition
    // you can use this.include() to add functions and properties to the prototype

    // Using a function instead of an object is good since you can keep private data,
    // and share between other classes

    // Always return your definition
    // You can use all the "modifiers" here:
    // $static, $singleton (if it's always a singleton, you can't change it), $dependencies, etc
    return {
        superMatch: function(){}
    };
}
```
#### Dependency injection

##### Now, your class might depend on some other class or require, that must be loaded in order for it to work. Dependency injection to the rescue:

```js
// we are in app/classes/some_class.js
module.exports = {
    $deps: [
        'Url',     //
        'Route',   // load these classes from the classes repository inside sx.classes
        'Locale',  //
        {'_s': 'underscore.string'}, //
        {'accounting': 'accounting'}, // require('accounting') and name it accounting in this.$.accounting
        {'XRegExp': ['xregexp', 'XRegExp'] // requires 'xregexp' module and use the 'XRegExp' variable, like require('xregexp').XRegExp
    ],
    construct: function(){
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
        $setup: function(){ // this is a special function that is called ONCE when this file is required and made into a javascript class
            this.implement(this.$.accounting, true); // Inherit the prototype of accounting
        }
    }
}
```

* Passing a string will try to inject other classes from SX. Eg: `'Url','Bootstrap'`
* Passing an object will inject a regular node.js module.

```js
    {'_': 'lodash'}
    // act as
    _ = require('lodash')
```

* Passing an object with an array will inject a regular node.js module but using a variable from the require.

```js
    {'XRegExp': ['xregexp', 'XRegExp']}
    // act as
    XRegExp = require('xregexp').XRegExp
```

This makes your module or code loosely coupled and more testable, but you can always
use the `sx.classes.Url` or `sx.classes.Route` or `sx.classes.Locale` for example,
since the `sx` global got everything you need.

#### File names

Naming your files is very important, so you don't lose track of the generated classes.
It's recommended that you use lowercase filenames without spaces or dashes. If you'd want
your class to look like `MyAwesomeClass`, you'd name your file `my_awesome_class.js`, as
underscores are converted to CamelCase.

## Controllers

Your controllers go into `app/classes/controller/`, with a lowercase filename, and a class extending:

* `Controller`: A controller that does nothing at first, only respond to routes, you decide what it should return
* `ControllerTemplate`: A controller that automatically render content inside the 'content' var in the template
* `ControllerRest`: A regular controller that responds to REST commands (DELETE, PUT, POST, GET, that maps to destroy, create, update and get)
* `ControllerRealtime`: A realtime controller that uses Primus to push updates to the browser using Websockets (when available)
* `ControllerAjax`: A controller that can respond to AJAX requests automatically

as a string (core class), CamelCased.

```js
// we are in app/classes/controller/index.js
// will be available in sx.controllers.Index
module.exports = {
    $extend: 'Controller', // need to explicitly tell which controller to extend, any changes to the Controller class reflects in this new controller as well
    'actionIndex': function(){
    }
}

// we are in modules/mymodule/controller/index.js
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

// we are in app/classes/controller/contact.js
// will be available in sx.controllers.Contact
module.exports = {
    $extend: 'Master', // We are extending from a class that extends from ControllerTemplate
    'actionIndex': function(){
        this.actionLogin();
    }
}

// we are in app/classes/controller/load.js
// You can include mixins and base classes as well, changes to original classes
// won't reflect in the mixin'd class
module.exports = {
    $implement: ['Master','ControllerRest'] // effectivelly, we are extending from ControllerTemplate and ControllerRest, and mixin their declarations together
    /* ... */
}
```

All controllers from the app are available in `sx.controllers`. Controllers inside folders have their own namespace:

```js
console.log(sx.controllers.Index.render()) // in app/classes/controller/index.js
console.log(sx.controllers.Admin.Index.render()) // in app/classes/controller/admin/index.js
console.log(sx.controller('Admin.Index').render()); // getter that makes it easier to return a controller using an string
console.log(sx.controller(['Admin','Index']).render()); // getter that makes it easier to return a controller using an array
```

Since each module has also their own namespace, they will be available in their respective module:

```js
console.log(sx.modules.mymodule.controllers.Index.render()) // index from the module
console.log(sx.module('mymodule.controllers.Index').render()); // getter that makes it easier to return a module using an string
console.log(sx.module(['mymodule','controllers','Index']).render()); // getter that makes it easier to return a module using an array
```

NOTE: Controllers of same name are overwritten (controllers don't extend each other, you must explicitly extend them)

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
// you can read it as sx.configs.MyConfig.get('myconfig') or sx.configs.MyConfig.data.myconfig (if you are concerned about performence on using a getter)
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

clone your data

##### Config.set(key, value)

set values on your config. can pass in `'key', 'value'`, or an object with `{'key':'value'}`.
Existing values will be overwritten.

##### Config.wipe()

either wipe your data, or exchange it if you pass in another object

##### Config.unset(name)

deletes a key on your config

##### Config.get(name, inexistant)

returns the value of the `name` if it exists, or the `inexistant` value. Eg.: `Config.get('dontexist', 'boo')` returns `'boo'`

##### Config.isset(name)

checks if a key is set (it can be null, false or zero, but not undefined)

##### Config.env(name)

you may have a setting for each environment, and the Config makes it easy to set which environment it should use.
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

If you call it `Config.env()` (without a name), it will try to use the `process.env.NODE_ENV`, and the other definitions will be deleted (including the `*` and will be merged in one config).

## Views

## Models

Models in SX are merely a wrapper for the [jugglingdb](https://github.com/1602/jugglingdb) module, with some "promises" sauce.
Every callback that you would do in jugglingdb becomes a promise:

First your define your model:

```js
// we are in app/classes/models/user.js, accessible in sx.models.User
module.exports = {
    $deps: [ // can use deps like any other class
        'model/Rights'
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
// the model can be over simplified:
module.exports = {
    $extend: 'Model',
    $db: 'redis', // if you don't specify this, it will be "memory"
    $attrs: {
        name: String,
        active: Boolean,
        role: Number
    },
    $functions: {
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
    }
};
```

Then you use it in your controller (or other models):

```js
// we are in app/classes/controller/user.js
// those are reached through HTTP verbs
module.exports = {
    $deps: [
        'model/User'
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

You cannot test it properly, what if "stuff" is a network module? What if it's a binding or you can't do much with it, like if it uses lenghty timeouts, endless loops or asynchronous code?
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
        var stub  = sinon.stub(sx.classes.Mystuff.$.stuff, 'timeout', function(){ return; });

        var myNewStuff = new sx.classes.Mystuff();

        /* test it */

        sx.classes.Mystuff.$.restore();
    });
});
```

All you have to do is remember to restore any modifications you do to the functions, since they are part of your whole application.
This isn't "Testing 101", it's just showing that everything can be encapsulated along with your classes or modules using dependency injection.

When testing controllers, you can load a controller on-the-fly by calling `sx.controller('yourcontroller')` and you may instantiate it at will

```js
define('Home control', function(){
    it('should return a valid json', function(){
        var HomeCtrl = new sx.controller('home');
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


## FAQ (semi-srsly)

##### What kind of black magic does SX offer me?

It loads all your "classes" when your app starts, applies the config to each class that needs a config, and glue your routes to your controllers automagically.
The assets, usually images, css, client-side javascript are entirely up to you (and your task runner \[like Grunt\]), it's advised to use NGINX (for example), to deal with your assets though, express isn't up par to its performance
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
sx.app.use(function(req, res, next){
    // I can't be tested, ever \o/
});
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