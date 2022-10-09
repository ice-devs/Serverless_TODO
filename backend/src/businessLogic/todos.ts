const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

export async function createTodo(userId:string, newItems) {
    const Item = {
        userId,
        newItems
    }
    await docClient.put({
        TableName: groupsTable,
        Item
    })
}
