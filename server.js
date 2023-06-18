var express = require('express');
var app = express();
var fs = require("fs");
const cors = require('cors');
const mysql = require('mysql')
const multer = require('multer')
const path = require('path')
const bodyParser = require('body-parser');
const axios = require("axios").default;
const { verifyUPI } = require("bhimupijs")

app.use(cors());
app.use(
    express.urlencoded({
      extended: true,
    })
  );

app.use(express.json());
app.use(express.static("./public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/admin', require('./controllers/propertyController'));
app.use('/admin', require('./controllers/occupancyController'));
app.use('/admin', require('./controllers/roomController'));
app.use('/admin', require('./controllers/contactUsController'));
app.use('/admin', require('./controllers/partnerController'));
app.use('/admin', require('./controllers/skuController'));

app.get('/listUsers', function (req, res) {
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
      console.log( data );
      res.end( data );
   });
})

app.post('/addUser', function (req, res) {
    fs.writeFile( __dirname + "/" + "users.json", req.body, function (err, body) {
       console.log( req.body );
       res.end( req.body );
    });
 })

 // config for your database
var config = {
   user: 'sa',
   password: 'P!@88sRvS',
   server: '103.255.191.236', 
   database: 'yolo' ,
   encrypt: false
};

const vpa = "6385552186@upi";

async function verify(vpa){
   var upiData = await verifyUPI(vpa)  
   console.log(upiData)
}


async function sendRequest(qp, userId, handleName, vpa) {
   const headers = {
     "sec-ch-ua": 'Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101.0.1210.47',
     Accept: "application/json, text/plain, */*",
     "sec-ch-ua-mobile": "?0",
     "channel-id": "WEB_UNAUTH",
     "sec-ch-ua-platform": "Windows",
     Origin: "https://www.airtel.in",
     "Sec-Fetch-Site": "same-site",
     "Sec-Fetch-Mode": "cors",
     "Sec-Fetch-Dest": "empty",
     Referer: "https://www.airtel.in/",
     "Accept-Encoding": "gzip, deflate, br",
     "Accept-Language": "en-US,en;q=0.9",
   };
   return await axios
     .get(`https://paydigi.airtel.in/web/pg-service/v1/validate/vpa/${vpa}`, {
       headers: headers,
     })
     .then((response) => {
       var data = response.data;
       // console.log(data)
       if (data.result && data.data.vpaValid) {
         var vpaData1 = {
           result: data.result,
           query: vpa,
           isQueryPatternValid: qp.isQueryPatternValid,
           isVpaVerified: data.data.vpaValid,
           vpa: data.data.vpa,
           payeeAccountName: data.data.payeeAccountName,
           tpap: qp.tpap,
           pspBank: qp.pspBank,
           link: qp.link,
           userId,
           handleName,
           message: "Valid UPI ID",
         };
         return vpaData1;
       } else if (data.result && !data.data.vpaValid) {
         var vpaData2 = {
           result: data.result,
           query: vpa,
           isQueryPatternValid: qp.isQueryPatternValid,
           isVpaVerified: data.data.vpaValid,
           tpap: qp.tpap,
           pspBank: qp.pspBank,
           link: qp.link,
           userId,
           handleName,
           message: "Invalid UPI ID!",
         };
         return vpaData2;
       } else {
         var vpaData3 = {
           result: data.result,
           query: vpa,
           isQueryPatternValid: qp.isQueryPatternValid,
           message: "Something went wrong!",
         };
         return vpaData3;
       }
     })
     .catch((err) => {
       if (err.code == "ENOTFOUND") {
         console.log("Check your internet connection!");
       } else {
         console.log(err.message);
       }
       process.exit(1);
     });
 }

 app.get('/upiverify', function (req, res) {
 
   output = verify(vpa);
   console.log(output);
 });

 app.get('/upi', function (req, res) {

 var vpaArr = vpa.split("@");
 var qp = validatePattern(vpa);
 if (
   vpaArr.length != 2 ||
   !qp.isQueryPatternValid ||
   vpaArr[0].length <= 1 ||
   vpaArr[1].length <= 2
 ) {
   var vpaData = {
     result: true,
     query: vpa,
     isQueryPatternValid: qp.isQueryPatternValid,
     message: "Invalid UPI ID!",
   };
   return vpaData;
 } else {
   return sendRequest(qp, vpaArr[0], vpaArr[1], vpa).then((x) => {
     return x;
   });
 }

});




