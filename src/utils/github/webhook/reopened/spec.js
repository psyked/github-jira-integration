const http = require("http");
const rp = require("request-promise");
const crypto = require("crypto");

const { webhooks } = require("./../../../../");
const issueReopenedEvent = require("../../../../../sample-data/events/issue-reopened.json");
const { getConfigFromRepo, createGithubComment } = require("./../../../../utils/octokit-helpers");
const { moveIssue } = require("./../../../../utils/jira");

const { JIRA_BASE_URL } = require("./../../../../config");

jest.mock("./../../../../utils/octokit-helpers", () => ({
    getConfigFromRepo: jest.fn(() => ({
        jira: { projectId: 1 },
        issueOpened: { jiraIssueType: "Bug", epicLink: { id: "epicLinkId", epicId: "epicId" } },
        issueReopened: { jiraTranisitionId: "jiraTranisitionId" },
        pullRequestReopened: { jiraTranisitionId: "jiraTranisitionId" },
        pullRequestOpened: { jiraIssueType: "Story", epicLink: { id: "epicLinkId2", epicId: "epicId2" } }
    })),
    createGithubComment: jest.fn(() => Promise.resolve()),
    getJiraTicketNumberFromGithubComments: jest.fn(() => "jiraIssueNumber")
}));

jest.mock("./../../../../utils/jira", () => ({
    moveIssue: jest.fn(() => {})
}));

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
            afterEach(() => {
                getConfigFromRepo.mockClear();
                moveIssue.mockClear();
            });

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

                expect(getConfigFromRepo).toHaveBeenCalledTimes(1);
                expect(getConfigFromRepo).toBeCalledWith({
                    owner: "psyked",
                    repo: "github-jira"
                });

                expect(moveIssue).toHaveBeenCalledTimes(1);
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

            it("should loop through transition IDs array and wait till allowed transition is found", async () => {
                getConfigFromRepo.mockImplementation(() => ({
                    jira: { projectId: 1 },
                    issueOpened: { jiraIssueType: "Bug", epicLink: { id: "epicLinkId", epicId: "epicId" } },
                    issueReopened: {
                        jiraTranisitionId: [
                            "jiraTransitionId1",
                            "jiraTransitionId2",
                            "jiraTransitionId3",
                            "jiraTransitionId4",
                            "jiraTransitionId5"
                        ]
                    },
                    pullRequestReopened: { jiraTranisitionId: "jiraTransitionId" },
                    pullRequestOpened: { jiraIssueType: "Story", epicLink: { id: "epicLinkId2", epicId: "epicId2" } }
                }));

                moveIssue.mockImplementation(({ issueNumber, transitionId }) => {
                    if (transitionId !== "jiraTransitionId3") throw Error("Invalid transition");
                    return true;
                });

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

                expect(getConfigFromRepo).toHaveBeenCalledTimes(1);
                expect(getConfigFromRepo).toBeCalledWith({
                    owner: "psyked",
                    repo: "github-jira"
                });

                expect(moveIssue).toHaveBeenCalledTimes(3);
                expect(moveIssue.mock.calls[0][0].transitionId).toBe("jiraTransitionId1");
                expect(moveIssue.mock.calls[1][0].transitionId).toBe("jiraTransitionId2");
                expect(moveIssue.mock.calls[2][0].transitionId).toBe("jiraTransitionId3");

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
