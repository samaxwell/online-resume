import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.RESUME_TABLE;
const viewCount = process.env.RESUME_TABLE_VIEW_COUNT;

export const getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  console.info('received:', event);

  let id = event.pathParameters.id;
  if (id !== viewCount) {
    throw new Error('trying to view unavailable db field [' + id + ']');
  }

  let params = {
    TableName: tableName,
    Key: { id: id },
  };

  console.info('params:', params);

  let data;
  try {
    data = await ddbDocClient.send(new GetCommand(params));
  } catch (err) {
    console.log("Error", err);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(data.Item)
  };

  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}