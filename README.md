<p align="center">
  <img src="https://assets-cdn.github.com/images/modules/open_graph/github-mark.png" width="128">
  <h3 align="center"><a href="https://github.com/marketplace/auto-comment">Github-Jira</a></h3>
  <p align="center">A tool to automate integration between Jira and Github.<p>
  <p align="center">
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT"></a>
 
  </p>
</p>

## GitHub + JIRA Integration

An integration layer to link GitHub and JIRA. Respond to webhook events in GitHub and perform actions in JIRA.

Requires self-hosting and access tokens for both services. Built using Node.js and packaged up into Docker.

## Features

-   Setup once in your organisation and configure each project using the `.github/github-jira.yml` project file.
-   Automatically creates, closes and reopens Jira cards when issues are created, closed or reopened.
-   Automatically creates & closes Jira cards when pull requests are created & closed / merged

## Configuration

GitHub-JIRA-Integration is a service which responds to GitHub webhook events.

### Hosting & Environment variables

GitHub-JIRA-Integration must be hosted at a publicly available endpoint in order for GitHub to supply it with events. It also requires specific environment variables to be available, either via an `.env` file or globally.

The following environment variables are required:

```
WEBHOOK_SECRET
GITHUB_TOKEN
JIRA_USERNAME
JIRA_TOKEN
JIRA_BASE_URL
```

### Setting up webhooks in GitHub

Now that your instance of GitHub-JIRA-Integration is up and running at a public location, add it as a new webhook to your repository.

Go to the repository **Settings > Webhooks > Add webhook** and enter the public URL of your service.

### Adding a configuration file to source control

Finally, your repository needs a configuration file. Create a new file at `.github/github-jira.yml`. This is where your repository-specific configuration lives.

An example `.github/github-jira.yml` file might look like this:

```yml
jira:
    projectId: 1
issueOpened:
    jiraIssueType: Bug
    epicLink:
        id: customfield_10001
        epicId: EPIC_ID
```

A single instance of the GitHub-JIRA-Integration connects your GitHub user account with your organisations' JIRA service, but each repository has its own configuration file and be linked to a different JIRA projects or workflows.
