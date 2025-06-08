import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamodb = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(dynamodb);

export default dynamoDbClient;