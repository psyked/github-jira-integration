const rp = require("request-promise");
const url = require("url");

const log = require("../../../logger");
const { JIRA_BASE_URL, JIRA_TOKEN, JIRA_USERNAME } = require("../../../../config");
const { propertiesMustBeDefined, generateRequestOptions } = require("../../utils");

module.exports = async (options = {}) => {
    const { issueType, projectId, ...restOfOptions } = options;

    propertiesMustBeDefined({
        JIRA_USERNAME,
        JIRA_TOKEN,
        JIRA_BASE_URL,
        issueType,
        projectId
    });

    const defaults = {
        labels: ["automated"],
        description: "Generated by github-jira"
    };

    const payload = Object.assign(defaults, restOfOptions);

    const requestOptions = {
        ...generateRequestOptions(),
        uri: url.resolve(JIRA_BASE_URL, "/rest/api/2/issue"),
        body: {
            fields: {
                project: {
                    id: projectId
                },
                issuetype: {
                    name: issueType
                },
                ...payload
            }
        }
    };

    try {
        const data = await rp(requestOptions);
        log.info(
            {
                projectId,
                issueType,
                payload
            },
            `Jira issue created`
        );
        return data;
    } catch (err) {
        return Promise.reject(new Error("Failed to make a new JIRA issue"));
    }
};