app.get('/country', function (req, res) {

   app.use(cors());

   var sql = require("mssql");
   console.log("getCountry")

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
          
       // query to the database and get the records
       request.query('Exec Get_Country', function (err, recordset) {
           
           if (err) console.log(err)
           console.log(recordset);    
           // send records as a response
           res.status(200);
           res.json(recordset);
           
       });
   });
});

app.get('/country/:id', function (req, res) {
  
   console.log("------------------------------------------------------------------");    
   console.log("get_country_by_id");

   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       var id = req.params['id']
          
       // query to the database and get the records
       request.query('Exec Get_Country_By_Id ' + id, function (err, recordset) {
           
           if (err) console.log(err)

           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           
       });
   });
});

app.post('/login', function (req, res) {
  
   console.log("------------------------------------------------------------------");
   console.log("login_by_id");
   console.log("------------------------------------------------------------------");
  
   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
       var id = req.body.username;
       console.log(id);
       var pw = req.body.password;
       console.log(pw);
       console.log(req.body)

       // query to the database and get the records
       request
       .input('Loginid', id)
       .input('password', pw)
       .input('Guest_type', Guest_type)
       .execute(`Proc_Guest_Authentication`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }

           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           
       });
   });
});


app.get('/guest_personal_details/:id', function (req, res) {
  
   console.log("get_guest_personal_details");
   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
          
       // query to the database and get the records
       request
       .input('guestid', req.params.id)
       .execute(`Get_Guest_Personal_details`, function (err, recordset) {
           if(err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "auth required"});
            };    
           res.status(200);
           console.log(recordset);
           if (recordset)
               res.json(recordset);

       });     
       
   });
});

app.get('/guest_dashboard/:id', function (req, res) {
   console.log("get_guest_dashboard");
   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
          
       // query to the database and get the records
       request
       .input('guest_id', req.params.id)
       .input('start_date', '2022-07-01')
       .input('end_date', '2022-07-25')
       .execute(`Get_Guest_Dashboard`, function (err, recordset) {
           if(err) console.log(err);    
           res.status(200);
           console.log(recordset);
           res.json(recordset);
       });     
       
   });
});

app.get('/guest_get_invoice_details/:id', function (req, res) {
   console.log("guest_get_invoice_details");
   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
          
       // query to the database and get the records
       request
       .input('guest_id', req.params.id)
       .execute(`Get_Invoice_List`, function (err, recordset) {
           if(err) console.log(err);    
           res.status(200);
           console.log(recordset);
           res.json(recordset);
       });     
       
   });
});

