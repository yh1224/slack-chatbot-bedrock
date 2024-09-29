# slack-chatbot-bedrock

Slack chatbot using Amazon Bedrock.

## Prerequisite

- [AWS CDK](https://aws.amazon.com/jp/cdk/)

## How to deploy

### 1. Create Slack app

Add an app with the following details at https://api.slack.com/apps.

- OAuth & Permissions
  - Scopes
    - `app_mentions:read`
    - `channels:history`
    - `chat:write`
    - `groups:history`
    - `im:history`
    - `mpim:history`
- Event Subscriptions
  - Request URL: `{BaseUrl}/slack/events`
  - Subscribe to bot events
    - `message.channels`

Notes

- BaseUrl specifies the base URL of the API you are about to deploy.
- Set the "Signing Secret" displayed in Basic Information and the "Bot User OAuth Token" generated in OAuth & Permissions as environment variables for the app.
- Event Subscriptions cannot be set until the API responds, so it will be set after deployment.

### 2. Deploy the app to AWS

The following are the operation steps in the deploy/cdk/ directory.

 1. Install libraries for CDK

    ```shell
    npm install
    ```

 2. Create a deployment configuration file (config.yaml)

    Refer to the comments in config.example.yaml for settings.

 3. Execute CDK bootstrap (only for the first deployment with CDK)

    ```shell
    cdk bootstrap
    ```

 4. Deploy

    ```shell
    cdk deploy
    ```

### 3. Install the app in a Slack channel

Add Slack app from Integrations > Apps > Add Apps in the channel settings.
