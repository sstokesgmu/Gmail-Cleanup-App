import { listMessages, getMessage } from "../services/gmailServices";

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

    if(!sender.has(sender.email)) {
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
  return [...senders.values()].sort(
    (a,b) => 
  )
}