app.post('/guest_parent_details/:id', function (req, res) {
  
   console.log("------------------------------------------------------------------");
   console.log("guest_parent_details");

   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
       var id = req.body.user_id;
       console.log(id);
       var pw = req.body.pass_id;
       console.log(pw);

       var guest_id = req.body.guest_id ;                                    
       var guest_father_name = req.body.guest_father_name;              
     var guest_father_phone = req.body.guest_father_phone;          
     var guest_father_occupation = req.body.guest_father_occupation;          
       var guest_mother_name = req.body.guest_mother_name ; 
       var guest_mother_phone = req.body.guest_mother_phone ; 
     var guest_mother_occupation = req.body.guest_mother_occupation ; 
 
       var guest_guardian_name = req.body.guest_guardian_name;
       var guest_guardian_phone = req.body.guest_guardian_phone;
       var guest_guardian_occupation = req.body.guest_guardian_occupation;
       var guest_parent_address = req.body.guest_parent_address;
       var guest_guardian_relationship = guest_guardian_relationship;
       var guest_login_required = req.body.guest_login_required;
       var guest_parent_login_id = req.body.guest_parent_login_username;
       var guest_parent_login_password = req.body.guest_parent_login_password;

       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_father_name', guest_father_name)
     .input('guest_father_mobile', guest_father_phone)
     .input('guest_father_occupation', guest_father_occupation)
     
       .input('guest_mother_name', guest_mother_name)
       .input('guest_mother_occupation', guest_mother_occupation)
       .input('guest_mother_mobile', guest_mother_phone)
     
       .input('guest_guardian_name', guest_guardian_name)
       .input('guest_guardian_mobile', guest_guardian_phone)
       .input('guest_guardian_occupation', guest_guardian_occupation)
     
       .input('guest_parent_address', guest_parent_address)
       .input('guest_guardian_relationship', guest_guardian_relationship)
       .input('guest_parent_login_required_for', guest_login_required)
       .input('guest_parent_login_username', guest_parent_login_id)
       .input('guest_parent_login_password', guest_parent_login_password)

       .execute(`Set_Guest_Parent_Details`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }

           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           
       });
   });
});


app.post('/guest_image/:id', function (req, res) {
  
   console.log("------------------------------------------------------------------");
   console.log("guest_image/id");
   console.log(req.body);
   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
  
       var guest_id = req.body.guest_id ;                                    
       var guest_profile_image = req.body.profile_image;          
  
       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_profile_image', guest_profile_image)
  
       .execute(`Set_Guest_Profile_Image`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }

           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           
       });
   });
});

app.post('/guest_add_payment/:id', function (req, res) {
  
   console.log("------------------------------------------------------------------");
   console.log("guest_add_payment/id");

   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
  
       var guest_id = req.body.guest_id ;
       console.log(guest_id);
                                   
       var guest_pay_type = req.body.pay_type;          
       console.log(guest_pay_type);

       var guest_paymemt_type = req.body.payment_type;          
       console.log(guest_paymemt_type);

       var guest_amount = req.body.amount;          
       console.log(guest_amount);

       var guest_account_number = req.body.account_number;          
       console.log(guest_account_number);

       var guest_bank_name = req.body.bank_name;          
       console.log(guest_bank_name);

       var guest_userid = req.body.userid;
       console.log(guest_userid);

       var rent_month = req.body.rent_month;          
       console.log(rent_month);

       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_pay_type', guest_pay_type)
       .input('guest_paymemt_type', guest_paymemt_type)
       .input('guest_amount', guest_amount)
       .input('guest_account_number', guest_account_number)
       .input('guest_bank_name', guest_bank_name)
       .input('rent_month', rent_month)
       .input('userid', guest_userid)
       .execute(`Add_Guest_Payment`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}); 
           }

           // send records as a response
           res.status(201);
           console.log(recordset);
           res.json(recordset);
       });
    });
});

app.post('/guest_about_me/:id', function (req, res) {
  
   console.log("------------------------------------------------------------------");
   console.log("guest_about_me/id");

   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
  
       var guest_id = req.body.guest_id ;
       console.log(req.body.guest_id);
                                   
       var guest_details = req.body.about_me;          
       console.log(req.body.about_me);

       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_about_me', guest_details)
       .execute(`Set_Guest_About_Me`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }

           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           
       });
   });
});


app.post('/guest_mobile_number/:id', function (req, res) {
   console.log("--Hansika----------------------------------------------------------------");
   console.log("------------------------------------------------------------------");
   console.log("guest_mobile_number/id");

   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
  
       var guest_id = req.body.guest_id ;                                    
       var guest_mobile_number = req.body.guest_mobile_number;          
  
       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_mobile_no', guest_mobile_number)
       .execute(`Set_Guest_Mobile_No`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }

           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           
       });
   });
});



