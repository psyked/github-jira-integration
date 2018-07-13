const { encode } = require("base-64");

const configExample = encode(`
jira:
    projectId: 1
issueOpened:
    jiraIssueType: Bug
    epicLink:
        id: customfield_10001
        epicId : EPIC_ID
`);

describe("octokit-helpers", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe("configExample", () => {
        it("reads the configuration file and returns a json object that represents the config file", async () => {
            jest.mock("@octokit/rest", () => {
                const { encode } = require("base-64");

                const configExample = encode(`
                    jira:
                        projectId: 1
                    issueOpened:
                        jiraIssueType: Bug
                        epicLink:
                            id: customfield_10001
                            epicId : EPIC_ID
                `);

                return () => ({
                    authenticate: () => {},
                    repos: {
                        getContent: () => ({
                            data: {
                                content: configExample
                            }
                        })
                    }
                });
            });

            const { getConfigFromRepo } = require("./");

            const data = await getConfigFromRepo({
                owner: "test",
                repo: "test"
            });

            expect(data).toEqual({
                jira: {
                    projectId: 1
                },
                issueOpened: {
                    jiraIssueType: "Bug",
                    epicLink: {
                        id: "customfield_10001",
                        epicId: "EPIC_ID"
                    }
                }
            });
        });

        it("throws an error if the file content cannot be found", async () => {
            jest.mock("@octokit/rest", () => {
                const { encode } = require("base-64");

                const configExample = encode(`
                    jira:
                        projectId: 1
                    issueOpened:
                        jiraIssueType: Bug
                        epicLink:
                            id: customfield_10001
                            epicId : EPIC_ID
                `);

                return () => ({
                    authenticate: () => {},
                    repos: {
                        getContent: () => ({
                            message: "Not Found",
                            documentation_url: "https://developer.github.com/v3/repos/contents/#get-contents"
                        })
                    }
                });
            });

            const { getConfigFromRepo } = require("./");

            await expect(
                getConfigFromRepo({
                    owner: "test",
                    repo: "test"
                })
            ).rejects.toThrow("Failed to get `github-jira.yml` file");
        });
    });

    describe("createGithubComment", () => {
        it("calls octokit.issues.createComment to create a Github comment", async () => {
            jest.mock("@octokit/rest", () => {
                return () => ({
                    authenticate: () => {},
                    issues: {
                        createComment: jest.fn(() => Promise.resolve("Done"))
                    }
                });
            });

            const { createGithubComment } = require("./");

            const data = await createGithubComment({
                owner: "test",
                repo: "test",
                number: 10,
                body: "Test"
            });

            expect(data).toBe("Done");
        });
    });
});
