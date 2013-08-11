/**
 * User: javarouka
 * Date: 13. 6. 28
 * Time: 오후 4:13
 */
var raop = require("./../raop.js");

exports.testCheckExistProperties = function(test) {
  test.ok(typeof raop.Aspect === 'object', "Aspect object exists");
  test.ok(typeof raop.Aspect.weave === 'function', "Aspect weave method exists");
  test.ok(typeof raop.Aspect.AdviceType === 'object', "Aspect AdviceType object exists");
  test.done();
};

exports.testAroundType = function(test) {

  var obj = {
    a: function(one) {
      return one;
    },
    b: function(one) {
      return one;
    }
  };

  raop.weave(
    obj,
    new raop.Aspect.Pointcut(/a/),
    raop.Aspect.AdviceType.AROUND,
    function(todo/*, options*/) {
      return todo();
    }
  );

  raop.weave(
    obj,
    new raop.Aspect.Pointcut(/b/),
    raop.Aspect.AdviceType.AROUND,
    function(todo/*, options*/) {
      return todo(100) + 1;
    }
  );

  test.ok(obj.a(1) === 1, "method a aop apply");
  test.ok(obj.b(100) === 101, "method b aop apply");
  test.done();
};

exports.testApplyAOPBasic = function(test) {

  var obj = {
    a: function(one) {
      return one;
    },
    b: function(two) {
      return two;
    },
    c: function(three) {
      return three;
    }
  };

  raop.weave(
    obj,
    /^(a+|c+)/,
    raop.Aspect.AdviceType.BEFORE,
    function(options) {
      options.args[0] = 1000;
    }
  );

  test.ok(obj.a(1) === 1000, "method a aop apply");
  test.ok(obj.b(2) === 2, "method b aop no-apply");
  test.ok(obj.c(3) === 1000, "method a aop apply");

  test.done();
};

exports.t = function(test) {

  var calculator = {
    plus: function(a, b) {
      return a + b;
    },
    minus: function(a, b) {
      return a - b;
    }
  };
  var logAdvice = function(options) {
    console.log("calc " + options.method + " execute");
  };
  calculator = raop.weave(
    calculator,
    function() {
      return true;
    },
    raop.Aspect.AdviceType.BEFORE,
    logAdvice
  );
  var result = calculator.plus(1, 1);

  test.done();
};

exports.testNewState = function(test) {

  var obj = {
    a: function(one) {
      return one;
    }
  };

  var aopObject = raop.weave(
    obj,
    function(value/*, target*/) {
      return !!value;
    },
    raop.Aspect.AdviceType.BEFORE,
    function(options) {
      options.args[0] = 1000;
    }
  );

  test.ok(aopObject.a(1) === 1000, "method a aop apply");

  test.done();

};

