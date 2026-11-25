import { parseSender } from "../utils/senderUtils.js";

const statistics = {
  initialEmailCount: 0,
  deletedCount: 0, 
  failedCount: 0,
  deletedBySender: new Map(),
  sessionStartedAt: null
};

//Initialize statistics when the application starts
export function initializeStatistics(messages){
  statistics.initialEmailCount = messages.length;
  statistics.deletedCount = 0;
  statistics.failedCount = 0;
  statistics.deletedBySender.clear();
  statistics.sessionStartedAt = new Date();
}

//Record successful and failed deletion

export function recordDeletion(messages, deletedIds, failedIds){
  statistics.deletedCount += deletedIds.length;
  statistics.failedCount += failedIds.length;

  const deletedIdSet = new Set(deletedIds);

  for (const message of messages){
    if(!deletedIdSet.has(message.id))
      continue;

    let sender;
    try{
      sender = parseSender(message.from);
    } catch {
      sender = { email: "Unknown"};
    }

    const email = sender.email;

    const currentCount = statistics.deletedBySender.get(email) || 0;

    statistics.deletedBySender.set(email, currentCount + 1);
  }
}

// Retrieve current session statistics 

export function getStatistics(){
  const remainingEmailCount = statistics.initialEmailCount - statistics.deletedCount;

  const cleanupPrecentage = statistics.initialEmailCount === 0 ? 0 : (statistics.deletedCount/statistics.initialEmailCount) * 100;

  return {
    initialEmailCount : statistics.initialEmailCount, 
    remainingEmailCount,
    deletedCount: statistics.deletedCount,
    failedCount: statistics.failedCount,
    cleanupPrecentage,
    sessionStartedAt: statistics.sessionStartedAt,

    deletedBySender: [...statistics.deletedBySender.entries()].map(([email,count])=> ({
      email,
      count
    })).sort((a,b) => b.count - a.count)
  }
}
