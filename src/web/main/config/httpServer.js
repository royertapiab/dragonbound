const config = require("@web/main/config/env");

const setupHttpServer = (app) => {
  const http = require("http").createServer();
  http.on("request", app);
  http.listen(config.PORT, "127.0.0.1");
  return http;
};

module.exports = setupHttpServer;
