/**
 * User: javarouka
 * Date: 13. 6. 28
 * Time: 오후 4:13
 */
var crosscutting = require("./../crosscutting.js");

exports.testCheckExistProperties = function(test) {
  test.ok(typeof crosscutting.Aspect === 'object', "Aspect object exists");
  test.ok(
    typeof crosscutting.before === 'function' &&
      typeof crosscutting.after === 'function' &&
      typeof crosscutting.around === 'function' &&
      typeof crosscutting.exception === 'function',
    "Aspect weave method exists");
  test.ok(typeof crosscutting.Aspect.AdviceType === 'object', "Aspect AdviceType object exists");
  test.done();
};

exports.addTargetTest = function(test) {

  var Target = function(name) {
    this.name = name;
  };

  Target.prototype.getName = function(prefix) {
    return prefix + this.name;
  };

  var target = new Target("이항희");

  crosscutting.before(
    target,
    true,
    function(options) {
      options.args[0] = "이름: ";
    }
  );

  test.ok(target.getName("Name: ") === "이름: 이항희", "new object apply test");
  test.done();

};