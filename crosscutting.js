(function(context) {

  "use strict";

  var aSlice = [].slice,
    ownKey = {}.hasOwnProperty,
    toString = {}.toString,
    argumentError = new Error("argument is invalid"),
    cannotApplyBuiltInError = new TypeError("cannot apply aop on Built-in Type"),
    adviceFunctionInvalidError =
      new Error("advice function is invalid. It should be function type");

  // polyfill
  Object.getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return (obj.constructor) ? obj.constructor.prototype : {};
  };

  Object.freeze = Object.freeze || function(obj) {
    return obj;
  };

  Object.create = Object.create || function(obj) {
    var O = function(){};
    O.prototype = obj;
    return new O();
  };
  Array.prototype.forEach = Array.prototype.forEach || function ( callback, thisArg ) {
    var T, k;
    if ( this == null ) {
      throw new TypeError("this is null or not defined");
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (toString.call(callback) !== "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }
    if(thisArg) {
      T = thisArg;
    }
    k = 0;
    while(k < len) {
      var kValue;
      if (ownKey.call(O, k) ) {
        kValue = O[k];
        callback.call( T, kValue, k, O );
      }
      k++;
    }
  };

  var root = context,
    crosscutting = Object.create(null);

  var preventConflictName = root.crosscutting;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = crosscutting;
    }
    exports.crosscutting = crosscutting;
  }
  else {
    root.crosscutting = crosscutting;
  }

  var types = [ 'Function', 'Number', 'String', 'Date', 'RegExp', 'Boolean' ],
    checker = function(type) {
      crosscutting['is' + type] = function(obj) {
        return toString.call(obj) === '[object ' + type + ']';
      };
    };
  for(var t = 0,len = types.length; t < len; t++) {
    checker(types[t]);
  }
  crosscutting.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };
  crosscutting.isObject = function(obj) {
    return obj === Object(obj);
  };

  var INGNORE_TYPES = [
    Function.prototype,
    Number.prototype,
    String.prototype,
    Date.prototype,
    Boolean.prototype,
    Object.prototype,
    Date.prototype,
    Array.prototype
  ];

  crosscutting.noConflict = function() {
    root.crosscutting = preventConflictName;
    return this;
  };

  // Utils

  var argumentsToArray = function(args){
    return aSlice.call(args);
  };
  crosscutting.argumentsToArray = argumentsToArray;

  // AOP

  /**
   * options = {
   *    args: arguments, // function "Arguments" object
   *    target: target, // context(this) object
   *    todo: todo, // aop target function
   *    advice: advice, // advice function
   *    type: type, // advice type
   *    method: method name // join aop method name
   * }
   */
  var AdviceType = {
    "BEFORE": function(options) {
      var aValue = options.advice.call(options.target, options);
      var rValue = options.todo.apply(options.target, argumentsToArray(options.args));
      return aValue || rValue;
    },
    "AFTER": function(options) {
      var rValue = options.todo.apply(options.target, argumentsToArray(options.args));
      var aValue = options.advice.call(options.target, options);
      return aValue || rValue;
    },
    "AROUND": function(options) {
      return options.advice.call(
        options.target,
        function() {
          return options.todo.apply(
            options.target,
            argumentsToArray((arguments[0]) ? arguments : options.args)
          );
        },
        options
      );
    },
    "EXCEPTION": function(options) {
      try {
        return options.todo.apply(options.target, argumentsToArray(options.args));
      }
      catch(exception) {
        options.exception = exception;
        return options.advice.call(options.target, options);
      }
    }
  };

  var Pointcut = function(matcher) {
    this.matcher = matcher;
  };
  Pointcut.prototype.isMatch = function(value) {
    if(crosscutting.isBoolean(this.matcher)) {
      return this.matcher;
    }
    if(crosscutting.isRegExp(this.matcher)) {
      return this.matcher.test(value);
    }
    else if(crosscutting.isFunction(this.matcher)) {
      return this.matcher(value);
    }
    else {
      throw argumentError;
    }
  };

  var Advice = function(action) {
    action.$crosscutting = {
      wrap: true
    };
    return action;
  };

  var cut = function(target, todo, type, advice, method) {
    var f = function() {
      return type({
        args: arguments,
        target: target,
        todo: todo,
        advice: advice,
        type: type,
        method: method
      });
    };
    f.name = method;
    return f;
  };

  var weave = function(objs, pointcut, type, advice) {

    if(!crosscutting.isArray(objs)) {
        objs = [objs];
    }

    objs.forEach(function(obj) {
      INGNORE_TYPES.forEach(function(ignore) {
        if(ignore === obj) {
          throw cannotApplyBuiltInError;
        }
      });

      if(crosscutting.isString(type)) {
        type = AdviceType[type.toUpperCase()];
      }
      var prop;
      for(var val in obj) {

        //contain all properties in prototype-chain.
        //noinspection JSUnfilteredForInLoop
        prop = val;

        if(!crosscutting.isString(prop)) {
          continue;
        }
        var p = obj[prop];
        if(crosscutting.isFunction(p) && pointcut.isMatch(prop)) {
          obj[prop] = cut(obj, p, type, advice, prop);
        }
      }
    });
    return this;
  };

  crosscutting.Aspect = {
    Pointcut: Pointcut,
    Advice: Advice,
    weave: weave,
    AdviceType: AdviceType
  };

  crosscutting.before = function(obj, pointcut, advice) {
    crosscutting.weave(obj, pointcut, AdviceType.BEFORE, advice);
    return this;
  };
  crosscutting.after = function(obj, pointcut, advice) {
    crosscutting.weave(obj, pointcut, AdviceType.AFTER, advice);
    return this;
  };
  crosscutting.around = function(obj, pointcut, advice) {
    crosscutting.weave(obj, pointcut, AdviceType.AROUND, advice);
    return this;
  };
  crosscutting.exception = function(obj, pointcut, advice) {
    crosscutting.weave(obj, pointcut, AdviceType.EXCEPTION, advice);
    return this;
  };

  // Argument Validation AOP
  weave(
    crosscutting.Aspect,
    new Pointcut(/^weave$/),
    crosscutting.Aspect.AdviceType.BEFORE,
    function(options) {
      if(!options.args || options.args.length < 3) {
        throw argumentError;
      }
      if(!crosscutting.isObject(options.args[0])) {
        throw argumentError;
      }
      if(!crosscutting.isFunction(options.advice)) {
        throw adviceFunctionInvalidError;
      }

      if(!options.advice.$crosscutting) {
        options.advice = new Advice(options.advice);
      }
      // if second arguments is not Pointcut object, transform it.
      if(!(options.args[1] instanceof Pointcut)) {
        options.args[1] = new Pointcut(options.args[1]);
      }
    }
  );

  crosscutting.weave = crosscutting.Aspect.weave;

  // Freeze. Only ES 5+
  Object.freeze(crosscutting);

})(this);