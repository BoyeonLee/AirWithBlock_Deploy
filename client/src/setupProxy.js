const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://airwithblock.herokuapp.com",
      changeOrigin: true,
    })
  );
};
