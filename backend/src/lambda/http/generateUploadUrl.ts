import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createAttachmentPresignedUrl, userExists } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  // Validates if a user exist, so as to prevent just anyone from putting objects in our s3 bucket
  const validUser = await userExists(userId, todoId)

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
 
  // If a user exist, go ahead to generate a signedUrl
  const url = await createAttachmentPresignedUrl(todoId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl : url
    })
  }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
 )