app.post('/guest_email/:id', function (req, res) {
  
   console.log("------------------------------------------------------------------");
   console.log("guest_email/id");

   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
  
       var guest_id = req.body.guest_id ;                                    
       var guest_email = req.body.guest_email;          
  
       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_email', guest_email)
       .execute(`Set_Guest_Email`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }

           else {

               // send records as a response
               res.status(200);
               console.log(recordset);
               res.json(recordset);
           }
       });
   });
});

app.post('/guest_occupation/:id', function (req, res) {
  
   console.log("------------------------------------------------------------------");
   console.log("guest_occupation/id");

   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
  
       var guest_id = req.body.guest_id ;                                    
       var guest_occupation = req.body.guest_occupation;          
  
       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_occupation', guest_occupation)
       .execute(`Set_Guest_Occupation`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }
           else {    
           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           }
       });
   });
});


app.post('/guest_personal_details/permanent_address/:id', function (req, res) {
  
   console.log("------------------------------------------------------------------");
   console.log("guest_personal_details/permanent_address/id");

   var sql = require("mssql");

   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
  
       var guest_id = req.body.guest_id ;                                    
       var guest_permenent_address = req.body.guest_permenent_address;          
  
       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_permenant_address', guest_permenent_address)
       .execute(`Set_Guest_Permenant_Address`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }

           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           
       });
   });
});

//! Use of Multer
var storage = multer.diskStorage({
   destination: (req, file, callBack) => {
       callBack(null, './public/images/')     // './public/images/' directory name where save the file
   },
   filename: (req, file, callBack) => {
       console.log(file);
       console.log(req);
       callBack(null, file.originalname + path.extname(file.originalname).toLowerCase())
   }
})

var upload = multer({
   storage: storage
});

//@type   POST
//route for post data
app.post("/image_upload", upload.single('file'), (req, res) => {

   console.log("-----------------------------------------------------------------------");
   console.log("image_upload");
   console.log( req.body);
   console.log( req.body.file_name);
   console.log( req.body.guest_id);
   console.log("-----------------------------------------------------------------------");
   var sql = require("mssql");

   if (!req.file) {
       console.log("No file upload");
   } else {
       console.log(req.body.file_name)
   
   // connect to your database
   sql.connect(config, function (err) {
   
       if (err) console.log(err);

       // create Request object
       var request = new sql.Request();
       console.log(req.body)
  
       var guest_id = req.body.guest_id ;                                    
       var guest_profile_image = req.body.file_name;          
  
       // query to the database and get the records
       request
       .input('guest_id', guest_id)
       .input('guest_profile_image', guest_profile_image)
  
       .execute(`Set_Guest_Profile_Image`, function (err, recordset) {
           
           if (err) { 
               console.log(err);
               res.status(401);
               res.json({"message" : "invalid"}) 
           }

           // send records as a response
           res.status(200);
           console.log(recordset);
           res.json(recordset);
           
       });
   });   
   }
});


// image uploade
// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./public/images/");
//   },
//   filename: (req, file, cb) => {
//     console.log(file);
//     var filetype = "";
//     if (file.mimetype === "image/gif") {
//       filetype = "gif";
//     }
//     if (file.mimetype === "image/png") {
//       filetype = "png";
//     }
//     if (file.mimetype === "image/jpeg") {
//       filetype = "jpg";
//     }
//     cb(null, "image-" + Date.now() + "." + filetype);
//   },
// });
// var upload = multer({ storage: storage });
// var type = upload.single("fileUpload");

// app.post("/image_upload", type, function (req, res, next) {
//   console.log(req);
//   if (!req.file) {
//     res.status(500);
//     // return next(error);
//   }

//   res.json({
//     fileUrl: req.file.originalname,
//     filePath: req.file.path,
//   });
// });
 
 

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})