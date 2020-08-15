const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyparser = require("body-parser");
const { check, validationResult } = require("express-validator");
const { Router } = require("express");
// bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//DB CONNECTION
var con = mysql.createConnection({
  host: "add your prefered host name",
  user: "add your prefered user name",
  password: "add your prefered password",
  database: "add your prefered database name",
});

con.connect((err) => {
  if (err) {
    return console.log("ERROR");
  }
  console.log("DB CONNCETED");
});

//INSERT
app.post(
  "/insert",
  [
    check("name", "name is requierd").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password", "password must be  characters long").isLength({ min: 3 }),
  ],
  (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.array()[0].msg,
      });
    }
    con.query(
      `insert into tbl_user (name,email,password) values ("${name}" , "${email}" , "${password}")`,
      (error, result) => {
        if (error) {
          return res.json(error);
        }
        return res.json({
          message: "Inserted Successfully",
        });
      }
    );
  }
);

//DELETE
app.delete("/delete/:userId", (req, res) => {
  const userId = req.params.userId;
  con.query(`delete from tbl_user where id=${userId}`, (error, result) => {
    if (error) {
      return res.json({
        message: "Unable to delete user",
        error: error,
      });
    }
    if (result.affectedRows === 0) {
      return res.json({
        error: "No user Found",
      });
    }
    return res.json({
      message: "User deleted Successfully",
    });
  });
});

//GET ALL USERS
app.get("/users", (req, res) => {
  con.query("select * from tbl_user", (error, users) => {
    if (error) {
      return res.json(error);
    }
    return res.json(users);
  });
});

//GET ONE USER
const getUserById = (req, res, next) => {
  const userId = req.params.userId;
  con.query(`select * from tbl_user where id=${userId}`, (error, user) => {
    if (error || user.length === 0) {
      return res.json({
        error: "No User Found",
      });
    }
    next();
  });
};

//UPDATE USER
app.put(
  "/update/:userId",
  getUserById,
  [
    check("name", "name is requierd").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password", "password must be  characters long").isLength({ min: 3 }),
  ],
  (req, res) => {
    const userId = req.params.userId;
    const { name, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.array()[0].msg,
      });
    }
    con.query(
      `update tbl_user SET name="${name}" , email ="${email}" , password="${password}" where id=${userId}`,
      (error, result) => {
        if (error) {
          return res.json({
            message: "Unable to update User",
            error: error,
          });
        }
        return res.json({
          message: "user updated successfully",
        });
      }
    );
  }
);
//RUNNING ON PORT
app.listen(8000, () => console.log("RUNNING @ 8000"));
