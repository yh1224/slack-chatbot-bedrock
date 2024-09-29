# slack-chatbot-bedrock

Amazon Bedrock を使用した Slack チャットボットです。

## Prerequisite

- [AWS CDK](https://aws.amazon.com/jp/cdk/)

## How to deploy

### 1. Slack アプリを作成する

https://api.slack.com/apps にて以下の内容でアプリを追加します。

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

補足

- BaseUrl はこれからデプロイする API のベース URL を指定します。
- Basic Information に表示された「Signing Secret」および OAuth & Permissions にて生成した「Bot User OAuth Token」をアプリの環境変数に設定します。
- Event Subscriptions は API が応答しないと設定できないため、デプロイ後に設定します。

### 2. アプリを AWS へデプロイする

以下は deploy/cdk/ ディレクトリ配下での操作手順です。

 1. CDK 用のライブラリをインストール

    ```shell
    npm install
    ```

 2. デプロイ設定ファイル (config.yaml) を作成

    config.example.yaml のコメントを参考に設定します。

 3. CDK 用のブートストラップを実行 (CDK による初回デプロイ時のみ)

    ```shell
    cdk bootstrap
    ```

 4. デプロイ

    ```shell
    cdk deploy
    ```

### 3. Slack チャネルにアプリをインストールする

チャネル設定の Integrations > Apps > Add Apps から、Slack アプリを追加します。
