// @flow
const octokit = require("@octokit/rest")();

const getConfigFromRepo = require("./getConfigFromRepo");
const getJiraTicketNumberFromGithubComments = require("./getJiraTicketFromComment");
const createGithubComment = require("./createGithubComment");

const { GITHUB_TOKEN } = require("../../config");

octokit.authenticate({
    type: "token",
    token: GITHUB_TOKEN
});

module.exports = {
    octokit,
    getConfigFromRepo,
    createGithubComment,
    getJiraTicketNumberFromGithubComments
};
