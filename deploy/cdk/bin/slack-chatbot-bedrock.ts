#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import {SlackChatbotBedrockStack} from "../lib/slack-chatbot-bedrock-stack";
import {createConfig} from "../lib/config";

const app = new cdk.App();
const config = createConfig(app.node.tryGetContext("env") || process.env.ENV);

new SlackChatbotBedrockStack(app, "SlackChatbotBedrockStack", {
    env: config.env,
    stackName: config.stackName,
    config,
});
