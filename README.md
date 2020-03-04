# @randajan/jetpack

> Collection of devtools

[![NPM](https://img.shields.io/npm/v/@randajan/jetpack.svg)](https://www.npmjs.com/package/@randajan/jetpack) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @randajan/jetpack
```

## About

Maping objects, generic creating variables (even instance) with default, filtering by types, lot other stuff

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
  * jet.type([], true) === ["array", "object"];
  * jet.type(RegExp()) === "regexp";

### __jet.type.define__
_Defining custom types for detecting, creating and copying_

* Arguments
  * priority: _number (>= 0)_
  * name: _string (name of the type)_
  * body: _class_
  * create: _function (for creating new instance)_
  * copy: _function (for perform copy)_
  * list: _function (retrieve keys of this type, if there is function it is also mapable=true)_
  * get: _function (retrieve key of this type)_
  * set: _function (set key of this type)_
  * rem: _function (remove key of this type)_
* Return
  * _true when successfully defined_
* Example
  * jet.type.define(-1, "array", Array, _=>new Array(), _=>Array.from(_), true);
  * jet.type.define(-1, "element", Element);

### __jet.isMapable__
_Return true on any type of variable that has mapable=true on its type definition_

* Arguments
  * any: _any variable_
* Return
  * _true when variable is mapable_
* Example
  * jet.isMapable([]) === true
  * jet.isMapable({}) === true;
  * jet.isMapable("foo") === false;

### __jet.isEmpty / jet.isFull__
_Catching empty mapable objects and NaN. isFull is just inverse of function isEmpty_

* Arguments
  * any: _any variable_
* Return
  * isEmpty: _true when variable is empty_
  * isFull: _true when variable is full_
* Example
  * jet.isEmpty([]) === true;
  * jet.isFull({foo:bar}) === true;

### __jet.is__
_Check the passed type with result from instanceof compare || jet.type || jet.isMap || jet.isEmpty || jet.isFull_

* Arguments
  * type: _string (type name) || class (for compare instanceof)_
  * any: _any variable_
  * inclusive: _boolean_
* Return
  * type=class: _any instanceof type_
  * type="mapable": _jet.isMapable()_
  * type="empty": _jet.isEmpty()_
  * type="full": _jet.isFull()_
  * inclusive=true: _true when the type is included in result of jet.type all=true_
* Example
  * jet.is(Array, []) === true;
  * jet.is("array", []) === true;
  * jet.is("object", []) === false;
  * jet.is("object", [], true) === true;
  * jet.is("regexp", RegExp()) === true;

### __jet.create__
_Will create instance by type (if there is defined create function)_

* Arguments
  * type: _string (type name)_
  * ...args: _will be passed to the creating function_
* Return
  * _new instance_
* Example
  * jet.create("mapable") == [];
  * jet.create("array", "foo", "bar") == ["foo", "bar"];
  * jet.create("object") == {};

### __jet.copy__
_Will create copy of instance (if there is defined copy function for its type)_

* Arguments
  * any: _any variable_
* Return
  * _new instance or the old if there isn't defined copy function_
* Example
  * jet.copy({a:1}) === Object.assign({}, {a:1});
  * jet.copy(["foo", "bar"]) === Array.from(["foo", "bar"]);

### __jet.filter / jet.get / jet.pull__ _/ jet.factory_
_Used for type function arguments, creating defaults and copy passed array/object_

* Arguments
  * type: _string (type name) || array/object (with sub array of whole arguments)_
  * ...args: _any variable (will be tested in order until the type will match)_
* Return
  * type=array/object: _result of recursive calling at the same key of array/object_
  * type=string: _single variable which type === the type argument_
  * filter: _undefined when there is no match_
  * get: _same as filter and try to create the type when there is no match_
  * pull: _same as get and try to copy variable if there is match_
* Example
  * jet.filter("string", 1, "foo", ["bar"], {foo:"bar"}) === "foo";
  * jet.get("array", 1, "foo", ["bar"], {foo:"bar"}) === ["bar"];
  * jet.filter("regexp", 1, "foo", ["bar"], {foo:"bar"}) == null;
  * jet.get("regexp", 1, "foo", ["bar"], {foo:"bar"}) == RegExp();
  * jet.pull([[map, {}], ["string", "foo"], ["regexp"]]) == [{}, "foo", RegExp()];

### __jet.key.list / jet.key.get / jet.key.set / jet.key.rem__ _/ jet.touch_
_Handle mapable objects (it requires defined type)_

* Arguments
  * any: _any variable_ 
  * key: _any variable (usually string or number)_
  * val: _any variable (used just for for set function)_
* Return
  * result from perform operation against the defined type_
* Example
  * jet.key.get({foo:"bar"}, "bar") === "bar";

### __jet.run__
_Will run every function that will discover without collecting results_

* Arguments
  * any: _any (function || array/object with functions_
  * ...args: _arguments will be passed to every call_
* Return
  * any=function: _true when it was run successfully_
  * any=array/object: _count of succesfully runned functions_
* Example
  * jet.run(_=>console.log(_)) === true _console: "foo"_


## License

MIT © [randajan](https://github.com/randajan)
