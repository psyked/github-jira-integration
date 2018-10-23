// @flow
const jira = require("../../../../utils/jira");
const { getConfigFromRepo, createGithubComment } = require("./../../../../utils/octokit-helpers");
const log = require("../../../../utils/logger");

const { JIRA_BASE_URL } = require("../../../../config");

module.exports = async ({ id, name, payload }) => {
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
};
