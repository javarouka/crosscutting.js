/**
 */
(function(context) {

  "use strict";

  // polyfill
  Object.keys = Object.keys || function(obj) {
    var ret = [];
    for(var k in obj) {
      if(!ownKey.call(obj, k)) continue;
      ret.push(k);
    }
    return ret;
  };

  Object.create = Object.create || function(obj) {
    var object = function(){};
    object.prototype = obj;
    return new object();
  };

  if(!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach( callback, thisArg ) {
      var T, k;
      if ( this == null ) {
        throw new TypeError( "this is null or not defined" );
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
        if (Object.prototype.hasOwnProperty.call(O, k) ) {
          kValue = O[k];
          callback.call( T, kValue, k, O );
        }
        k++;
      }
    };
  }

  var root = context;
  var raop = Object.create(null);
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

  var types = [ 'Function', 'Number', 'String', 'Boolean', 'Array', 'Date', 'RegExp' ],
      ownKey = Object.prototype.hasOwnProperty,
      toString = Object.prototype.toString;
  for(var t = 0,len = types.length; t < len; t++) {
    (function(type) {
      raop['is' + type] = function(obj) {
        return toString.call(obj) === '[object ' + type + ']';
      }
    })(types[t]);
  }
  raop.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]'
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
        if(!ownKey.call(obj, k)) continue;
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

  // AOP =========================================================

  raop.Pointcut = function(exprssion) {
  };

  raop.Advise = function(action) {
  };

  raop.Aspect = {
    weave: function(obj, pointcut, action) {
      var keys = Object.keys(obj);
      keys.forEach(function(val/*,i, me*/) {
        var p = obj[val];
        if(raop.isFunction(p) && pointcut.test(val)) {
          obj[val] = function() {
            var args = Array.prototype.slice.call(arguments);
            action(
              function(c, a) {
                p.apply(c || obj, a || args);
              }, obj, args
            );
          }
        }
      });
    }
  };
  // AOP end =========================================================

})(this);