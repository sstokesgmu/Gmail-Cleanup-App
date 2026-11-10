import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";


export async function startMenu(gmailClient){
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



          // Next: retrieve messages using gmail 
          const messages = await listMessages(gmail);
          const senders = groubBySender(messages);

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
