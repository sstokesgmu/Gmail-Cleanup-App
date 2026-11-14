import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";

import { mockMessages } from "../test/mockMessages.js";
import { listSenderMenu } from "../cli/senderMenu.js";


export async function startMenu(gmailClient, {mockMode = false} = {}){
  const rl = readline.createInterface({input, output});
  

  try {
    let running = true;

    while (running) {
      console.log("========== Main Menu ======");
      console.log("1. List emails by sender");
      console.log("2. Search emails");
      console.log("3. View Cleanup Statistics");
      console.log("4. Exit");

      const choice = await rl.question("Choose an option: ");

      switch (choice.trim())
      {
        case "1":
          console.log("Loading emails ... ");

          if(!mockMode){
            console.log("Real Gmail retrieval is not implemented yet.");
            break;
          }
          // Another Choice here allow the user to grab
          const messages = mockMessages;
          await listSenderMenu(messages, rl,gmailClient);
          break;
        case "2":
          console.log("Loading search bar ...");
        break;
        case "3":
          console.log("Loading cleanup statistics ...");
        break;
        case "4":
          console.log("Goodbye!");
          running = false;
          break;

        default:
          console.log("Invalid option.");
      }
    }
  } finally { 
    rl.close();
  }
}


