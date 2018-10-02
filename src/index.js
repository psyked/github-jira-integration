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

webhooks.on(["issues.opened", "pull_request.opened"], async ({ id, name, payload }) => {
    const { repository: { owner: { login } = {}, name: repo } = {} } = payload;

    const key = name === "issues" ? "issue" : name;
    const configKey = key === "issue" ? "issueOpened" : "pullRequestOpened";
    const summary = key === "issue" ? "Github Issue" : "Github Pull Request";
    const data = payload[key];

    const { title, html_url, body, url, number } = data;

    try {
        const projectConfig = await getConfigFromRepo({ owner: login, repo });

        const {
            jira: { projectId },
            [configKey]: { jiraIssueType, epicLink: { id: customFieldId, epicId } = {} } = {}
        } = projectConfig;

        const { key: jiraTicketNumber } = await jira.createIssue({
            projectId,
            summary: `${summary} - ${title}`,
            issueType: jiraIssueType,
            description: `${html_url} ${body}`,
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
                url,
                key,
                configKey
            },
            "Failed to create tickets for Jira & Github"
        );
        throw new Error("Failed to create tickets for Jira & Github");
    }
});

webhooks.on(["issues.closed", "pull_request.closed"], async ({ id, name, payload }) => {
    const { repository: { owner: { login } = {}, name: repo } = {} } = payload;

    const key = name === "issues" ? "issue" : name;
    const configKey = key === "issue" ? "issueClosed" : "pullRequestClosed";
    const data = payload[key];

    const { title, html_url, body, url, number } = data;

    try {
        const projectConfig = await getConfigFromRepo({ owner: login, repo });

        const { [configKey]: { jiraTranisitionId } = {} } = projectConfig;

        const issueNumber = await getJiraTicketNumberFromGithubComments({
            owner: login,
            repo,
            number
        });

        await jira.moveIssue({ issueNumber, transitionId: jiraTranisitionId });

        log.info(
            {
                owner: login,
                repo,
                number,
                issueNumber,
                jiraTranisitionId,
                key
            },
            "Moved Jira Card"
        );

        await createGithubComment({
            owner: login,
            repo,
            number,
            body: `Closed Jira ticket: ${JIRA_BASE_URL}/browse/${issueNumber}`
        });
    } catch (err) {
        console.log(err);
        log.error(
            {
                login,
                repo,
                html_url,
                url
            },
            "Failed to close the ticket on Jira"
        );
        throw new Error("Failed to move tickets in Jira and Github");
    }
});

if (process.env.NODE_ENV === "test") {
    require("http")
        .createServer(webhooks.middleware)
        .listen(3000);
}

module.exports = {
    webhooks
};
