const rp = require("request-promise");
const url = require("url");

const log = require("../../../logger");
const { JIRA_BASE_URL, JIRA_TOKEN, JIRA_USERNAME } = require("../../../../config");
const { propertiesMustBeDefined, generateRequestOptions } = require("../../utils");

module.exports = async ({ issueNumber, transitionId } = {}) => {
    propertiesMustBeDefined({
        issueNumber,
        transitionId,
        JIRA_USERNAME,
        JIRA_TOKEN,
        JIRA_BASE_URL
    });

    const requestOptions = {
        ...generateRequestOptions(),
        uri: url.resolve(JIRA_BASE_URL, `/rest/api/2/issue/${issueNumber}/transitions?expand=transition.fields`),
        body: {
            transition: {
                id: transitionId
            }
        }
    };

    try {
        const data = await rp(requestOptions);
        log.info(`Jira issue created`);
        return data;
    } catch (err) {
        return Promise.reject(new Error("Failed to move JIRA issue"));
    }
};
