/**
 * User: javarouka
 * Date: 13. 8. 6
 * Time: 오후 10:15
 */
test('exists test', function() {
  QUnit.notEqual(raop, null);
  QUnit.equal(typeof raop.Aspect, 'object');
  QUnit.equal(typeof raop.Aspect.weave, 'function');
  QUnit.notEqual(typeof raop.Aspect.weave, 'object');
  ok(true, 'this had better work.');
});

test("functional test", function(test) {

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

  raop.Aspect.weave(
    obj,
    /^(a+|c+)/,
    raop.Aspect.AdviceType.BEFORE,
    function(options) {
      options.args[0] = 1000;
    }
  );

  ok(obj.a(1) === 1000, "method a aop apply");
  ok(obj.b(2) === 2, "method b aop no-apply");
  ok(obj.c(3) === 1000, "method a aop apply");

});