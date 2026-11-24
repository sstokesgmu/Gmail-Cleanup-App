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


export function filterMessagesBySender(messages, query) {
  if (!Array.isArray(messages)) {
    throw new TypeError("Messages must be an array.");
  }

  if (typeof query !== "string") {
    throw new TypeError("Search query must be a string.");
  }

  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) {
    return [];
  }

  return messages.filter((message) => {
    const sender = message.from ?? "";

    return typeof sender === "string" &&
      sender.toLowerCase().includes(searchTerm);
  });
}


export function filterMessagesByCategory(messages, category) {
  if (!Array.isArray(messages)) {
    throw new TypeError("Messages must be an array.");
  }

  if (typeof category !== "string") {
    throw new TypeError("Category must be a string.");
  }

  const searchCategory = category.trim().toLowerCase();

  if (!searchCategory) {
    return [];
  }

  return messages.filter((message) => {
    const messageCategory = message.category ?? "";

    return typeof messageCategory === "string" &&
      messageCategory.trim().toLowerCase() === searchCategory;
  });
}

export function applySearchFilters(messages, filters){
  let results = messages;

  if(filters.sender){
    results = filterMessagesBySender(results, filters.sender);
  }

  if(filters.olderThanDays !== undefined)
  {
    results = filterMessagesByAge(results, filters.olderThanDays);
  }

  if(filters.category){
    results = filterMessagesByCategory(results, filters.category);
  }

  return 
}
