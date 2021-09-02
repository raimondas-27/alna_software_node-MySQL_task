const express = require("express");
const morgan = require("morgan");
const mysql = require("mysql");
const path = require("path");
const {connString} = require("../connString");


const database = mysql.createConnection(connString);

// connect
database.connect((error) => {
   if (error) {
      throw error;
   }
   console.log("connected to database")
})

const app = express();


// app.use(morgan("dev"))
// app.use(express.json())
// app.use(express.urlencoded({extended: false}))
// app.use(express.static(path.join(__dirname, "static")))

// create database
app.get('/createdb', (req, res) => {
   const sql = 'CREATE DATABASE gelezinkeliai';
   database.query(sql, (err, result) => {
      if (err) throw err;
      // no errors
      res.send('gelezinkeliai database has been created');
      console.log(result)
   });
});

// create table vehicles
app.get('/table/vehicles/create', (req, res) => {
   const sql = `
       CREATE TABLE vehicles
       (
           vehicle_id     INT PRIMARY KEY,
           vehicle_type   VARCHAR(15) NOT NULL,
           vehicle_number VARCHAR(15) NOT NULL
       );

   `;
   database.query(sql, (err, result) => {
      if (err) {
         res.send(err.stack);
         throw err;
      }
      console.log(result);
      res.json({msg: 'table vehicles has been created', result});
   });
});

//create table stations

app.get('/table/stations/create', (req, res) => {
   const sql = `
       CREATE TABLE stations
       (
           station_id      INT PRIMARY KEY,
           station_name    VARCHAR(100) NOT NULL,
           station_address VARCHAR(100) NOT NULL
       );


   `;
   database.query(sql, (err, result) => {
      if (err) {
         res.send(err.stack);
         throw err;
      }
      console.log(result);
      res.json({msg: 'table stations has been created', result});
   });
});

//create table stations

app.get('/table/routes/create', (req, res) => {
   const sql = `
       CREATE TABLE routes
       (
           route_id         INT AUTO_INCREMENT,
           vehicle_id       INT,
           depature_station INT,
           arrival_station  INT,
           depature_time    DATETIME,
           arrival_time     DATETIME,
           PRIMARY KEY (route_id),

           FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id),
           FOREIGN KEY (arrival_station) REFERENCES stations (station_id),
           FOREIGN KEY (depature_station) REFERENCES stations (station_id)
       );
   `;
   database.query(sql, (err, result) => {
      if (err) {
         res.send(err.stack);
         throw err;
      }
      console.log(result);
      res.json({msg: 'table routes has been created', result});
   });
});


app.listen(3000, () => {
   console.log("server started po port 3000")
})