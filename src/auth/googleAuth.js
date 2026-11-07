import {authenticate as googleLogin} from "@google-cloud/local-auth";
import {google} from "googleapis";
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";

//Gmail Permissions
const SCOPES = [ 
  "https://www.googleapis.com/auth/gmail.readonly"
];

// File Locations 
const CREDENTIALS_PATH = path.join (
  process.cwd(),
  "credentials.json"
);

const TOKEN_PATH = path.join (
  process.cwd(), 
  "token.json"
);

// Attempt to load previously saved credentials

async function loadSavedCredentials(){
  try {
    const content = await readFile(TOKEN_PATH, "utf8");
    const credentials = JSON.parse(content);

    return google.auth.fromJSON(credentials);
    
  } catch (error) {
    if(error.code == "ENOENT")
      return null

    console.error("Loading Error", error.message);
    console.error("Stack Trace", error.stack);
    process.exitCode = 1;
  }
}

// Save credentials after successful authentication 

async function saveCredentials(client){
  const content = await readFile(CREDENTIALS_PATH, "utf8");

  const keys = JSON.parse(content);
  const key = keys.installed ?? keys.web; //? What are these Properties
  
  if(!key){
    throw new Error("Invalid OAuth crednetials file.");
  }

  const payload = {
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token
  };

  if(!payload.refresh_token) {
    throw new Error("No refresh token was returned.");
  }

  await writeFile(
    TOKEN_PATH,
    JSON.stringify(payload, null, 2),
    {mode: 0o600}
  );
}

//Authenticate the user with google
export async function authenticate(){
  // Check if we already have saved credentials 

  let client = await loadSavedCredentials();

  if(client){
    console.log("Using saved Google credentials.");
    return client;
  }

  console.log("Opening Google authentication ...");

  // Start browser-based OAuth login 
  client = await googleLogin({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH
  });

  // Save credentials for future sessions 
  await saveCredentials(client);

  console.log("Authentication completed.");
  return client;
}
