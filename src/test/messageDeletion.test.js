import test from "node:test";
import assert from "node:assert/strict";


import { trashMessages, trashMessage } from "../services/deleteMessages.js"

import { groupBySender } from "../utils/senderUtils.js";
import { mockMessages } from "./mockMessages.js";


//Create indapendent test data and a minimal mock of the Gmail Trash Operation
function setup() {
  const messages = structuredClone(mockMessages);
  const failedIds = new Set();

  const gmail = {
    users: {
      messages: {
        trash: async ({ id }) => {
          if(failedIds.has(id)) 
            throw new Error("Simulated API Failure");

          const index = messages.findIndex(message => message.id === id);

          if(index === -1)
            throw new Error(`Message ${id} not found`);

          messages.splice(index,1);
          return {data: { id }};
        }
      }
    }
  };

  return {gmail, messages, failedIds};
}

// Test 1: Delete a single message 
test("Trash a single message", async () => {
  const { gmail, messages } = setup();

  const deletedId = await trashMessage(gmail, "1");

  assert.equal(deletedId, "1");
  assert.equal(messages.length, 29);

  assert.equal( 
    messages.some(message => message.id === "1"),
    false
  );
}); 

// Test 2: Delete multiple messages 
test("Trash multiple messages", async () => {
  const { gmail, messages } = setup();

  const result = await trashMessages(gmail, ["1", "2", "3" ]);

  assert.deepEqual(result.deletedIds, ["1", "2", "3"]);
  assert.deepEqual(result.failedIds, []);
  assert.equal(messages.length, 27);
});

// Test 3: Invalid message ID 
test("Reject an invalid message ID", async () => {
  const { gmail } = setup();

  const result = await trashMessages(gmail, ["999"]);
  
  assert.deepEqual(result.deletedIds, []);
  assert.deepEqual(result.failedIds, ["999"]);
});

// Test 4: Missing message ID 
test("Reject a missing message ID", async () => {
  const { gmail } = setup();

  await assert.rejects(
    trashMessage(gmail, ""),
    /required/i 
  );
});

//Test 5: Continue if one deletion fails
test("Continue deleting when one message fails", async () => {
  const { gmail, messages, failedIds } = setup();

  failedIds.add("2");

  const result = await trashMessages(gmail, ["1","2","3"]);

  assert.deepEqual(result.deletedIds, ["1", "3"]);
  assert.deepEqual(result.failedIds, ["2"]);

  assert.equal(messages.length, 28);

  assert.equal(messages.some(message => message.id === "2"),
  true
  );
});

// Test 6: Prevent duplicate deletion
test("Reject deleting the same message twice", async () => {
  const { gmail } = setup();

  await trashMessage(gmail, "1");

  await assert.rejects( 
    trashMessage(gmail, "1"),
    /not found/
  );
});

// Test 7: Update sender count 

test("Update sender count after deleting a message", async () => {
  const { gmail, messages } = setup();

  const before = groupBySender(messages);

  const amazonBefore = before.find( 
    sender => sender.email === "store@amazon.com"
  );

  assert.equal(amazonBefore.count, 6);

  await trashMessage(gmail, "1");

  const after = groupBySender(messages);

  const amazonAfter = after.find(
    sender => sender.email === "store@amazon.com"
  );

  assert.equal(amazonAfter.count,5);
});

//Test 8: Remove all messages from a sender 
test("Remove sender from groups when empty", async () => {
  const { gmail, messages } = setup();

  await trashMessage(gmail, "30");

  const senders = groupBySender(messages);

  const discord = senders.find(
    sender => sender.email === "notifications@discord.com"
  );

  assert.equal(discord, undefined);
});
