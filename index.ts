import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { IncomingMessage } from "http";
import { createSignedHttpRequest } from "./createSignedHttpRequest";
import { samplePayload } from "./sampleDocument";
import PromiseThrottle from "promise-throttle";
const nodeHttpHandler = new NodeHttpHandler();

const readDocuments = async (
  readCount: number,
  readStart: number,
  concurrency: number
) => {
  console.log("Running read handler...");

  var promiseThrottle = new PromiseThrottle({
    requestsPerSecond: concurrency, // up to "concurrency" request per second
    promiseImplementation: Promise, // the Promise library you are using
  });

  const promises = [];
  for (let i = readStart; i < readStart + readCount; i++) {
    promises.push(
      promiseThrottle.add(readSingleDocument.bind(this, i.toString()))
    );
  }

  return Promise.all(promises);
};

const writeDocuments = async (
  writeCount: number,
  writeStart: number,
  concurrency: number
) => {
  console.log("Running write handler...");

  var promiseThrottle = new PromiseThrottle({
    requestsPerSecond: concurrency, // up to "concurrency" request per second
    promiseImplementation: Promise, // the Promise library you are using
  });

  const promises = [];
  for (let i = writeStart; i < writeStart + writeCount; i++) {
    promises.push(
      promiseThrottle.add(writeSingleDocument.bind(this, i.toString()))
    );
  }

  return Promise.all(promises);
};

const readSingleDocument = async (docId: string) => {
  const hostname = "xyz.us-west-2.aoss.amazonaws.com";
  const signedHttpRequest = await createSignedHttpRequest({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      host: hostname,
    },
    hostname,
    path: `/movies-index/_doc/${docId}`,
    service: "aoss",
  });
  console.log("reading document with id", docId);

  try {
    const res = await nodeHttpHandler.handle(signedHttpRequest);
    console.log("got response", res);
    return new Promise((resolve, reject) => {
      const incomingMessage = res.response.body as IncomingMessage;
      console.log("Got http response status", res.response.statusCode);
      let body = "";
      incomingMessage.on("data", (chunk) => {
        console.log("read document wiht id (data)", docId);
        body += chunk;
      });
      incomingMessage.on("end", () => {
        console.log("read document wiht id (end)", docId);
        resolve(body);
      });
      incomingMessage.on("error", (err) => {
        console.log(
          `got error while reading document with id: ${docId}. The error is: ${err}`
        );
        reject(err);
      });
    });
  } catch (err) {
    console.error("Error:");
    console.error(err);
  }
};

// Handler to update documents
const writeSingleDocument = async (docId: string) => {
  const body = JSON.stringify(samplePayload);
  const hostname = "xyz.us-west-2.aoss.amazonaws.com";
  const signedHttpRequest = await createSignedHttpRequest({
    method: "PUT",
    body,
    headers: {
      "Content-Type": "application/json",
      host: hostname,
    },
    hostname,
    path: `/movies-index/_doc/${docId}`,
    service: "aoss",
  });
  console.log("writing document wiht id", docId);

  try {
    const res = await nodeHttpHandler.handle(signedHttpRequest);
    return new Promise((resolve, reject) => {
      const incomingMessage = res.response.body as IncomingMessage;
      console.log("Got http response status", res.response.statusCode);
      let body = "";
      incomingMessage.on("data", (chunk) => {
        console.log("wrote document wiht id (data)", docId);
        body += chunk;
      });
      incomingMessage.on("end", () => {
        console.log("wrote document wiht id (end)", docId);
        resolve(body);
      });
      incomingMessage.on("error", (err) => {
        console.log(
          `got error while writing document with id: ${docId}. The error is: ${err}`
        );
        reject(err);
      });
    });
  } catch (err) {
    console.error("Error:");
    console.error(err);
  }
};

export const handler = async (input: {
  type: "write" | "read";
  count: number;
  start: number;
  concurrency: number;
}) => {
  console.log("Running handler...");
  console.log("Got input", input);

  if (input.type === "write") {
    await writeDocuments(input.count, input.start, input.concurrency);
  } else {
    await readDocuments(input.count, input.start, input.concurrency);
  }
};
