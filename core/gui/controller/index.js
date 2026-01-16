const axios = require("axios");
const { workstation: fn } = require("../functions");

const getWorkstation = (req, res) => res.json(fn.getWorkstation());

const signup = async (req, res) => {
  try {
    const { data } = await axios.post(
      "https://great-unknown.onrender.com/api/auth/signup",
      req.body
    );
    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};

const signin = async (req, res) => {
  try {
    const { data } = await axios.post(
      "https://great-unknown.onrender.com/api/auth/signin",
      req.body
    );

    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};

module.exports = {
  getWorkstation,
  signup,
  signin,
};
