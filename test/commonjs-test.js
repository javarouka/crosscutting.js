/**
 * User: javarouka
 * Date: 13. 6. 28
 * Time: 오후 4:13
 */
var raop = require("./../raop.js");

exports.testSomething = function(test){

  var obj = {
    a: function(v1, v2){ console.log("execute a " + v1 + "/"+ v2); },
    b: function(v1, v2){ console.log("execute b " + v1 + "/"+ v2); },
    c: function(v1, v2){ console.log("execute c " + v1 + "/"+ v2); }
  };

  raop.Aspect.weave(
    obj,
    /^(a+|c+)/,
    raop.Aspect.AdviceType.AFTER,
    function(args) {
      console.log("Advice execute!", args);
    }
  );

  obj.a("첫번째 인자입니다" ,"두번째 인자입니다");
  obj.b("첫번째 인자입니다" ,"두번째 인자입니다");
  obj.c("첫번째 인자입니다" ,"두번째 인자입니다");


  test.ok(true, "this assertion should pass");
  test.done();
};

