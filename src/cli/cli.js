import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";

import { groupBySender } from "../utils/senderUtils.js";
import { mockMessages } from "../test/mockMessages.js";



export async function startMenu(gmailClient, {mockMode = false} = {}){
  const rl = readline.createInterface({input, output});
  

  try {
    let running = true;

    while (running) {
      console.log("========== Main Menu ======");
      console.log("1. List emails by sender");
      console.log("2. Exit");

      const choice = await rl.question("Choose an option: ");

      switch (choice.trim())
      {
        case "1":
          console.log("Loading emails ... ");

          if(!mockMode){
            console.log("Real Gmail retrieval is not implemented yet.");
            break;
          }



          // Next: retrieve messages using gmail 
          const messages = mockMessages;
          const senders = groupBySender(messages);

          console.table(
            senders.map(({name, email, count}) =>({
            name, email, count }))
          );

          break;
        case "2":
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
