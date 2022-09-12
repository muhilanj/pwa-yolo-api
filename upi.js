const http = require("https");

const options = {
  "method": "POST",
  "hostname": "uat.setu.co",
  "port": null,
  "path": "/api/v2/payment-links",
  "headers": {
    "X-Setu-Product-Instance-ID": "SOME_STRING_VALUE",
    "Authorization": "SOME_STRING_VALUE",
    "content-type": "application/json"
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write(JSON.stringify({
  amount: {currencyCode: 'INR', value: 20000},
  amountExactness: 'EXACT',
  billerBillID: '918147077472',
  expiryDate: '2022-05-15T12:23:50Z',
  name: 'Setu Payment Links Test',
  settlement: {
    parts: [
      {
        account: {id: 'Biller-External-002', ifsc: 'KKBK0000001'},
        remarks: 'EXACT sample split',
        split: {unit: 'INR', value: 100}
      }
    ],
    primaryAccount: {id: 'Biller-External-001', ifsc: 'KKBK0000001'}
  }
}));
req.end();