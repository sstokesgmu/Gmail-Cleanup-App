import {groupBySender} from "../utils/senderUtils.js";

export async function listSenderMenu(messages, rl)
{
  
  let isRunning = true;
  const senders = groupBySender(messages);
  const numberOfSenders = senders.length; 
    while(isRunning)
    {
      console.log("========= List of Senders ==========");
      console.table(
        senders.map(({name, email, count}) =>
        ({name, email, count}))
      );

      console.log(`Number of senders: ${numberOfSenders}`);
      console.log("1. Pick a sender by index");
      console.log("2. Return to main menu");
      const choice = await rl.question("Choose an option: ");
  
      switch (choice.trim())
      {
        case "1": 
          const input = await rl.question ("Enter sender index: ");
          const index = Number(input);

          if(!Number.isInteger(index) || 
              index < 0 || index >= numberOfSenders || 
              input.trim() === "")
          {
            console.log("Invalid sender index.");
            break;
          }
          //Call to list full email and messages 
        break;
        case "2":
          isRunning = false;
        break;
        default: 
          console.log("Invalid option. Try again.");
      }
    }
}
