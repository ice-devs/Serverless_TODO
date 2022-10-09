import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
// import { ResourceClient } from '@ionic/cli/lib/http'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const parsedBody: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  const result = await createTodo (parsedBody, userId)

  const newItems = {
    todoId: result.todoId,
    createdAt: result.createdAt,
    name: result.name,
    dueDate: result.dueDate,
    attachmentUrl: result.attachmentUrl
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: newItems
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
