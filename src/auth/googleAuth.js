import {authenticate as googleLogin} from "@google-cloud/local-auth";
import {google} from "googleapis";
import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";

//Gmail Permissions
const Scopes = [ 
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


async function loadSavedCredentials()
{
  try {
    
  } catch (error) {
    
  }
}
