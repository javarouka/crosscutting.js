(function(context) {

  "use strict";

  var aSlice = [].slice,
    argumentError = new Error("argument is invalid"),
    adviceFunctionInvalidError =
      new Error("advice function is invalid. It should be function type");

  Object.freeze = Object.freeze || function(obj) {
    return obj;
  };

  // polyfill
  Object.keys = Object.keys || function(obj) {
    var ret = [];
    for(var k in obj) {
      if(!ownKey.call(obj, k)) {
        continue;
      }
      ret.push(k);
    }
    return ret;
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
    if ({}.toString.call(callback) !== "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }
    if(thisArg) {
      T = thisArg;
    }
    k = 0;
    while(k < len) {
      var kValue;
      if (({}).hasOwnProperty.call(O, k) ) {
        kValue = O[k];
        callback.call( T, kValue, k, O );
      }
      k++;
    }
  };

  var root = context,
    raop = Object.create(null);

  var preventConflictName = root.raop;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = raop;
    }
    exports.raop = raop;
  }
  else {
    root.raop = raop;
  }

  var types = [ 'Function', 'Number', 'String', 'Date', 'RegExp' ],
    ownKey = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    checker = function(type) {
      raop['is' + type] = function(obj) {
        return toString.call(obj) === '[object ' + type + ']';
      };
    };
  for(var t = 0,len = types.length; t < len; t++) {
    checker(types[t]);
  }
  raop.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };
  raop.isObject = function(obj) {
    return obj === Object(obj);
  };

  raop.noConflict = function() {
    root.raop = preventConflictName;
    return this;
  };

  // Object =========================================================

  raop.each = function(obj, iter) {
    if(obj.forEach) {
      obj.forEach(iter);
    }
    else if(raop.isObject(obj)) {
      var k;
      for(k in obj) {
        if(!ownKey.call(obj, k)) {
          continue;
        }
        iter.call(obj, obj[k], k);
      }
    }
    else {
      iter(obj);
    }
  };

  raop.extend = function(dst, src) {
    raop.each(src, function(v, k) {
      dst[k] = v;
    });
    return obj;
  };

  // Object end =========================================================

  // Utils ==============================================================

  var argumentsToArray = function(args){
    return aSlice.call(args);
  };

  // Utils end ==========================================================

  // AOP =========================================================

  /**
   * {
   *    args: arguments,
   *    target: target,
   *    todo: todo,
   *    advice: advice,
   *    type: type
   * }
   */
  var AdviceType = {
    BEFORE: function(options) {
      var aValue = options.advice.call(options.target, options);
      var rValue = options.todo.apply(options.target, argumentsToArray(options.args));
      return aValue || rValue;
    },
    AFTER: function(options) {
      var rValue = options.todo.apply(options.target, argumentsToArray(options.args));
      var aValue = options.advice.call(options.target, options);
      return aValue || rValue;
    },
    AROUND: function(options) {
      return options.advice.call(options.target, options);
    },
    EXCEPTION: function(options) {
      try {
        return options.todo.apply(options.target, argumentsToArray(options.args));
      }
      catch(exception) {
        options.exception = exception;
        return options.advice.call(options.target, options);
      }
    }
  };

  // TODO: 구현 필요
  var Pointcut = function(exprssion) {
    return exprssion;
  };

  var Advise = function(action, type) {
  };

  var cut = function(target, todo, type, advice) {
    return function() {
      return type({
        args: arguments,
        target: target,
        todo: todo,
        advice: advice,
        type: type
      });
    };
  };

  var weave = function(obj, pointcut, type, advice) {
    var keys = Object.keys(obj);
    if(raop.isString(type)) {
      type = AdviceType[type.toUpperCase()];
    }
    keys.forEach(function(val/*,i, me*/) {
      var p = obj[val];
      if(raop.isFunction(p) && pointcut.test(val)) {
        obj[val] = cut(obj, p, type, advice);
      }
    });
  };


  raop.Aspect = {
    Pointcut: Pointcut,
    Advise: Advise,
    weave: weave,
    AdviceType: AdviceType
  };

  // Argument Validation AOP
  weave(
    raop.Aspect,
    /^weave$/,
    raop.Aspect.AdviceType.BEFORE,
    function(options) {
      if(!options.args) {
        throw argumentError;
      }
      if(!options.type) {
        options.type = AdviceType.AROUND;
      }
      if(!raop.isFunction(options.advice)) {
        throw adviceFunctionInvalidError;
      }
    }
  );

  // Freeze. Only ES 5+
  Object.freeze(raop);

  // AOP end =========================================================

})(this);