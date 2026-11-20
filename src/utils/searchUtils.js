export function filterMessagesByAge(messages, days){
  if(!Array.isArray(messages))
    throw new TypeError("Messages must be an array.");

  if(!Number.isFinite(days) || days < 0)
    throw new RangeError("Days must be a non-negative number.");

  // Calculate the cutoff timestamp 

  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const cutoff = now - days * millisecondsPerDay; //? What is this equation again 

  // Return messages older than the cutoff 
  return messages.filter((message) => {
    const messageDate = new Date(message.date).getTime();
    if(Number.isNaN(messageDate))
      return false;


    return messageDate < cutoff;
  });
}
