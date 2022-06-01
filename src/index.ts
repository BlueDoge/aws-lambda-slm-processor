// Originally created by Elizabeth Clements
// License and copyright can be found in the LICENSE file or at the github (https://github.com/bluedoge/aws-lambda-slm-processor/)

import { APIGatewayProxyEventV2, APIGatewayEventRequestContextV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import sha1 from 'crypto-js/sha1';


const checkAndGrabEnvironment = async (): Promise<Array<string>> => {
	// this might be removed
	if(process.env.BLUEDOGE_DYNDB_ADDRESS === "")
	{
		throw new Error("Environment variable not found: BLUEDOGE_DYNDB_ADDRESS");
	}
	if(process.env.SECONDLIFE_MARKETPLACE_HASH === "")
	{
		throw new Error("Environment variable not found: SECONDLIFE_MARKETPLACE_HASH");
	}
	// this might be removed, as it has not been used, leaving for now
	if(process.env.SECONDLIFE_SELLER_KEY === "")
	{
		throw new Error("Environment variable not found: SECONDLIFE_SELLER_KEY");
	}
	let EnvArray = new Array<string>();
	EnvArray.push(process.env.BLUEDOGE_DYNDB_ADDRESS);
	EnvArray.push(process.env.SECONDLIFE_MARKETPLACE_HASH);
	EnvArray.push(process.env.SECONDLIFE_SELLER_KEY);
	return EnvArray;
}

const checkAndGrabMarketplaceHeaders = async(event: APIGatewayProxyEventV2): Promise<Array<string>> => {
	let MarketplaceHeaders = new Array<string>();
	MarketplaceHeaders.push(event.headers["X-ANS-Verify-Hash"]);
	return MarketplaceHeaders;
}

const checkAndGrabMarketplaceQueryData = async(event: APIGatewayProxyEventV2, MarketplaceSalt: string, MarketplaceHeaders: Array<string>): Promise<Array<string>> => {
	if(event.body === null || event.body === "" || event.body == null)
	{
		throw new Error("Query body not found!");
	}
	if(event.rawQueryString === null || event.rawQueryString === "" || event.rawQueryString == null)
	{
		throw new Error("Query string not found!");
	}
	const VerifyHash: string = MarketplaceHeaders[0];
	let QueryDataOut: Array<string> = new Array<string>();

	const ReceivedVerifyBin: string = event.body;
	const cookedHash = sha1(ReceivedVerifyBin + MarketplaceSalt);
	// const bIsValid: boolean = cookedHash.toString() === VerifyHash;
	if(cookedHash.toString() !== VerifyHash)
	{
		throw new Error("Invalid query: verify hash");
	}
	else
	{
		const SLM_Currency: string = event.queryStringParameters["Currency"];
		const SLM_Type: string = event.queryStringParameters["Type"];
		const SLM_PaymentGross: string = event.queryStringParameters["PaymentGross"];
		const SLM_PaymentFee: string = event.queryStringParameters["PaymentFee"];
		const SLM_PayerName: string = event.queryStringParameters["PayerName"];
		const SLM_PayerKey: string = event.queryStringParameters["PayerKey"];
		const SLM_ReceiverName: string = event.queryStringParameters["ReceiverName"];
		const SLM_ReceiverKey: string = event.queryStringParameters["ReceiverKey"];
		const SLM_MerchantName: string = event.queryStringParameters["MerchantName"];
		const SLM_MerchantKey: string = event.queryStringParameters["MerchantKey"];
		const SLM_TransactionID: string = event.queryStringParameters["TransactionID"];
		const SLM_ItemID: string = event.queryStringParameters["ItemID"];
		const SLM_ItemName: string = event.queryStringParameters["ItemName"];
		const SLM_InventoryName: string = event.queryStringParameters["InventoryName"];
		const SLM_Location: string = event.queryStringParameters["Location"];
		QueryDataOut.push(SLM_Currency);
		QueryDataOut.push(SLM_Type);
		QueryDataOut.push(SLM_PaymentGross);
		QueryDataOut.push(SLM_PaymentFee);
		QueryDataOut.push(SLM_PayerName);
		QueryDataOut.push(SLM_PayerKey);
		QueryDataOut.push(SLM_ReceiverName);
		QueryDataOut.push(SLM_ReceiverKey);
		QueryDataOut.push(SLM_MerchantName);
		QueryDataOut.push(SLM_MerchantKey);
		QueryDataOut.push(SLM_TransactionID);
		QueryDataOut.push(SLM_ItemID);
		QueryDataOut.push(SLM_ItemName);
		QueryDataOut.push(SLM_InventoryName);
		QueryDataOut.push(SLM_Location);
	}
	return QueryDataOut;
}


export const lambdaHandler = async (event: APIGatewayProxyEventV2, context: APIGatewayEventRequestContextV2): Promise<APIGatewayProxyResultV2> => {
	// this will throw errors where needed
	const EnvArray = await checkAndGrabEnvironment();
	const DatabaseAddress = EnvArray[0];
	const MarketplaceHash = EnvArray[1];
	const MarketplaceSeller = EnvArray[2];

	const MarketplaceHeaders = await checkAndGrabMarketplaceHeaders(event);

	const MarketplaceQueryData = await checkAndGrabMarketplaceQueryData(event, MarketplaceHash, MarketplaceHeaders);

	const SLM_Currency: string = MarketplaceQueryData[0];
	const SLM_Type: string = MarketplaceQueryData[1];
	const SLM_PaymentGross: string = MarketplaceQueryData[2];
	const SLM_PaymentFee: string = MarketplaceQueryData[3];
	const SLM_PayerName: string = MarketplaceQueryData[4];
	const SLM_PayerKey: string = MarketplaceQueryData[5];
	const SLM_ReceiverName: string = MarketplaceQueryData[6];
	const SLM_ReceiverKey: string = MarketplaceQueryData[7];
	const SLM_MerchantName: string = MarketplaceQueryData[8];
	const SLM_MerchantKey: string = MarketplaceQueryData[9];
	const SLM_TransactionID: string = MarketplaceQueryData[10];
	const SLM_ItemID: string = MarketplaceQueryData[11];
	const SLM_ItemName: string = MarketplaceQueryData[12];
	const SLM_InventoryName: string = MarketplaceQueryData[13];
	const SLM_Location: string = MarketplaceQueryData[14];
	
	let ddbClient = new DynamoDBClient({
		region: "us-west-2",
	});

	let ddbCommand = new PutItemCommand({
		TableName: "",
		Item: {
			"currency": {"S": SLM_Currency},
			"type": {"S": SLM_Type},
			"paymentGross": {"S": SLM_PaymentGross},
			"paymentFee": {"S": SLM_PaymentFee},
			"payerName": {"S": SLM_PayerName},
			"payerKey": {"S": SLM_PayerKey},
			"receiverName": {"S": SLM_ReceiverName},
			"receiverKey": {"S": SLM_ReceiverKey},
			"merchantName": {"S": SLM_MerchantName},
			"merchantKey": {"S": SLM_MerchantKey},
			"transactionId": {"N": SLM_TransactionID},
			"itemId": {"N": SLM_ItemID},
			"itemName": {"S": SLM_ItemName},
			"inventoryName": {"S": SLM_InventoryName},
			"location": {"S": SLM_Location},
		}
	});

	// *TODO: respond to how this is handled.
	await ddbClient.send(ddbCommand);

	// *TODO: don't blindly reply back, actually handle stuff.
	return {
		statusCode: 200,
		body: JSON.stringify({
			message: "ok"
		})
	};
};
