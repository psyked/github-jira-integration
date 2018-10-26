describe("octokit-helpers", () => {
    it("exports getConfigFromRepo", () => {
        const { getConfigFromRepo } = require("./");
        expect(getConfigFromRepo).toBeDefined();
    });
    it("exports createGithubComment", () => {
        const { createGithubComment } = require("./");
        expect(createGithubComment).toBeDefined();
    });
    it("exports getJiraTicketNumberFromGithubComments", () => {
        const { getJiraTicketNumberFromGithubComments } = require("./");
        expect(getJiraTicketNumberFromGithubComments).toBeDefined();
    });
});
