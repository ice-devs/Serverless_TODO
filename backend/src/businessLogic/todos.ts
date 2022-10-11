import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
// import * as createError from 'http-errors'

const uuid = require('uuid')
const bucketName = process.env.ATTACHMENT_S3_BUCKET

// TODO: Implement businessLogic
const todosAcess = new TodosAccess
const attachmentUtils = new AttachmentUtils

export async function createTodo (parsedBody: CreateTodoRequest, userId:string): Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const attachmentUrl = 'https://'+bucketName+'.s3.amazonaws.com/'+todoId
    return await todosAcess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: createdAt,
        name: parsedBody.name,
        dueDate: parsedBody.dueDate,
        done: false,
        attachmentUrl: attachmentUrl
    })
}

export async function deleteTodo (userId: string, todoId:string) {
    return await todosAcess.deleteTodo(userId, todoId)
}

export async function getTodosForUser(userId:string) {
    return await todosAcess.getTodosForUser(userId)
}

export async function updateTodo(userId:string, todoId:string, updatedTodo:UpdateTodoRequest) {
    return await todosAcess.updateTodo(userId, todoId, {
        name: updatedTodo.name,
        dueDate: updatedTodo.dueDate,
        done: updatedTodo.done
    })
}

export async function createAttachmentPresignedUrl(todoId: string) {
    return await attachmentUtils.createAttachmentPresignedUrl(todoId)
}

// Additional helper function to check if a user exists
export async function userExists(userId: string, todoId:string) {
    return await todosAcess.userExists(userId, todoId)
}