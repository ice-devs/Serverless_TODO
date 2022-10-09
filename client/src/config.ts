const apiId = '...'        // API Gateway id, this value can be seen on the terminal after deploying the backend successfully
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',          // Domain from Auth0
  clientId: '...',        // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
