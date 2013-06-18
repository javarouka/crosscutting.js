/**
 */
(function(context) {

  "use strict";

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

  var types = [ 'Number', 'String', 'Boolean', 'Array', 'Date', 'RegExp' ],
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
    else if(raop.isArray(obj)) {
      for(var i = 0, len = obj.length; i < len; i = i + 1) {
        iter.call(obj, obj[i], i);
      }
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

  var Pointcut = function(exprssion) {
  };

  var Advise = function(action) {
  };

  var Aspect = function(pointcut, action) {
    this.pointcut = pointcut;
    this.action = action;
  };

  Aspect.prototype = {
    after: function() {},
    before: function() {},
    around: function() {},
    error: function() {}
  };
  Aspect.prototype.constructor = Aspect;

  // AOP end =========================================================

})(this);