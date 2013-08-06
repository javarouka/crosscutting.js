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