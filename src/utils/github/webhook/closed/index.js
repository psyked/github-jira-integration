// @flow
const jira = require("./../../../../utils/jira");
const {
    getConfigFromRepo,
    createGithubComment,
    getJiraTicketNumberFromGithubComments
} = require("./../../../../utils/octokit-helpers");
const { callMultipleTransitions } = require("../../../jira/utils");
const log = require("../../../../utils/logger");

const { JIRA_BASE_URL } = require("../../../../config");

module.exports = async ({ id, name, payload }) => {
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

        if (Array.isArray(jiraTranisitionId)) {
            callMultipleTransitions(issueNumber, jiraTranisitionId);
        } else {
            await jira.moveIssue({ issueNumber, transitionId: jiraTranisitionId });
        }

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
};
