import {google} from "googleapis";


/*
 *Create an authenticated Gmail API client
 *
 *@param {import("google-auth-library").OAuth2Client} auth 
 */

export function createGmailClient(auth){
  if(!auth){
    throw new Error("Authentication client is required.");
  }

  return google.gmail({
    version: "v1",
    auth: auth
  });
}

/** 
 *  Retrieve information about the Gmail account. 
 */

export async function getProfile(gmail){
  const response = await gmail.users.getProfile({
    userId: "me"
  });

  return response.data;
}

/**
 * Retrieve a page of message IDs.
 * 
 * @param {object} gmail - Authenticated Gmail client
 * @param {object} options - Search configuration
 */

export async function listMessages(gmail, 
{
  maxResults = 100, 
  pageToken = undefined, 
  query = "-in:trash -in:spam -in:sent -in:drafts"
} = {}
){

  //Note: are we saying that max results is modifiable
  //Note: Why te range
  if(!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 500)
    throw new RangeError("maxResults must be between 1 and 500.");

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults, 
    pageToken, 
    q: query
  });

  return {
    messages: response.data.messages ?? [],
    nextPageToken: response.data.nextPageToken ?? null,
    resultSizeEstimate: response.data.resultSizeEstimate ?? 0
  };
}

/**
 * Retrieve message metadata using its Gmail ID.
 */

export async function getMessage(gmail, message_id){
  if(!message_id)
    throw new Error("A message ID is required");

  const response = await gmail.users.messages.get({
    userId: "me",
    id: message_id,
    format: "metadata",
    metadataHeaders: ["From", "Subject", "Date"]
  });

  const message = response.data;
  const headers =  message.payload?.headers ?? [];

  // Find a specific email header 
  const getHeader = (name) => {
    return headers.find(header => header.name.toLowerCase() === name.toLowerCase())?.value ?? "";
  };

  return {
    id: message.id,
    threadId: message.threadId, 
    from: getHeader("From"),
    subject: getHeader("Subject"),
    date: getHeader("Date"),
    snippet: message.snippet ?? "",
    labels: message.labelIds ?? []
  };
}
