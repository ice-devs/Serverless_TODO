# Serverless TODO

A simple TODO application that allows authenticated users of the application to create, delete and update todo items, it also allows users to upload images for individual todo items. This application is built using;
- Serverless framework script that creates
  - AWS Cloudformation template which spins up AWS resouces such as Amazon S3 Bucket, DynamoDb table
  - AWS APIGateway service
  - AWS Lambda funtions
  - S3 bucket & IAM policies  
- React 
  -  Frontend
- Auth0
  - Authenticating users

## Functionality of the application

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

## Prerequisites

* <a href="https://aws.amazon.com/" target="_blank">AWS account</a>
* <a href="https://manage.auth0.com/" target="_blank">Auth0 account</a>
* <a href="https://github.com" target="_blank">GitHub account</a>
* <a href="https://nodejs.org/en/download/package-manager/" target="_blank">NodeJS</a> version up to 12.xx 
* Serverless 
   * Create a <a href="https://dashboard.serverless.com/" target="_blank">Serverless account</a> user
   * Install the Serverless Framework’s CLI. Refer to the <a href="https://www.serverless.com/framework/docs/getting-started/" target="_blank">official documentation</a> for more help.

   ```bash
   npm install -g serverless
   serverless --version
   ```
   * Login and configure serverless to use the AWS credentials 
   ```bash
   # Login to your dashboard from the CLI. It will ask to open your browser and finish the process.
   serverless login
   # Configure serverless to use the AWS credentials to deploy the application
   # You need to have a pair of Access key (YOUR_ACCESS_KEY_ID and YOUR_SECRET_KEY) of an IAM user with Admin access permissions
   sls config credentials --provider aws --key YOUR_ACCESS_KEY_ID --secret YOUR_SECRET_KEY --profile serverless
   ```
## Installation & Usage
Clone the git repo
```
git clone https://github.com/ice-devs/Project-04-Serverless-App.git
```

- ### Backend
To deploy an application run the following commands:
```
cd backend
npm install
sls deploy -verbose
```

- ### Authentication
To implement authentication in your application, you would have to create an Auth0 application and set the callbackUrl then copy "domain", "client id", and "callback url" values to the `client/src/config.ts` file in the `client` folder. We recommend using asymmetrically encrypted JWT tokens.

Also go to the application dashboard, click on advanced settings > Endpoints then copy the "JSON Web Key set" value under OAauth

- ### Frontend
To run a client application first edit the `client/src/config.ts` file to set correct parameters.
```ts
const apiId = '...' // API Gateway id, this value can be seen on the terminal after deploying the backend successfully
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```
And then run the following commands:
```
cd client
npm install
npm run start
```
This should start a development server with the React application that will interact with the serverless TODO application.

The `client` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application to use the API endpoint and Auth0 configuration:
