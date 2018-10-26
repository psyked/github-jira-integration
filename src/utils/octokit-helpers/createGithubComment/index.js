// @flow
const octokit = require("@octokit/rest")();

const log = require("../../logger");

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

export default createGithubComment;
