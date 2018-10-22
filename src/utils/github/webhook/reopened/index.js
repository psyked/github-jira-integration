// @flow
const log = require("../../../../utils/logger");

const { JIRA_BASE_URL } = require("../../../../config");

module.exports = async ({ id, name, payload }) => {
    const { repository: { owner: { login } = {}, name: repo } = {} } = payload;

    const key = name === "issues" ? "issue" : name;
    const configKey = key === "issue" ? "issueReopened" : "pullRequestReopened";
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
            body: `Reopened Jira ticket: ${JIRA_BASE_URL}/browse/${issueNumber}`
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
            "Failed to reopen the ticket on Jira"
        );
        throw new Error("Failed to move tickets in Jira and Github");
    }
};
