// @flow
const octokit = require("@octokit/rest")();

const log = require("../../logger");

const { JIRA_BASE_URL } = require("../../../config");

const getComments = async ({ owner, repo, number }) => {
    try {
        return await octokit.issues.getComments({
            owner,
            repo,
            number
        });
    } catch (err) {
        log.error({ owner, repo, number }, "Failed to getComments");
        throw new Error("Failed to create comment");
    }
};

const getJiraTicketNumberFromGithubComments = async ({ owner, repo, number }) => {
    try {
        const { data: comments = [] } = await getComments({ owner, repo, number });
        const commentsWithJiraInformation = comments.filter(({ body = "" } = {}) => {
            return body.indexOf(`${JIRA_BASE_URL}/browse/`) > -1;
        });

        const { body: jiraComment = "" } = commentsWithJiraInformation.pop() || {};

        log.info(
            {
                owner,
                repo,
                number
            },
            "Found JIRA ticket number"
        );

        return jiraComment.split("/").pop() || undefined;
    } catch (err) {
        log.error({ owner, repo, number }, "Failed to get JIRA ticket number");
        throw new Error("Failed to get JIRA ticket number");
    }
};

module.exports = getJiraTicketNumberFromGithubComments;
