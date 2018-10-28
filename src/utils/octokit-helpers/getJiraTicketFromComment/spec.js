describe("getJiraTicketNumberFromGithubComments", () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it("finds the Jira ticket number in a list of comments", async () => {
        jest.mock("@octokit/rest", () => {
            return () => ({
                authenticate: () => {},
                issues: {
                    getComments: () => ({
                        data: [
                            { body: `Random comment on a github issue` },
                            { body: `Another Random comment on a github issue` },
                            { body: `Your Jira ticket was raised ${process.env.JIRA_BASE_URL}/browse/Test-Ticket1` }
                        ]
                    })
                }
            });
        });

        const getJiraTicketNumberFromGithubComments = require("./");

        const jiraTicketNumber = await getJiraTicketNumberFromGithubComments({
            owner: "test",
            repo: "test",
            number: 10
        });

        expect(jiraTicketNumber).toBe("Test-Ticket1");
    });

    it.only("returns the last JIRA number in the array of comments if more than 1 Jira ticket comment is found", async () => {
        jest.mock("@octokit/rest", () => {
            return () => ({
                authenticate: () => {},
                issues: {
                    getComments: () => ({
                        data: [
                            { body: `Random comment on a github issue` },
                            { body: `Another Random comment on a github issue` },
                            {
                                body: `Your Jira ticket was raised ${process.env.JIRA_BASE_URL}/browse/Test-Ticket1`
                            },
                            { body: `Your Jira ticket was raised ${process.env.JIRA_BASE_URL}/browse/Test-Ticket2` }
                        ]
                    })
                }
            });
        });

        const getJiraTicketNumberFromGithubComments = require("./");

        const jiraTicketNumber = await getJiraTicketNumberFromGithubComments({
            owner: "test",
            repo: "test",
            number: 10
        });

        expect(jiraTicketNumber).toBe("Test-Ticket2");
    });

    it("returns undefined if no Jira ticket number can be found in the list of comments", async () => {
        jest.mock("@octokit/rest", () => {
            return () => ({
                authenticate: () => {},
                issues: {
                    getComments: () => ({
                        data: [
                            { body: `Random comment on a github issue` },
                            { body: `Another Random comment on a github issue` }
                        ]
                    })
                }
            });
        });

        const getJiraTicketNumberFromGithubComments = require("./");

        const jiraTicketNumber = await getJiraTicketNumberFromGithubComments({
            owner: "test",
            repo: "test",
            number: 10
        });

        expect(jiraTicketNumber).toBe(undefined);
    });
});
