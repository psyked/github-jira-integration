describe("createGithubComment", () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it("calls octokit.issues.createComment to create a Github comment", async () => {
        jest.mock("@octokit/rest", () => {
            return () => ({
                authenticate: () => {},
                issues: {
                    createComment: jest.fn(() => Promise.resolve("Done"))
                }
            });
        });

        const createGithubComment = require("./");

        const data = await createGithubComment({
            owner: "test",
            repo: "test",
            number: 10,
            body: "Test"
        });

        expect(data).toBe("Done");
    });
});
