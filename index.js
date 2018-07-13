const WebhooksApi = require("@octokit/webhooks");
const octokit = require("@octokit/rest")();

const jira = require("./utils/jira");
const { getConfigFromRepo, createGithubComment } = require("./utils/octokit-helpers");
const log = require("./utils/logger");

const { JIRA_BASE_URL, WEBHOOK_SECRET, GITHUB_TOKEN } = require("./config");

const webhooks = new WebhooksApi({
    secret: WEBHOOK_SECRET
});

webhooks.on("*", ({ id, name, payload }) => {
    console.log(name, "event received");
});

webhooks.on("issues.opened", async ({ id, name, payload }) => {
    const { issue, repository: { owner: { login } = {}, name: repo } = {} } = payload;

    const { title, html_url, body, url, number } = issue;

    try {
        const projectConfig = await getConfigFromRepo({ owner: login, repo });

        const {
            jira: { projectId },
            issueOpened: { jiraIssueType, epicLink: { id: customFieldId, epicId } = {} } = {}
        } = projectConfig;

        const { key: jiraTicketNumber } = await jira.createIssue({
            projectId,
            summary: title,
            issueType: "Bug",
            description: ` Issue: ${html_url} ${body}`,
            // If the epic links are set in the config, set them up.
            [customFieldId]: epicId
        });

        await createGithubComment({
            owner: login,
            repo,
            number,
            body: `Your Jira ticket: ${JIRA_BASE_URL}/browse/${jiraTicketNumber}`
        });
    } catch (err) {
        log.error(
            {
                login,
                repo,
                html_url,
                url
            },
            "Failed to create tickets in Jira and Github"
        );
        throw new Error("Failed to create tickets in Jira and Github");
    }
});

console.log("Listening on port 3000");
require("http")
    .createServer(webhooks.middleware)
    .listen(3000);
