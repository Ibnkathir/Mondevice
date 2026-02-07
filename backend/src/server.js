require("dotenv").config();
const { app, startDatabase } = require("./app");

const PORT = process.env.PORT || 4000;

const start = async () => {
  await startDatabase();
  app.listen(PORT, () => {
    console.log(`Bidaya API en écoute sur le port ${PORT}`);
  });
};

start();
