export async function trashMessage(gmail, messageId){
  if(!messageId)
    throw new Error("Message ID is required");

  // NEW: Handle mock mode 
  if(process.env.MOCK_MODE === "true"){
    console.log(`[MOCK] Trash message: ${messageId}`);
    return messageId;
  }

  // Real Gmail API 
  if(!gmail)
    throw new Error("Gmail client is not initialized");
  
  await gmail.users.messages.trash({
    userId: "me", id: messageId 
  });

  return messageId 
}

export async function trashMessages(gmail, messageIds){
  const deletedIds = [];
  const failedIds = [];

  for(const id of messageIds){
    try{
      await trashMessage(gmail, id);
      deletedIds.push(id);
    } catch(e){
      console.error(`Failed to trash ${id}: ${e.message}`);
      failedIds.push(id);
    }
  }

  return { deletedIds, failedIds};
}
