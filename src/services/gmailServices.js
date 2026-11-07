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
