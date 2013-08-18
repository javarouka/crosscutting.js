/**
 * User: javarouka
 * Date: 13. 6. 28
 * Time: 오후 4:13
 */
var raop = require("./../raop.js");

exports.testCheckExistProperties = function(test) {
  test.ok(typeof raop.Aspect === 'object', "Aspect object exists");
  test.ok(
    typeof raop.before === 'function' &&
      typeof raop.after === 'function' &&
      typeof raop.around === 'function' &&
      typeof raop.exception === 'function',
    "Aspect weave method exists");
  test.ok(typeof raop.Aspect.AdviceType === 'object', "Aspect AdviceType object exists");
  test.done();
};

exports.addValidator = function(test) {

  var Target = function(name) {
    this.name = name;
  };

  Target.prototype.getName = function() {
    return this.name;
  };

  var target = new Target("이항희");

  raop.before(
    target,
    true,
    function(options) {
      options.args[0] = "이항희 화이팅!";
    }
  );

  test.ok(target.getName() === "이항희 화이팅!", "prototype method aop apply");
  test.done();
};

exports.addValidator = function(test) {

  var calculator = {
    plus: function(a, b) {
      return a + b;
    },
    minus: function(a, b) {
      return a - b;
    }
  };

  var argumentCheck = function(options) {
    var args = options.args;
    for(var i = 0, len = args.length; i < len; i++) {
      if(typeof args[i] !== 'number') {
        throw new TypeError("all arguments must be number type");
      }
    }
  };

  raop.before(
    calculator,
    function() {
      return true;
    },
    argumentCheck
  );

  try {
    calculator.plus("one", "two");
    test.ok(false, "validator test failed...method success...");
  }
  catch(ok) {
    test.ok(ok instanceof TypeError, "validator test success!!!!");
  }

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

  raop.around(
    obj,
    new raop.Aspect.Pointcut(/a/),
    function(todo/*, options*/) {
      return todo();
    }
  );

  raop.around(
    obj,
    new raop.Aspect.Pointcut(/b/),
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

  raop.before(
    obj,
    /^(a+|c+)/,
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
  calculator = raop.before(
    calculator,
    function() {
      return true;
    },
    logAdvice
  );
  var result = calculator.plus(1, 1);

  test.done();
};

exports.testException = function(test) {
  var calculator = {
    plus: function(a, b) {
      if(typeof a !== 'number' || typeof b !== 'number') {
        throw new Error("arguments must be number type");
      }
      return a + b;
    },
    minus: function(a, b) {
      if(typeof a !== 'number' || typeof b !== 'number') {
        throw new Error("arguments must be number type");
      }
      return a - b;
    }
  };

  var exception = null;
  var throwHandler = function(options) {
    exception = options.exception;
    console.log("Error! " + exception.name + ". cause : " + exception.message);
    if(exception.stack) console.log(exception.stack);
  };
  // all method aop apply, type BEFORE
  calculator = raop.exception(
    calculator,
    /^plus/,
    throwHandler
  );
  var result = calculator.plus("one", "two");

  test.ok(exception, "error was thrown by method");

  test.done();
};

exports.testNewState = function(test) {

  var obj = {
    a: function(one) {
      return one;
    }
  };

  var aopObject = raop.before(
    obj,
    function(value/*, target*/) {
      return !!value;
    },
    function(options) {
      options.args[0] = 1000;
    }
  );

  test.ok(aopObject.a(1) === 1000, "method a aop apply");

  test.done();

};

