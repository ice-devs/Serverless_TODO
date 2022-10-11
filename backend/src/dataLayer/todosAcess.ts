import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess{
    constructor(
        private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.TODOS_CREATED_AT_INDEX){
        }

    async createTodo(Item: TodoItem): Promise<TodoItem> {
        logger.info('Starting create todo item', {Item_name: Item.name})
        try {
            await this.docClient.put({
                TableName: this.todosTable,
                Item
            }).promise()

            logger.info('Todo item created successfully')
            return Item
        } catch (e) {
            logger.error('An error occurred, todo item was not created', { error: e.message })
        }
    }

    async deleteTodo(userId:string, todoId:string) {
        logger.info('Starting delete todo item', { userId : userId, todoId : todoId})
        try {
            const result = await this.docClient.delete({
                TableName: this.todosTable,
                Key:{
                    userId: userId,
                    todoId: todoId
                },
            }).promise()
            logger.info('Todo item deleted successfully')
            return result
        } catch (e) {
            logger.error('An error occurred, todo item was not deleted', { error: e.message })
        }
    }

    async getTodosForUser(userId:string): Promise<TodoItem[]> {
        logger.info('Starting get todo item', { userId : userId })
        try {
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
    
            logger.info('Todo items fetched successfully')
            return items as TodoItem[]
        } catch (e) {
            logger.error('An error occurred while trying to fetch todo items', { error: e.message })
        }
    }
    
    async updateTodo(userId: string, todoId: string, updatedTodo:TodoUpdate) {
        logger.info('Starting update todo item', { userId : userId, todoId : todoId })
        try {
            const result = await this.docClient.update({
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
    
            logger.info('Todo item updated successfully')
            return result
        } catch (e) {
            logger.error('An error occurred while trying to update todo item', { error: e.message })
        }
    }

    async userExists(userId: string, todoId: string) {
        logger.info('Verifying if user exists', { userId : userId })
        try {
            const result = await this.docClient.get({
                TableName: this.todosTable,
                Key: {
                  userId: userId,
                  todoId: todoId
                }
            }).promise()
    
            logger.info('Verification completed successfully, user exists')
            return !!result.Item
        } catch (e) {
            logger.error(' Verification failed, user does not exist', { error: e.message })
        }
    }
}