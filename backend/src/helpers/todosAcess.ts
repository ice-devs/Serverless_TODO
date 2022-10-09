import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess{
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly groupsTable = process.env.GROUPS_TABLE,
        private readonly indexName = process.env.TODOS_CREATED_AT_INDEX){
        }

    async createTodo(Item: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.groupsTable,
            Item
        }).promise()
        return Item
    }

    async deleteTodo(userId:string, todoId:string) {
        await this.docClient.delete({
            TableName: this.groupsTable,
            Key:{
                userId,
                todoId
            }
        })
    }

    async getTodosForUser(userId:string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.groupsTable,
            IndexName: this.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId' : userId
            },
            ScanIndexForward:false
        }).promise()
        
        const items = result.Items
        return items as TodoItem[]
    }
    
    async updateTodo(userId: string, todoId: string, updatedTodo:TodoUpdate) {
        await this.docClient.update({
            TableName: this.groupsTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId' : todoId,
                ':name' : updatedTodo.name,
                ':dueDate' : updatedTodo.dueDate,
                ':done': updatedTodo.done
            }
        })
    }

    async userExists(user: string) {
        const result = await this.docClient.get({
            TableName: this.groupsTable,
            Key: {
              userId: user
            }
          }).promise()
        return !!result.Item
      }
}