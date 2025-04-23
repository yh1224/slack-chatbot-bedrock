import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as imagedeploy from "cdk-docker-image-deployment";
import {Config} from "./config";

type SlackChatbotBedrockStackProps = cdk.StackProps & {
    readonly config: Config;
}

export class SlackChatbotBedrockStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: SlackChatbotBedrockStackProps) {
        super(scope, id, props);

        const config = props.config;

        const repository = new ecr.Repository(this, "Repository", {
            emptyOnDelete: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const imageDeployment = new imagedeploy.DockerImageDeployment(this, "ImageDeployment", {
            source: imagedeploy.Source.directory("../../src"),
            destination: imagedeploy.Destination.ecr(repository, {tag: "latest"}),
        });

        // Lambda Function
        const slackChatbotFunction = new lambda.DockerImageFunction(this, "SlackChatbotFunction", {
            architecture: lambda.Architecture.ARM_64,
            code: lambda.DockerImageCode.fromEcr(repository, {tag: "latest"}),
            environment: {
                LOG_LEVEL: config.logLevel || "INFO",
                SLACK_SIGNING_SECRET: config.slackSigningSecret,
                SLACK_BOT_TOKEN: config.slackBotToken,
                SLACK_BOT_MEMBER_ID: config.slackBotMemberId,
                PROMPT: config.prompt || "",
                BEDROCK_SETTINGS: JSON.stringify(config.bedrock),
            },
            logRetention: logs.RetentionDays.ONE_WEEK,
            timeout: cdk.Duration.minutes(1),
        });
        slackChatbotFunction.node.addDependency(imageDeployment);
        slackChatbotFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream",
                // "bedrock:Retrieve",
            ],
            resources: ["*"],
        }));
        // for Lazy listener
        const invokeFunctionPolicy = new iam.Policy(this, "InvokeFunctionPolicy", {
            statements: [
                new iam.PolicyStatement({
                    actions: ["lambda:InvokeFunction"],
                    resources: [slackChatbotFunction.functionArn],
                }),
            ],
        });
        invokeFunctionPolicy.attachToRole(slackChatbotFunction.role!);

        if (config.domainName && config.certificateArn) {
            // use API Gateway
            const api = new apigateway.LambdaRestApi(this, "Api", {
                restApiName: `${config.stackName}-api`,
                handler: slackChatbotFunction,
            });
            const apiGatewayDomainName = new apigateway.DomainName(this, "ApiGatewayDomainName", {
                certificate: certificatemanager.Certificate.fromCertificateArn(this, "Certificate", config.certificateArn),
                domainName: config.domainName,
            });
            apiGatewayDomainName.addBasePathMapping(api, {});
        } else {
            // use Lambda Function URL
            const apiUrl = slackChatbotFunction.addFunctionUrl({
                authType: lambda.FunctionUrlAuthType.NONE,
            });
            new cdk.CfnOutput(this, "ApiUrl", {
                value: apiUrl.url,
            });
        }
    }
}
