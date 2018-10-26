// @flow
const octokit = require("@octokit/rest")();
const base64 = require("base-64");
const yaml = require("js-yaml");

const log = require("../../logger");

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

export default getConfigFromRepo;
