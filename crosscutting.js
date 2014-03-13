(function (factory) {
  if (typeof define === 'function' && define.amd) { define(factory); }
  else if (typeof exports === 'object') { module.exports = factory(); }
  else { window['crosscutting'] = factory(); }
})(function() {
  "use strict";
  var aSlice = [].slice,
    toString = {}.toString,
    argumentError = new Error("argument is invalid"),
    cannotApplyBuiltInError = new TypeError("cannot apply aop on Built-in Type"),
    adviceFunctionInvalidError = new Error("advice function is invalid. It should be function type"),
    crosscutting = {},
    types = [ 'Function', 'Number', 'String', 'Date', 'RegExp', 'Boolean' ],
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
    ],
    INGNORE_TYPES_LEN = INGNORE_TYPES.length,
    argumentsToArray = function(args){
      return aSlice.call(args);
    };
  crosscutting.argumentsToArray = argumentsToArray;

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
  },
  cut = function(target, todo, type, advice, method) {
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
    f['methodName'] = method;
    return f;
  },
  weave = function(objs, pointcut, type, advice) {
    var i, j, l, obj;
    if(!crosscutting.isArray(objs)) {
        objs = [objs];
    }
    for(i = 0, l = objs.length; i < l; i++) {
      obj = objs[i];
      for(j = 0; j < INGNORE_TYPES_LEN; j++) {
        if(INGNORE_TYPES[j] === obj) {
          throw cannotApplyBuiltInError;
        }
      }
      if(crosscutting.isString(type)) {
        type = AdviceType[type.toUpperCase()];
      }
      var prop;
      for(var val in obj) {
        prop = val;
        if(!crosscutting.isString(prop)) {
          continue;
        }
        var p = obj[prop];
        if(crosscutting.isFunction(p) && pointcut.isMatch(prop)) {
          obj[prop] = cut(obj, p, type, advice, prop);
        }
      }
    }
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
      if(!(options.args[1] instanceof Pointcut)) {
        options.args[1] = new Pointcut(options.args[1]);
      }
    }
  );
  crosscutting.weave = crosscutting.Aspect.weave;
  return crosscutting;
});