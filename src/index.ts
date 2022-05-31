// Originally created by Elizabeth Clements
// License and copyright can be found in the LICENSE file or at the github (https://github.com/bluedoge/aws-lambda-slm-processor/)

import express from 'express';
import { APIGatewayProxyEventV2, APIGatewayEventRequestContextV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient, BatchExecuteStatementCommand } from "@aws-sdk/client-dynamodb";

const router = express.Router();

router.use((req, res, next) => {
	next();
});

const checkEnvironment = async (): Promise<Array<string>> => {
	if(process.env.BLUEDOGE_DYNDB_ADDRESS === "")
	{
		throw new Error("Environment variable not found: BLUEDOGE_DYNDB_ADDRESS");
	}
	if(process.env.SECONDLIFE_MARKETPLACE_HASH === "")
	{
		throw new Error("Environment variable not found: SECONDLIFE_MARKETPLACE_HASH");
	}
	// this might be removed
	if(process.env.SECONDLIFE_SELLER_KEY === "")
	{
		throw new Error("Environment variable not found: SECONDLIFE_SELLER_KEY");
	}
	let EnvArray = new Array<string>();
	EnvArray.push(process.env.BLUEDOGE_DYNDB_ADDRESS, process.env.SECONDLIFE_MARKETPLACE_HASH, process.env.SECONDLIFE_SELLER_KEY);
	return EnvArray;
}


export const lambdaHandler = async (event: APIGatewayProxyEventV2, context: APIGatewayEventRequestContextV2): Promise<APIGatewayProxyResultV2> => {
	// this will throw errors where needed
	const EnvArray = await checkEnvironment();
	const DatabaseAddress = EnvArray[0];
	const MarketplaceHash = EnvArray[1];
	const MarketplaceSeller = EnvArray[2];
	
	let DynamoDB = new DynamoDBClient({
		region: "us-west-2",
		credentials: null

	});

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: "ok"
		})
	};
};
