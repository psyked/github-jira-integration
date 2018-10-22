const http = require("http");
const rp = require("request-promise");
const crypto = require("crypto");
const { webhooks } = require("./../../../../");
const issueOpenedEvent = require("../../../../../sample-data/events/issue-opened.json");
const pullRequestOpenedEvent = require("../../../../../sample-data/events/pull-request-opened.json");

const { JIRA_BASE_URL } = require("./../../../../config");

jest.mock("./../../../../utils/octokit-helpers", () => {
    return {
        getConfigFromRepo: jest.fn(() => ({
            jira: { projectId: 1 },
            issueOpened: { jiraIssueType: "Bug", epicLink: { id: "epicLinkId", epicId: "epicId" } },
            issueClosed: { jiraTranisitionId: "jiraTranisitionId" },
            pullRequestClosed: { jiraTranisitionId: "jiraTranisitionId" },
            pullRequestOpened: { jiraIssueType: "Story", epicLink: { id: "epicLinkId2", epicId: "epicId2" } }
        })),
        createGithubComment: jest.fn(() => Promise.resolve()),
        getJiraTicketNumberFromGithubComments: jest.fn(() => "jiraIssueNumber")
    };
});

jest.mock("./../../../../utils/jira", () => {
    return {
        createIssue: jest.fn(() => ({
            key: "jiraTicketNumber"
        }))
    };
});

const { getConfigFromRepo, createGithubComment } = require("./../../../../utils/octokit-helpers");
const { createIssue } = require("./../../../../utils/jira");

const generateSignature = body => {
    const hmac = crypto.createHmac("sha1", process.env.WEBHOOK_SECRET);
    hmac.update(JSON.stringify(body), "utf-8");
    return hmac.digest("hex");
};

describe("webhooks", () => {
    const server = http.createServer(webhooks.middleware);
    beforeEach(async () => {
        await server.listen.bind(server)(5000);
    });
    afterEach(async () => {
        await server.close();
    });
    describe("issues", () => {
        describe("issues.opened", () => {
            it("should read the issue payload and create Jira and Github comments with the information from the payload and config", async () => {
                await rp({
                    method: "POST",
                    uri: "http://localhost:5000",
                    headers: {
                        "X-GitHub-Delivery": "97fa9b90-88e2-11e8-8ba5-de8901c5b99e",
                        "X-GitHub-Event": "issues",
                        "X-Hub-Signature": `sha1=${generateSignature(issueOpenedEvent)}`
                    },
                    body: issueOpenedEvent,
                    json: true
                });

                expect(getConfigFromRepo).toBeCalledWith({
                    owner: "boyney123",
                    repo: "test"
                });

                expect(createGithubComment).toBeCalledWith({
                    body: `Your Jira ticket: ${JIRA_BASE_URL}/browse/jiraTicketNumber`,
                    number: 47,
                    owner: "boyney123",
                    repo: "test"
                });

                expect(createIssue).toBeCalledWith({
                    projectId: 1,
                    summary: "Github Issue - Issue opened Example",
                    description: `https://github.com/boyney123/test/issues/47 Test`,
                    issueType: "Bug",
                    epicLinkId: "epicId"
                });
            });
        });
    });

    describe("pull_request", () => {
        describe("pull_request.opened", () => {
            it("should read the pull request payload and create Jira and Github comments with the information from the payload and config", async () => {
                await rp({
                    method: "POST",
                    uri: "http://localhost:5000",
                    headers: {
                        "X-GitHub-Delivery": "97fa9b90-88e2-11e8-8ba5-de8901c5b99e",
                        "X-GitHub-Event": "pull_request",
                        "X-Hub-Signature": `sha1=${generateSignature(pullRequestOpenedEvent)}`
                    },
                    body: pullRequestOpenedEvent,
                    json: true
                });

                expect(getConfigFromRepo).toBeCalledWith({
                    owner: "boyney123",
                    repo: "test"
                });

                expect(createGithubComment).toBeCalledWith({
                    body: `Your Jira ticket: ${JIRA_BASE_URL}/browse/jiraTicketNumber`,
                    number: 48,
                    owner: "boyney123",
                    repo: "test"
                });

                expect(createIssue).toBeCalledWith({
                    projectId: 1,
                    summary: "Github Pull Request - Update github-jira.yml",
                    description: `https://github.com/boyney123/test/pull/48 `,
                    issueType: "Story",
                    epicLinkId2: "epicId2"
                });
            });
        });
    });
});
