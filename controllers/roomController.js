const express = require("express");
const mssql = require("mssql");
const config = require("../config/dbConn");

const router = express.Router();
const pool = new mssql.ConnectionPool(config);

//occupancy types
router.get("/room_facilities", async (req, res) => {
  try {
    await pool.connect();
    const request =  pool.request()
    const result  = await request.execute('Get_Room_Facilities');
    const response = {
      data: result.recordsets[0],
    };
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;