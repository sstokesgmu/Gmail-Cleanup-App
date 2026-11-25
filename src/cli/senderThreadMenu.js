import { trashMessages } from "../services/deleteMessages.js";
import { recordDeletion } from "../services/statisticsService.js";

export async function viewSenderThreads(sender, rl, gmail)
{
  let isRunning = true;

  // Work with the messages belonging to this sender
  const messages = sender.messages;

  //Store message IDs selected for deletion 

  const selectedMessageIds = new Set();

  while(isRunning){
    console.log(`\n====== ${sender.name} Emails ==========`);

    console.log(`Sender: ${messages.length}`);
    console.log(`Total Messages: ${messages.length}`);

    console.table(
      messages.map((message, index) => ({
      index,
      subject: message.subject ?? "(No Subject)",
      date: message.date ?? "Unknown", 
      selected: selectedMessageIds.has(message.id)
      }))
    );

    console.log("\n1. View message");
    console.log("2. Select message for deletion");
    console.log("3. View selected messages");
    console.log("4. Clear selection");
    console.log("5. Trash selected messages");
    console.log("6. Return to sender list");
  

    const choice = await rl.question("Choose an option: ");
    
    switch(choice.trim()){
      case "1": {
        const input = await rl.question("Enter message index: ");
        const index = Number(input);

        if(input.trim() === "" ||
        !Number.isInteger(index) || 
        index < 0 || index >= messages.length
        ){
          console.log("Invalid message index");
          break;
        }  

        const message = messages[index];

        console.log("\n============= Message Details ================");
        console.log(`ID: ${message.id}`);
        console.log(`From: ${message.from}`);
        console.log(`Subject: ${message.subject ?? "(No Subject)"}`);
        console.log(`Date: ${message.date ?? "Unknown"}`);
        console.log(`Body: ${message.body ?? "(No Body)"}`);

        break;
      }

      case "2": {
        const input = await rl.question("Enter message index: ");
        const index = Number(input);

        if(input.trim() === "" || !Number.isInteger(index) || index < 0 
        || index >= messages.length){
          console.log("Invalid message index.");
          break;
        }

        const message = messages[index];
        if(selectedMessageIds.has(message.id)) {
          selectedMessageIds.delete(message.id);
          console.log("Message removed from selection.");
        } else {
          selectedMessageIds.add(message.id);
          console.log("Message selected for deletion.");
        }
        break;
      }

      case "3": {
        const selectedMessages = messages.filter(message => 
          selectedMessageIds.has(message.id));

        console.log("\n========== Selected Messages =========");
        console.table(
          selectedMessages.map(message => ({
            id: message.id,
            subject: message.subject, 
            date: message.date
          }))
        );

        console.log(`${selectedMessages.length} messages selected. `);

        break;
      }

      case "4": {
        selectedMessageIds.clear();
        console.log("Selection cleared.");
        break;
      }

      case "5": {
        if(selectedMessageIds.size === 0){
          console.log("No messages selected.");
          break;
        }

        console.log(`You selected ${selectedMessageIds.size} messages for deletion.`);

        const confirm = await rl.question("Move these messages to Trash? (y/n)");

        if(confirm.trim().toLowerCase() !== "y"){
          console.log("Deletion cancelled.");
          break;
        }

        const { deletedIds, failedIds} = await trashMessages(gmail, [...selectedMessageIds]);

        recordDeletion(messages,deletedIds,failedIds);

        //Remove successfully trashed messages from the local list        
        const deletedSet = new Set(deletedIds);

        for(let i = messages.length - 1; i >= 0; i--){
          if(deletedSet.has(messages[i].id))
            messages.splice(i,1);
        }

        // Clear only successfully deleted IDs 
        for(const id of deletedIds)
          selectedMessageIds.delete(id);

        sender.count = messages.length; 

        console.log(`Successfully trashed: ${deletedIds.length}`);
        console.log(`Failed ${failedIds.length}`);

        break;
      }

      case "6": {
        isRunning = false;
        break;
      }

      default: 
        console.log("Invalid option.");
    }
  }
}

