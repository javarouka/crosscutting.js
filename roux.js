/**
 * Created with JetBrains WebStorm.
 * User: javarouka
 * Date: 13. 6. 3
 * Time: 오전 2:28
 * To change this template use File | Settings | File Templates.
 */


(function(){

  "use strict";

  var roux = {};

  var types = [ 'Number', 'String', 'Boolean', 'Array', 'Date', 'RegExp' ],
      ownKey = Object.prototype.hasOwnProperty,
      toString = Object.prototype.toString;
  for(var t = 0,len = types.length; t < len; t++) {
    (function(type) {
      roux['is' + type] = function(obj) {
        return toString.call(obj) === '[object ' + type + ']';
      }
    })(types[t]);
  }
  roux.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]'
  };
  roux.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Object =========================================================

  roux.each = function(obj, iter) {
    if(obj.forEach) {
      obj.forEach(iter);
    }
    else if(roux.isArray(obj)) {
      for(var i = 0, len = obj.length; i < len; i = i + 1) {
        iter.call(obj, obj[i], i);
      }
    }
    else if(roux.isObject(obj)) {
      var k;
      for(k in obj) {
        if(!ownKey.call(obj, k)) continue;
        iter.call(obj, obk[k], k);
      }
    }
    else {
      iter(obj);
    }
  };

  Object.keys = Object.keys || function(obj) {
    var ret = [];
    for(var k in obj) {
      if(!ownKey.call(obj, k)) continue;
      ret.push(k);
    }
    return ret;
  };

  // Object end =========================================================

  // AOP =========================================================

  var Pointcut = function() {
  };

  var Advise = function() {
  };

  var Aspect = function() {
  };

  var aop = function(namespace) {

  };

  // AOP end =========================================================

})();