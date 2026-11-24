import { trashMessages } from "../services/deleteMessages.js";

async function getMessageIndex(messages, rl) {
  const input = await rl.question("Enter message index: ");
  const index = Number(input);

  if(input.trim() === "" || !Number.isInteger(index) || index < 0 || index >= messages.length){
    console.log("Invalid message index.");
    return null;
  }
  return index; 
}


export async function searchResultsMenu(results, rl, gmail){
  let isRunning = true;

  let messages = [...results];

  const selectedMessagesIds = new Set();

  while (isRunning){
    console.log("\n=================== Search Results ===============");

    console.log(`Found ${messages.length} emails`);
    console.log(`Selected ${selectedMessagesIds.size}`);

    console.table(
      messages.map((message, index) => ({
        index, from: message.from, subject: message.subject || "(No Subject)",
        date: message.date || "Unknown", selected: selectedMessagesIds.has(message.id) ? "Yes" : "No"
      }))
    );
    
    console.log("1. View Message");
    console.log("2. Select / deselect message");
    console.log("3. Select all messages"); 
    console.log("4. View selected messages");
    console.log("5. Clear selection");
    console.log("6. Delete selected messages");
    console.log("7. Return to search menu");

    const choice = await rl.question("Choose an option");

    switch(choice.trim()){
      case "1": {
        const index = await getMessageIndex(messages, rl);

        if(index === null) break;

        const message = messages[index];


        console.log("\n========== Message Details ==========");
        console.log(`ID: ${message.id}`);
        console.log(`From: ${message.from}`);
        console.log(`Subject: ${message.subject || "(No Subject)"}`);
        console.log(`Date: ${message.date || "Unknown"}`);
        console.log(`\n${message.body || message.snippet || "No content availabel"}`);

        await rl.question("\nPress Enter to continue ...");
        break;
      }
      case "2":
        const index = await getMessageIndex(messages, rl);

        if(index === null) break;

        const messageId = messages[index].id;

        if(selectedMessagesIds.has(messageId)){
          selectedMessagesIds.delete(messageId);
          console.log("Message deselected");
        } else {
          selectedMessagesIds.add(messageId);
          console.log("Message selected.");
        }
        break;
      case "3":{
        for(const message of messages){
          selectedMessagesIds.add(message.id);
        }
        console.log(`${selectedMessagesIds.size} messages selected.`);
        break;
        }
      case "4":{
        const selectedMessages = messages.filter(message => selectedMessagesIds.has(message.id));

        if(selectedMessages.length === 0){
          console.log("No messages selected.");
          break;
        }

        console.log("\n============ Selected Messages ==================");
        console.table(
          selectedMessages.map(message => ({
            id: message.id,
            from: message.from, 
            subject: message.subject || "(No Subject)",
            date: message.date || "Unknown"
          }))
        );

        await rl.question("\nPress Enter to continue")

        break;
      }
      case "5":
        selectedMessagesIds.clear();
        console.log("Selection cleared.");
        break; 
      case "6":
        break;
      case "7":
        isRunning = false; 
        break;
      default:
        console.log("Invalid option.");
        break;
    }
  }
  
}
