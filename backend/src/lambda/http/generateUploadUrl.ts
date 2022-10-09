import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

// AWS resources
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({ signatureVersion : 'v4' })

// Custom helper methods
// import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

// Environment variables
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const todoTable = process.env.TODOS_TABLE

// Handler function
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  // Validates if a user exist
  const validUser = await userExists(userId)

  // If a user does not exist, return an error
  if (!validUser) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'User does not exist'
      })
    }
  }
 
  // If a user exist, get a signedUrl
  const url = await createAttachmentPresignedUrl(todoId)

  // Return the signedUrl to the client
  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl : url
    })
  }
})
// Middleware for cors and httperrors
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

// Helper funtion to sign a url 
async function createAttachmentPresignedUrl(todoImageId : string){
  return s3.getSignedUrl('putObject', {
    Bucket : bucketName,
    Key : todoImageId,
    Expires : urlExpiration
  })
}

//Helper function to check if a user exist
async function userExists(user: string) {
  const result = await docClient
    .get({
      TableName: todoTable,
      Key: {
        userId: user
      }
    })
    .promise()

  console.log('Get group: ', result)
  return !!result.Item
}
