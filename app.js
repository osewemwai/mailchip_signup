const express = require("express");
const md5 = require("md5");
require("dotenv").config();
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const listId = process.env.LIST_ID;

mailchimp.setConfig({
  apiKey: process.env.API_KEY,
  server: process.env.MAILCHIMP_SERVER,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
  const subscribeUser = {
    firstName: req.body.fName,
    lastName: req.body.lName,
    email: req.body.email,
  };

  async function run() {
    try {
      const response = mailchimp.lists.addListMember(listId, {
        email_address: subscribeUser.email,
        status: "subscribed",
        merge_fields: {
          LNAME: subscribeUser.firstName,
          FNAME: subscribeUser.lastName,
        },
      });

      console.log(
        `Successfully added contact as an audience member. The contact's id is ${response.id}.`
      );

      if (response.statusCode === 400) {
        res.sendFile(__dirname + "/failure.html");
      } else {
        res.sendFile(__dirname + "/success.html");
      }
    } catch (e) {
      res.sendFile(__dirname + "/failure.html");
    }
  }

  run();
});

// async function run() {
//   const response = await mailchimp.ping.get();
//   console.log(response);
// }
// run();

app.listen(port, (req, res) => {
  console.log("App listening to port :" + port);
});
