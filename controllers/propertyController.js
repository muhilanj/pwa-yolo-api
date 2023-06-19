const express = require("express");
const mssql = require("mssql");
const config = require("../config/dbConn");

const router = express.Router();
const pool = new mssql.ConnectionPool(config);

router.get("/property_facilities", async (req, res) => {
  try {
    await pool.connect();
    const request =  pool.request()
    const result  = await request.execute('Get_Property_Facilities');
    const response = {
      data: result.recordsets[0],
    };
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;