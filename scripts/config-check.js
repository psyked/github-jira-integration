const config = require("../config");

const requiredConfig = [
    "WEBHOOK_SECRET",
    "GITHUB_TOKEN",
    "JIRA_USERNAME",
    "JIRA_TOKEN",
    "JIRA_BASE_URL",
    "JIRA_PROJECT_ID"
];

console.log("Checking config & environment variables...");

requiredConfig.forEach(key => {
    if (config[key] === undefined) {
        throw new Error(`Missing required configuration, please check the docs. Missing value for: ${key}`);
        process.exit(1);
    }
});

console.log("All config variables are set");
