const express = require("express");
const mssql = require("mssql");
const config = require("../config/dbConn");

const router = express.Router();
const pool = new mssql.ConnectionPool(config);

router.post("/sku", async (req, res) => {
  try {
    await pool.connect();
    const request =  pool.request()
    .input('SKU_name', req.body.SKU_name)
    .input('package_of_unit', req.body.package_of_unit)
    .input('UOM', req.body.UOM)
    const dbRes = await request.query(`INSERT INTO SKU_Master
    (SKU_name, package_of_unit, UOM) 
    OUTPUT INSERTED.SKU_id values 
    (@SKU_name, @package_of_unit, @UOM)`);
    const response = {
      SKU_id: dbRes.recordsets[0][0].SKU_id
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
    const result  = await request.query('select * from SKU_Master');
    const response = {
      data: result.recordsets[0],
    };
    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});


module.exports = router;