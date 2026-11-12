

export async function viewSenderThreads(sender, rl)
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
    console.log("5. Return to sender list");
  

    const choice = await rl.question("Choose an option: ");

    
  }
}
