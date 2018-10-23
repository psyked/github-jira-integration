const base64 = require("base-64");

const log = require("../../logger");

const { JIRA_TOKEN, JIRA_USERNAME } = require("../../../config");

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

module.exports = {
    propertiesMustBeDefined,
    generateRequestOptions
};
