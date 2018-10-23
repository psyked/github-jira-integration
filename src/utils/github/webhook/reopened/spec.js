const http = require("http");
const rp = require("request-promise");
const crypto = require("crypto");
const { webhooks } = require("./../../../../");
const issueReopenedEvent = require("../../../../../sample-data/events/issue-reopened.json");

const { JIRA_BASE_URL } = require("./../../../../config");

jest.mock("./../../../../utils/octokit-helpers", () => {
    return {
        getConfigFromRepo: jest.fn(() => ({
            jira: { projectId: 1 },
            issueOpened: { jiraIssueType: "Bug", epicLink: { id: "epicLinkId", epicId: "epicId" } },
            issueReopened: { jiraTranisitionId: "jiraTranisitionId" },
            pullRequestReopened: { jiraTranisitionId: "jiraTranisitionId" },
            pullRequestOpened: { jiraIssueType: "Story", epicLink: { id: "epicLinkId2", epicId: "epicId2" } }
        })),
        createGithubComment: jest.fn(() => Promise.resolve()),
        getJiraTicketNumberFromGithubComments: jest.fn(() => "jiraIssueNumber")
    };
});

jest.mock("./../../../../utils/jira", () => {
    return {
        moveIssue: jest.fn(() => {})
    };
});

const { getConfigFromRepo, createGithubComment } = require("./../../../../utils/octokit-helpers");
const { moveIssue } = require("./../../../../utils/jira");

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
        describe("issues.reopened", () => {
            it("should read the issue reopened payload and move the Jira issue and create Github comments with the information from the payload and config", async () => {
                await rp({
                    method: "POST",
                    uri: "http://localhost:5000",
                    headers: {
                        "X-GitHub-Delivery": "97fa9b90-88e2-11e8-8ba5-de8901c5b99e",
                        "X-GitHub-Event": "issues",
                        "X-Hub-Signature": `sha1=${generateSignature(issueReopenedEvent)}`
                    },
                    body: issueReopenedEvent,
                    json: true
                });

                expect(getConfigFromRepo).toBeCalledWith({
                    owner: "psyked",
                    repo: "github-jira"
                });

                expect(moveIssue).toBeCalledWith({
                    issueNumber: "jiraIssueNumber",
                    transitionId: "jiraTranisitionId"
                });

                expect(createGithubComment).toBeCalledWith({
                    body: `Reopened Jira ticket: ${JIRA_BASE_URL}/browse/jiraIssueNumber`,
                    number: 1,
                    owner: "psyked",
                    repo: "github-jira"
                });
            });
        });
    });
});
