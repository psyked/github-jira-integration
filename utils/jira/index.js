// @flow
const rp = require("request-promise");
const base64 = require("base-64");
const url = require("url");
const log = require("../logger");

const { JIRA_BASE_URL, JIRA_TOKEN, JIRA_USERNAME } = require("../../config");

const propertiesMustBeDefined = object => {
    Object.keys(object).forEach(key => {
        if (object[key] === undefined) {
            log.error(object, `Missing configuration, ${key} is required when creating JIRA issues`);
            throw new Error(`${key} is required`);
        }
    });
};

const generateRequestOptions = () => {
    return {
        method: "POST",
        headers: {
            Authorization: `Basic ${base64.encode(`${JIRA_USERNAME}:${JIRA_TOKEN}`)}`,
            "Content-Type": "application/json"
        },
        json: true
    };
};

const createIssue = async (options = {}) => {
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
        throw new Error("Failed to make a new JIRA issue");
        return Promise.reject();
    }
};

const moveIssue = async ({ issueNumber, transitionId } = {}) => {
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
        throw new Error("Failed to move JIRA issue");
        return Promise.reject();
    }
};

module.exports = {
    createIssue,
    moveIssue
};
