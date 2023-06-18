const express = require("express");
const mssql = require("mssql");
const config = require("../config/dbConn");

const router = express.Router();
const pool = new mssql.ConnectionPool(config);

//occupancy types
router.get("/partner_list", async (req, res) => {
  try {
    await pool.connect();
    const request =  pool.request()
    const result  = await request.query('select * from partner_master');
    const response = {
      data: result.recordsets[0],
    };
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;