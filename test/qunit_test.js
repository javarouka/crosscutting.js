/**
 * User: javarouka
 * Date: 13. 8. 6
 * Time: 오후 10:15
 */
test('exists test', function() {
  QUnit.notEqual(crosscutting, null);
  QUnit.equal(typeof crosscutting.Aspect, 'object');
  QUnit.equal(typeof crosscutting.Aspect.weave, 'function');
  QUnit.notEqual(typeof crosscutting.Aspect.weave, 'object');
  ok(true, 'this had better work.');
});

test('around test', function() {
  var obj = {
    a: function(one) {
      return one;
    },
    b: function(one) {
      return one;
    }
  };

  crosscutting.Aspect.weave(
    obj,
    new crosscutting.Aspect.Pointcut(/a/),
    crosscutting.Aspect.AdviceType.AROUND,
    function(todo, options) {
      return todo();
    }
  );

  crosscutting.Aspect.weave(
    obj,
    new crosscutting.Aspect.Pointcut(/b/),
    crosscutting.Aspect.AdviceType.AROUND,
    function(todo, options) {
      return todo(100) + 1;
    }
  );

  ok(obj.a(1) === 1, "method a aop apply");
  ok(obj.b(100) === 101, "method b aop apply");
});

test("functional test", function() {

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

  crosscutting.Aspect.weave(
    obj,
    /^(a+|c+)/,
    crosscutting.Aspect.AdviceType.BEFORE,
    function(options) {
      options.args[0] = 1000;
    }
  );

  ok(obj.a(1) === 1000, "method a aop apply");
  ok(obj.b(2) === 2, "method b aop no-apply");
  ok(obj.c(3) === 1000, "method a aop apply");

});