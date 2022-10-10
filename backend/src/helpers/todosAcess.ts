import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess{
    constructor(
        private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.TODOS_CREATED_AT_INDEX){
        }

    async createTodo(Item: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item
        }).promise()
        return Item
    }

    async deleteTodo(userId:string, todoId:string) {
        return await this.docClient.delete({
            TableName: this.todosTable,
            Key:{
                userId: userId,
                todoId: todoId
            }
        }).promise()
    }

    async getTodosForUser(userId:string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
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
        return await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId' : todoId,
                ':name' : updatedTodo.name,
                ':dueDate' : updatedTodo.dueDate,
                ':done': updatedTodo.done
            },
            ExpressionAttributeNames:{
                '#name': 'name'
            }
        }).promise()
    }

    async userExists(userId: string, todoId: string) {
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
              userId: userId,
              todoId: todoId
            }
          }).promise()
        return !!result.Item
    }
}