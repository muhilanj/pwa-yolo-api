const express = require("express");
const mssql = require("mssql");
const config = require("../config/dbConn");

const router = express.Router();
const pool = new mssql.ConnectionPool(config);

router.post("/sku", async (req, res) => {
  try {
    await pool.connect();
   await pool
      .request()
      .input('SKU_name', req.body.SKU_name)
      .input('package_of_unit', req.body.package_of_unit)
      .input('UOM', req.body.UOM).execute(`Add_SKU`);
    const response = {
      message: `SKU added successfully`
    }
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/sku", async (req, res) => {
  try {
    await pool.connect();
    const request =  pool.request()
    const result  = await request.execute('Get_SKU_List');
    const response = {
      data: result.recordsets[0],
    };
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;