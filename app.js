const express = require("express");
const session = require("express-session");
const Mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();
const port = process.env.port || 3000;
app.set("view engine", "ejs");
const db = require("./config/key").MongoURI;

Mongoose.connect(db, { useNewUrlParser: true }, { useUnifiedTopology: true })
  .then(() => console.log("conected to database"))
  .catch((err) => console.log(err));
const User = require("./models/users");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "sess",
    saveUninitialized: false,
    //store:sessionStore,
    cookie: {
      key: "login",
      value: "thisismycookieyoufucker",
    },
  })
);
app.get("/", (req, res) => {
  res.render("main");
});

app.get("/register", (req, res) => {
  res.render("register", { msg: "" });
});
app.get("/login", (req, res) => {
  res.render("login", { msg: "" });
});

app.post("/register", (req, res) => {
  const { name, mail, pass, pass2 } = req.body;
  User.findOne({ email: mail }).then((user) => {
    if (user) {
      res.render("login", { msg: "user already registred" });
    } else {
      console.log("new user");
      if (pass == pass2) {
        newUser = new User({ name: name, email: mail, password: pass });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(
                res.render("login", { msg: "now your registred and can login" })
              )
              .catch((err) => {
                console.log(err);
              });
          });
        });

        console.log(`${newUser} registred`);
      } else {
        res.render("register", {
          name,
          mail,
          msg: "password must be atleast 6 characters and match",
        });
      }
    }
  });
});
app.post("/login", (req, res) => {
  const { mail, pass } = req.body;
  User.findOne({ email: mail }, (err, user) => {
    if (err) throw err;
    if (user) {
      bcrypt.compare(pass, user.password, (err, exist) => {
        if (err) throw err;
        if (exist) {
          //res.cookie("id", "thisyourcookieid");
          req.session.cookie.value = "thisisyourcookienow";
          console.log(req.session.cookie);
          res.redirect("./shelf");
        } else {
          res.render("login", { msg: "hey! incorect password" });
        }
      });
    } else {
      res.render("login", { msg: "user not found fucker " });
    }
  });
});

app.get("/shelf", (req, res) => {
  //var cookie = req.cookies;
  //if (cookie.id === "thisyourcookieid") {
  res.render("shelf");
  // } else {
  //   res.status(404).send("did you thought of signing in you idiot");
  // }
});

app.listen(port, () => console.log(` app listening on port ${port}`));
