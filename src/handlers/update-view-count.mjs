import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.RESUME_TABLE;
const viewCount = process.env.RESUME_TABLE_VIEW_COUNT;

export const putViewCountHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    console.info('received:', event);

    let params = {
        TableName: tableName,
        Key: { 'id': viewCount },
        UpdateExpression: 'set quantity = quantity + :q',
        ExpressionAttributeValues: { ':q': 1 },
        ReturnValues: 'UPDATED_NEW' // return updated value 
    };
    console.info('params:', params);

    let data;
    try {
        data = await ddbDocClient.send(new UpdateCommand(params));
        console.log("Success -  added or updated", data);
    } catch (err) {
        console.log("Error", err.stack);
    }

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*", // <-- should be bucket URL (e.g. https://s3.us-east-2.amazonaws.com) 
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(data?.Attributes)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
