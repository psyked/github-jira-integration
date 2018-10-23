const http = require("http");
const { webhooks } = require("./../");

module.exports = async () => {
    console.log("DOING GLOBAL SETUP", webhooks);
    const server = http.createServer(webhooks.middleware);
    await server.listen.bind(server)(5000);
};
