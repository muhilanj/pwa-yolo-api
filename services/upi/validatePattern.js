
var handles = require("./handles.json");
var jsonData = JSON.parse(JSON.stringify(handles));

exports.validatePattern = function validatePattern(vpa) {
  var result = /^[a-z0-9_.-]{3,}@[a-z]{3,}$/i.test(vpa);
  var vpaArr = vpa.split("@");
  var handleName = vpaArr[1];
  var flag = !!jsonData._.includes(handleName);
  var tpap = flag ? jsonData.handle[handleName].TPAP : "unknown";
  var pspBank = flag ? jsonData.handle[handleName].PSPbank : "unknown";
  var helpLink = flag ? jsonData.handle[handleName].link : "unknown";

  if (result) {
    var vpaData1 = {
      query: vpa,
      isQueryPatternValid: true,
      message: "Valid VPA Pattern!",
      tpap,
      pspBank,
      link: helpLink,
      userId: vpaArr[0],
      handleName: vpaArr[1],
    };
    return vpaData1;
  } else {
    var vpaData2 = {
      query: vpa,
      isQueryPatternValid: false,
      message: "Invalid VPA Pattern!",
    };
    return vpaData2;
  }
};