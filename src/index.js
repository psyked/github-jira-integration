// @flow
const WebhooksApi = require("@octokit/webhooks");

const { WEBHOOK_SECRET } = require("./config");

const webhooks = new WebhooksApi({
    secret: WEBHOOK_SECRET
});

webhooks.on("*", ({ name }) => {
    console.log(name, "event received");
});

webhooks.on(["issues.opened", "pull_request.opened"], require("./utils/github/webhook/opened"));

webhooks.on(["issues.reopened", "pull_request.reopened"], require("./utils/github/webhook/reopened"));

webhooks.on(["issues.closed", "pull_request.closed"], require("./utils/github/webhook/closed"));

module.exports = {
    webhooks
};
