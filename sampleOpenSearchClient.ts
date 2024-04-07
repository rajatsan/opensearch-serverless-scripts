import { SEARCH_INDEX_MAPPING, SEARCH_INDEX_NAME } from "./constants";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Client } from "@opensearch-project/opensearch";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";

// https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-clients.html#serverless-javascript
export const openSearchClient = new Client({
  ...AwsSigv4Signer({
    region: process.env["AWS_REGION"]!,
    service: "aoss",
    getCredentials: () => defaultProvider()(),
  }),
  node: process.env["COLLECTION_ENDPOINT"],
});

export const handler = async (event: any) => {
  console.log("SearchIndexCreatorLambda called with event", event);
  try {
    const indexExistsResponse = await openSearchClient.indices.exists({
      index: SEARCH_INDEX_NAME,
    });
    if (indexExistsResponse.statusCode === 200) {
      console.log("Search index already exists.");
      return;
    }

    console.log("Search index does not exist, creating");
    const createIndexResponse = await openSearchClient.indices.create({
      index: SEARCH_INDEX_NAME,
      body: SEARCH_INDEX_MAPPING,
    });

    console.log(
      `Event index creation status: ${
        createIndexResponse.statusCode
      }, body: ${JSON.stringify(createIndexResponse.body)}`
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
