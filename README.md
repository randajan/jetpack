# @randajan/jetpack

> Collection of devtools

[![NPM](https://img.shields.io/npm/v/@randajan/jetpack.svg)](https://www.npmjs.com/package/@randajan/jetpack) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @randajan/jetpack
```

## About

Custom types, maping objects, generic creating, filtering by types & other stuff

## Main content

### __jet.type__
_Superstructure of native typeof and instanceof methods_

* Arguments
  * any: _any variable_
  * all: _boolean (return all types?)_
* Return
  * all=false || undefined: _top type of variable_
  * all=true: _array with all types of variable sorted by its priority_
* Example
  * jet.type([], true) === ["arr", "object"];
  * jet.type(RegExp()) === "regex";

### __jet.type.define__
_Defining custom types for detecting, creating and copying_

* Arguments
  * name: _string (name of the type)_
  * constructor: _class_
  * opt: _object_
    * rank: _number (>= 0)_
    * create: _function (creating new instance)_
    * is: _function (verify type of variable)_
    * full: _function (check if variable is full)_
    * copy: _function (perform copy)_
    * rnd: _function (create with random content)_
    * keys: _function (array of keys for mapable types)_
    * vals: _function (array of values for mapable types)_
    * pairs: _function (array of entries for mapable types)_
    * get: _function (get key for mapable types)_
    * set: _function (set key for mapable types)_
    * rem: _function (rem key for mapable types)_
  * custom: _object (functions that should be appended to jet.*)_
* Return
  * _object similiar to jet.* when successfully defined_
* Example
  * jet.type.define("arr", Array, { rank:-1, create:x=>new Array(x), copy:x=>Array.from(x) } );
  * jet.type.define("ele", Element, { rank:-1 }, { find:query=>document.querySelector(query) });

### __jet.type.is__
_Check the passed type with result from instanceof compare || jet.type_

* Arguments
  * type: _string (type name) || class (for compare instanceof)_
  * any: _any variable_
  * inclusive: _boolean_
* Return
  * type=class: _any instanceof type_
  * inclusive=true: _true when the type is included in result of jet.type all=true_
* Example
  * jet.is(Array, []) === true;
  * jet.is("arr", []) === true;
  * jet.is("obj", []) === false;
  * jet.is("obj", [], true) === true;
  * jet.is("regex", RegExp()) === true;

### __jet.type.is.map__
_Return true on any type of variable that has mapable=true on its type definition_

* Arguments
  * any: _any variable_
* Return
  * _true when variable is mapable_
* Example
  * jet.is.map([]) === true
  * jet.is.map({}) === true;
  * jet.is.map("foo") === false;

### __jet.type.is.full__
_Catching empty mapable objects and NaN_

* Arguments
  * any: _any variable_
* Return
  * _true when variable is full_
* Example
  * jet.is.full([]) === false;
  * jet.is.full({foo:bar}) === true;

### __jet.*__
_Will create instance requested * type (use without "new")_

* Arguments
  * ...args: _will be passed to the creating function_
* Return
  * _new instance_
* Example
  * jet.arr("foo", "bar") == ["foo", "bar"];
  * jet.obj() == {};
  * jet.ele() == <div></div>;

### __jet.*.is / .is.full__
_Same as jet.type.is && jet.type.is.full but without first argument_

### __jet.*.copy__
_Will create copy of instance_

* Arguments
  * any: _any variable_
* Return
  * _new instance or the old if there isn't defined copy function_
* Example
  * jet.obj.copy({a:1}) == Object.assign({}, {a:1});
  * jet.arr.copy(["foo", "bar"]) == Array.from(["foo", "bar"]);

### __jet.*.only / .tap / .full / .pull__
_Used for selecting, filtering, creating or copying variables_

* Arguments
  * ...args: _any variable (will be tested in order until the type will match)_
* Return
  * only: _undefined when there is no match_
  * full: _same as only but variable must be full_
  * tap: _same as only but try to create the type when there is no match_
  * pull: _same as tap but try to copy variable if there is match_
* Example
  * jet.str.only(1, "foo", [], ["bar"], {foo:"bar"}) == "foo";
  * jet.arr.tap(1, "foo", [], ["bar"], {foo:"bar"}) == [];
  * jet.arr.full(1, "foo", [], ["bar"], {foo:"bar"}) == ["bar"];
  * jet.regex.only(1, "foo", [], ["bar"], {foo:"bar"}) == null;
  * jet.regex.tap(1, "foo", [], ["bar"], {foo:"bar"}) == RegExp();
  * jet.obj.pull(1, "foo", [], ["bar"], {foo:"bar"}) == {foo:"bar"}

### __jet.map.vals / .keys / .pairs / .get / .set / .rem__
_Handle mapable objects (it requires defined type)_

* Arguments
  * any: _any variable_ 
  * key: _any variable (usually string or number)_
  * val: _any variable (used just for for set function)_
* Return
  * result from perform operation against the defined type_
* Example
  * jet.map.get({foo:"bar"}, "bar") === "bar";

### __jet.map.dig__
_Return value from deep nested object_

* Arguments
  * any: _any mapable variable_ 
  * path: _string or Array (even nested Array)_
  * def: _any_
* Return
  * find value or def when no value was found
* Example
  * jet.map.dig({foo:["bar"]}, "foo.0") == "bar";
  * jet.map.dig({foo:["bar"]}, ["foo", 1], "foo") == "foo";

### __jet.map.it / .of__
_Map any mapable object by default: Object, Array, Set, Map, Pool_

* Arguments
  * any: _any mapable variable_ 
  * fce: _function(val, key, path) (handler)_
  * deep: _boolean (recursive maping)_
* Return
  * it: _flat array containing all items_
  * of: _copy of structure with result from handler function_
* Example
  * jet.map.it({foo:"bar"}, _=>_) == 1;
  * jet.map.of({foo:"bar"}, _=>"foo"+_) == {foo:"foobar"};


### __jet.fce.run__
_Will run every function that will discover without collecting results_

* Arguments
  * any: _any (function || array/object with functions_
  * ...args: _arguments will be passed to every call_
* Return
  * any=function: _true when it was run successfully_
  * any=array/object: _count of succesfully runned functions_
* Example
  * jet.fce.run(_=>console.log(_)) === true _console: "foo"_


## License

MIT © [randajan](https://github.com/randajan)
