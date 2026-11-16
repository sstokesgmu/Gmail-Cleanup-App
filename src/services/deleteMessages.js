export async function trashMessage(gmail, messageId){
  if(!messageId)
    throw new Error("Meesage ID is required");

  if (!gmail)
    throw new Error("Gmail client is not initalized");

  await gmail.users.messages.trash({
    userId: "me",
    id: messageId
  });

  return messageId; 
}

export async function trashMessages(gmail, messageIds){
  const deletedIds = [];
  const failedIds = [];

  for(const id of messageIds)
  {
    try{
      await trashMessage(gmail, id);
      deletedIds.push(id);
    } catch (e){
      console.error(`Failed to trahs ${id}: ${e.message}`);
      failedIds.push(id);
    }
  }
      return { deletedIds, failedIds };
}

