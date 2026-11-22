import { listMessages, getMessage } from "../services/gmailServices.js";

/**
 * Extract the sender's name and email 
 * address form a Gmail "From" header
 */
export function parseSender(from){
  if(typeof from !== "string" || !from.trim())
    throw new TypeError("Invalid sender Header");

  const text = from.trim();

  //Example: Amazon <store@example.com>
  const match = text.match(/^(.*?)\s*<([^<>\s]+@[^<>\s]+)>$/);
  if(match) {
    const name =  match[1].trim().replace(/^"|"$/g, "");

    const email = match[2].toLowerCase();

    return {
      name: name || email, 
      email,
    };
  }
  
  //Example: store@example.com 
  if(/^[^\s<>@]+@[^\s<>@]+$/.test(text))
    return {
      name:text, email: text.toLowerCase()
    };

    throw new Error(`Unable to parse sender: ${text}`);
}

/**
 * Group messages by sender email address.
 */

export function groupBySender(messages){
  const senders = new Map();

  
  for(const message of messages)
  {
    let sender;

    try {
      sender = parseSender(message.from);
    } catch (error) {
      console.warn(`Skipping message ${message.id}: ${error.message}`);
      continue;
    }

    if(!senders.has(sender.email)) {
      senders.set(sender.email, {
        name: sender.name, 
        email: sender.email, 
        count: 0,
        messages: []
      });
    }

    const group = senders.get(sender.email);

    group.count++;
    group.messages.push(message);
  }


  //Sort senders by the number of messages 
  let c = [...senders.values()].sort(
    (a,b) => b.count - a.count
  );
  return 
}


/**
 * Retrieve Gmail messages and group them by sender. 
 *
 * @param {object} gmail - Authenticated Gmail client 
 * @param {object} maxMessages - Maximum mesages to scan 
 * @returns {Promise<Array>} Grouped sender data 
 */

export async function getAllSenders(gmail, maxMessages = 1000){
  if (!Number.isInteger(maxMessages) || maxMessages < 1)
    throw new RangeError("maxMessages must be a positive integer.");
  
  const messages = [];
  let pageToken; 

  console.log("Scanning Gmail messages...");

  do {
    const remaining = maxMessages -  messages.length; //? We're going to be adding stuff 
    const page = await listMessages(gmail, {
      maxResults: Math.min(remaining, 100), pageToken
    });

    for(const item of page.messages){
      const message = await getMessage(gmail,item.id);

      message.push(message);
    } 

    console.log(`Scanned ${messages.length} messages.`);

    pageToken = page.nextPageToken;
  } while(pageToken && messages.length < maxMessages);

  //Organize all retrieved messages by sender 

  const senders = groupBySender(messages);
  console.log(`Found ${senders.length} unique senders.`);

  if(pageToken){
    console.log("Scan limit reached. Sender counts may be incomplete");
  }
  return senders;
}






