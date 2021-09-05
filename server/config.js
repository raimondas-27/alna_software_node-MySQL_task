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
           route_id          INT AUTO_INCREMENT,
           vehicle_id        INT,
           departure_station INT,
           arrival_station   INT,
           departure_time    DATETIME,
           arrival_time      DATETIME,
           PRIMARY KEY (route_id),

           FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id),
           FOREIGN KEY (arrival_station) REFERENCES stations (station_id),
           FOREIGN KEY (departure_station) REFERENCES stations (station_id)
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

// inserting value into vehicles table

app.get('/createVehiclesTable', (req, res) => {
   const sql = 'INSERT INTO vehicles (vehicle_id,vehicle_type,vehicle_number ) VALUES ?'
   const values = [
      [1, "Train", "ES523"],
      [2, "Bus", "75"],
      [3, "Train", "EK888"],
      [4, "Train", "879"],
      [5, "Bus", "SHUT154"],
      [6, "Train", "ES899"],
      [7, "Bus", "17568"],
      [8, "Train", "ES523"],
   ]
   database.query(sql, [values], (err, result) => {
      if (err) {
         res.send(err.stack);
         throw err;
      }
      console.log(result);
      res.json({msg: 'vahicle table data has been created', result});
   })
});

app.get('/createStationsTable', (req, res) => {
   const sql = 'INSERT INTO stations (station_id,station_name,station_address) VALUES ?'
   const values = [
      [1, "Vilnius train station", "Geležinkelio g. 16, Vilnius"],
      [2, "Kaunas bus station", "Vytauto pr. 24, Kaunas"],
      [3, "Šiauliai train station", "Dubijos g. 42A, Šiauliai"],
      [4, "Klaipėda train station", "Priestočio g. 1, Klaipėda"],
      [5, "Vilnius bus station", "Sodų g. 22, LT-03211 Vilnius"],
      [6, "Kaunas train station", "M. K. Čiurlionio g. 16, Kaunas"],
   ]
   database.query(sql, [values], (err, result) => {
      if (err) {
         res.send(err.stack);
         throw err;
      }
      console.log(result);
      res.json({msg: 'stations table data has been created', result});
   })
});

app.get('/createRoutesTable', (req, res) => {
   const sql = 'INSERT INTO routes (route_id, vehicle_id, departure_station, arrival_station, departure_time, arrival_time) VALUES ?'
   const values = [
      [1, 1, 1, 3, "2018-05-02 12:40", "2018-05-02 15:08"],
      [2, 2, 2, 5, "2018-05-04 23:52", "2018-05-05 01:04"],
      [3, 3, 3, 1, "2018-05-08 06:34", "2018-05-08 09:36"],
      [4, 4, 4, 1, "2018-05-10 14:14", "2018-05-10 18:23"],
      [5, 5, 5, 2, "2018-05-09 12:36", "2018-05-09 13:28"],
      [6, 6, 6, 1, "2018-05-29 17:01", "2018-05-29 18:50"],
      [7, 7, 5, 2, "2018-05-28 19:45", "2018-05-28 20:58"],
      [8, 8, 1, 4, "2018-05-25 10:03", "2018-05-25 15:22"],
   ]
   database.query(sql, [values], (err, result) => {
      if (err) {
         res.send(err.stack);
         throw err;
      }
      console.log(result);
      res.json({msg: 'routes table data has been created', result});
   })
});


// get all sorted data
app.get('/getAllData', (req, res) => {
   const sql = `SELECT *
                FROM routes
                         JOIN vehicles
                              ON vehicles.vehicle_id = routes.vehicle_id
                         JOIN stations
                    AS departure
                              ON departure.station_id = routes.departure_station
                         JOIN stations
                    AS arrival
                              ON arrival.station_id = routes.arrival_station
   `;
   database.query(sql, (err, result) => {
      if (err) throw err.stack;
      res.json(result);
   });
})

//vehicle number, departure/arrival station and travel duration

app.get('/duration', (req, res) => {
   const sql = `SELECT vehicle_number,
                       departure.station_name,
                       arrival.station_name,
                       TIMEDIFF(departure_time, arrival_time) as TRUKME
                FROM routes
                         JOIN vehicles ON vehicles.vehicle_id = routes.vehicle_id
                         JOIN stations AS departure ON departure.station_id = routes.departure_station
                         JOIN stations AS arrival ON arrival.station_id = routes.arrival_station
   `;
   database.query(sql, (err, result) => {
      if (err) throw err.stack;
      res.json(result);
   });
})


app.listen(3000, () => {
   console.log("server started po port 3000")
})