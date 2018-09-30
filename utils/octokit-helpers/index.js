// @flow
const octokit = require("@octokit/rest")();
const base64 = require("base-64");
const yaml = require("js-yaml");
const log = require("../logger");

const { GITHUB_TOKEN, JIRA_BASE_URL } = require("../../config");

octokit.authenticate({
    type: "token",
    token: GITHUB_TOKEN
});

/**
 * Reads & returns the `github-jira` confiration file.
 */
const getConfigFromRepo = async ({ owner, repo } = {}) => {
    try {
        const githubConfig = await octokit.repos.getContent({
            owner,
            repo,
            path: ".github/github-jira.yml"
        });

        const { data: { content } = {} } = githubConfig || {};

        const yml = base64.decode(content);

        const config = yaml.safeLoad(yml);

        log.info(
            {
                owner,
                repo
            },
            "Successfully got config from project"
        );

        return config;
    } catch (err) {
        throw new Error("Failed to get `github-jira.yml` file");
    }
};

const createGithubComment = async ({ owner, repo, number, body }) => {
    try {
        return await octokit.issues.createComment({
            owner,
            repo,
            number,
            body
        });
    } catch (err) {
        log.error({ owner, repo, number, body }, "Failed to create Github comment");
        throw new Error("Failed to create comment");
    }
};

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
    } catch (err) {}
};

module.exports = {
    getConfigFromRepo,
    createGithubComment,
    getJiraTicketNumberFromGithubComments
};
