// @flow
const WebhooksApi = require("@octokit/webhooks");
const octokit = require("@octokit/rest")();

const jira = require("./utils/jira");
const {
    getConfigFromRepo,
    createGithubComment,
    getJiraTicketNumberFromGithubComments
} = require("./utils/octokit-helpers");
const log = require("./utils/logger");

const { JIRA_BASE_URL, WEBHOOK_SECRET, GITHUB_TOKEN } = require("./config");

const webhooks = new WebhooksApi({
    secret: WEBHOOK_SECRET
});

webhooks.on("*", ({ id, name, payload }) => {
    console.log(name, "event received");
});

webhooks.on(["issues.opened", "pull_request.opened"], require("./utils/github/webhook/opened"));

webhooks.on(["issues.reopened", "pull_request.reopened"], require("./utils/github/webhook/reopened"));

webhooks.on(["issues.closed", "pull_request.closed"], require("./utils/github/webhook/closed"));

if (process.env.NODE_ENV === "test") {
    require("http")
        .createServer(webhooks.middleware)
        .listen(3000);
}

module.exports = {
    webhooks
};
