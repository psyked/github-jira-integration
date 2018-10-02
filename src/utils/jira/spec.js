const nock = require("nock");
const jira = require("./");

describe("jira", () => {
    describe("moveIssue", () => {
        describe("Throws an error", () => {
            it("when issueNumber is missing", async () => {
                await expect(jira.moveIssue({})).rejects.toThrow("issueNumber is required");
            });

            it("when the transitionId is missing", async () => {
                await expect(
                    jira.moveIssue({
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
                    jira.moveIssue({
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
                jira.moveIssue({
                    transitionId: 1,
                    issueNumber: "TICKET-1"
                })
            ).resolves.not.toThrow();
        });
    });

    describe("createIssue", () => {
        describe("Throws an error", () => {
            it("when issueType is not configured", async () => {
                await expect(jira.createIssue()).rejects.toThrow("issueType is required");
            });

            it("when projectId is not configured", async () => {
                await expect(
                    jira.createIssue({
                        issueType: "Bug"
                    })
                ).rejects.toThrow("projectId is required");
            });

            xit("when failing to make a request to the JIRA API", async () => {
                nock("https://test.atlassian.net")
                    .post("/rest/api/2/issue")
                    .reply(500);

                await expect(
                    jira.createIssue({
                        issueType: "Bug",
                        projectId: "1"
                    })
                ).rejects.toThrow("Failed to make a new JIRA issue");
            });
        });

        it("makes a request to Jira to create an issue and returns the data from the request", async () => {
            nock("https://test.atlassian.net")
                .post("/rest/api/2/issue")
                .reply(201, { id: "123" });

            const data = await jira.createIssue({
                issueType: "Bug",
                projectId: "1"
            });

            expect(data).toEqual({
                id: "123"
            });
        });

        it("makes a request to Jira with the configured PROJECT_ID", async () => {
            let payload = null;

            nock("https://test.atlassian.net")
                .post("/rest/api/2/issue", body => {
                    payload = body;
                    return body;
                })
                .reply(201, { id: "123" });

            const data = await jira.createIssue({
                issueType: "Bug",
                projectId: "1"
            });

            expect(payload).toMatchObject({
                fields: {
                    project: {
                        id: "1"
                    }
                }
            });
        });

        it("makes a request to Jira with the configured `issueType`", async () => {
            let payload = null;

            nock("https://test.atlassian.net")
                .post("/rest/api/2/issue", body => {
                    payload = body;
                    return body;
                })
                .reply(201, { id: "123" });

            const data = await jira.createIssue({
                issueType: "Bug",
                projectId: "1"
            });

            expect(payload).toMatchObject({
                fields: {
                    issuetype: {
                        name: "Bug"
                    }
                }
            });
        });

        describe("defaults & overrides", () => {
            describe("labels", () => {
                it("sets the default JIRA `labels` value to be `automated`", async () => {
                    let payload = null;

                    nock("https://test.atlassian.net")
                        .post("/rest/api/2/issue", body => {
                            payload = body;
                            return body;
                        })
                        .reply(201, { id: "123" });

                    const data = await jira.createIssue({
                        issueType: "Bug",
                        projectId: "1"
                    });

                    expect(payload).toMatchObject({
                        fields: {
                            labels: ["automated"]
                        }
                    });
                });

                it("overrides the `labels` with any given labels", async () => {
                    nock("https://test.atlassian.net")
                        .post("/rest/api/2/issue", body => {
                            payload = body;
                            return body;
                        })
                        .reply(201, { id: "123" });

                    const data = await jira.createIssue({
                        labels: ["override"],
                        issueType: "Bug",
                        projectId: "1"
                    });

                    expect(payload).toMatchObject({
                        fields: {
                            labels: ["override"]
                        }
                    });
                });
            });

            describe("description", () => {
                it("sets the default JIRA `description` value to be `Generated by github-jira`", async () => {
                    let payload = null;

                    nock("https://test.atlassian.net")
                        .post("/rest/api/2/issue", body => {
                            payload = body;
                            return body;
                        })
                        .reply(201, { id: "123" });

                    const data = await jira.createIssue({
                        issueType: "Bug",
                        projectId: "1"
                    });

                    expect(payload).toMatchObject({
                        fields: {
                            description: "Generated by github-jira"
                        }
                    });
                });

                it("overrides the `description` with any given description", async () => {
                    nock("https://test.atlassian.net")
                        .post("/rest/api/2/issue", body => {
                            payload = body;
                            return body;
                        })
                        .reply(201, { id: "123" });

                    const data = await jira.createIssue({
                        description: "Here is a new description",
                        issueType: "Bug",
                        projectId: "1"
                    });

                    expect(payload).toMatchObject({
                        fields: {
                            description: "Here is a new description"
                        }
                    });
                });
            });
        });
    });
});
