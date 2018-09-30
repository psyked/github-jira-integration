// @flow
const bunyan = require("bunyan");

const log = bunyan.createLogger({ name: "github-jira" });

if (process.env.NODE_ENV === "test") {
    log.level(bunyan.FATAL + 1);
}

module.exports = log;
