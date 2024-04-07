- This is a basic script to load-test OpenSearch Serverless. It has simple code to send a signed-request to OpenSearch Serverless.
- I tested by running this in an AWS Lambda function. To do this, run `npx tsc && zip -r my_deployment_package.zip .` to create a zip of the code. Then upload the zip file in the AWS Lambda function console and test the lambda with sample payload. Sample payload:
  - ```
    {
    	type: "write",   // "write" or "read", to load-test writing or reading documents
      	count: 10,       // Number of documents to write
      	start: 1,        // Id to start writing with
      	concurrency: 10, // Number of concurrent requests to send; this isn't fully accurate and depends on various factors including how much concurrency your lambda function can support
    }
    ```
- The main code is defined in `index.ts`.
- An alternative script to query OpenSearch Serverless is in `sampleOpenSearchClient.ts`. This script also sends signed requests to OpenSearch Serverless.
