const nock = require("nock");
const moveIssue = require("./");

describe("jira", () => {
    describe("moveIssue", () => {
        describe("Throws an error", () => {
            it("when issueNumber is missing", async () => {
                await expect(moveIssue({})).rejects.toThrow("issueNumber is required");
            });

            it("when the transitionId is missing", async () => {
                await expect(
                    moveIssue({
                        issueNumber: 1
                    })
                ).rejects.toThrow("transitionId is required");
            });

            it("when failing to make a request to jira", () => {
                nock("https://test.atlassian.net")
                    .post("/rest/api/2/issue/TICKET-1/transitions")
                    .query({ expand: "transition.fields" })
                    .reply(500);

                expect(
                    moveIssue({
                        transitionId: 1,
                        issueNumber: "TICKET-1"
                    })
                ).rejects.toThrow("Failed to move JIRA issue");
            });
        });
        it("makes a request to Jira to move the issue and returns a resolved promise when done", async () => {
            nock("https://test.atlassian.net")
                .post("/rest/api/2/issue/TICKET-1/transitions")
                .query({ expand: "transition.fields" })
                .reply(204);

            await expect(
                moveIssue({
                    transitionId: 1,
                    issueNumber: "TICKET-1"
                })
            ).resolves.not.toThrow();
        });
    });
});
