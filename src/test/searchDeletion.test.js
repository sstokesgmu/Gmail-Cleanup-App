import test from "node:test";
import assert from "node:assert/strict";

import { searchResultsMenu } from "../cli/searchResultsMenu.js";
import { groupBySender } from "../utils/senderUtils.js";

process.env.MOCK_MODE = "true";
// Simulate user input in the CLI
function createMockReadline(inputs) {
  let index = 0;

  return {
    async question(prompt) {
      if (index >= inputs.length) {
        throw new Error(`Unexpected prompt: ${prompt}`);
      }

      const answer = inputs[index++];

      console.log(`${prompt}${answer}`);
      return answer;
    }
  };
}
function createTestInbox() {
  return [
    {
      id: "1",
      from: "Amazon <store@amazon.com>",
      subject: "Order confirmed",
      date: "2026-10-01"
    },
    {
      id: "2",
      from: "Amazon <store@amazon.com>",
      subject: "Package shipped",
      date: "2026-10-03"
    },
    {
      id: "3",
      from: "Amazon <store@amazon.com>",
      subject: "Package delivered",
      date: "2026-10-05"
    },
    {
      id: "4",
      from: "Netflix <info@netflix.com>",
      subject: "New releases",
      date: "2026-10-10"
    }
  ];
}

function setup(inputs){
  const inboxMessages = createTestInbox();

  const results = inboxMessages.filter(message => message.from.toLowerCase().includes("amazon"));

  const gmail = null;
  const rl = createMockReadline(inputs);

  return {inboxMessages, results, gmail, rl};
}

// Test 1: Delete selected search results
test("Delete selected emails from search results", async () => {

  // Create test email data
  const inboxMessages = [
    {
      id: "1",
      from: "Amazon <store@amazon.com>",
      subject: "Order confirmed",
      date: "2026-10-01"
    },
    {
      id: "2",
      from: "Amazon <store@amazon.com>",
      subject: "Package shipped",
      date: "2026-10-03"
    },
    {
      id: "3",
      from: "Amazon <store@amazon.com>",
      subject: "Package delivered",
      date: "2026-10-05"
    },
    {
      id: "4",
      from: "Netflix <info@netflix.com>",
      subject: "New releases",
      date: "2026-10-10"
    }
  ];

  // Gmail client is not required in mock mode
  const gmail = null;

  // Simulate searching for Amazon emails
  const results = inboxMessages.filter(message =>
    message.from.toLowerCase().includes("amazon")
  );

  assert.equal(results.length, 3);

  const firstId = results[0].id;
  const secondId = results[1].id;

  const originalCount = inboxMessages.length;

  // Simulate user interaction
  const rl = createMockReadline([
    "2", "0",
    "2", "1",
    "6", "y",
    "7"
  ]);

  // Execute search results menu
  await searchResultsMenu(
    results,
    rl,
    gmail,
    inboxMessages
  );

  // Verify inbox count
  assert.equal(inboxMessages.length, originalCount - 2);

  // Verify selected emails were deleted
  assert.equal(
    inboxMessages.some(message => message.id === firstId),
    false
  );

  assert.equal(
    inboxMessages.some(message => message.id === secondId),
    false
  );

  // Verify unselected emails were preserved
  assert.deepEqual(
    inboxMessages.map(message => message.id),
    ["3", "4"]
  );
});

// Test 

test("Delete multiple selected emails", async () => {
  const { inboxMessages, results, gmail, rl } = setup([
    "2", "0",
    "2", "1",
    "6", "y",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  assert.equal(inboxMessages.length, 2);

  assert.deepEqual(
    inboxMessages.map(message => message.id), ["3", "4"]
  );
});

// Delete a single email 
test("Delete a single selected email", async () => {
  const { inboxMessages, results, gmail, rl } = setup([
    "2", "0",
    "6", "y",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  assert.equal(inboxMessages.length, 3);

  assert.deepEqual(
    inboxMessages.map(message => message.id),
    ["2", "3", "4" ]
  );
});

// Delete all matching emails 
test("Delete all matching search results", async () => {
  const { inboxMessages, results, gmail, rl} = setup([
    "3",
    "6", "y",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  assert.equal(inboxMessages.length, 1);
  
  assert.deepEqual(
    inboxMessages.map(message => message.id),
    ["4"]
  );
});

//Cancel Deletion 
test("Cancel deletion when confirmation is denied", async () => {
  const { inboxMessages, results, gmail, rl } = setup([
    "3",
    "6", "n",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  assert.deepEqual(inboxMessages, createTestInbox());
});

//Attempt deletion without selecting 

test("Prevent deletion when no emails are selected", async () => {
  const { inboxMessages, results, gmail, rl} = setup([
    "6",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  assert.deepEqual(inboxMessages, createTestInbox());
})

//Select and deselect an emails 
test("Select and deselect and email", async () => {
  const { inboxMessages, results, gmail, rl } = setup([
    "2", "0",
    "2", "0",
    "6",
    "7"
  ]);
  
  await searchResultsMenu(results, rl, gmail, inboxMessages);

  assert.deepEqual(inboxMessages, createTestInbox());
});


//Clear selected emails

test("Clear all selected emails", async () => {
  const { inboxMessages, results, gmail, rl } = setup([
    "3", 
    "5",
    "6",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);
  
  assert.deepEqual(inboxMessages, createTestInbox());
});

// Preserve unselected emails 

test("Preserve unselected emails after deletion", async () => {
  const { inboxMessages, results, gmail, rl } = setup([
    "2", "1",
    "6", "y",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  const remainingIds = inboxMessages.map(message => message.id);

  assert.ok(remainingIds.includes("1"));
assert.ok(remainingIds.includes("3"));
assert.ok(remainingIds.includes("4"));
assert.ok(!remainingIds.includes("2"));
})

//Deleted emails do not reappear in searches 

test("Deleted emails do not reappear in subsequent searches", async () => {
  const { inboxMessages, results, gmail, rl } = setup([
    "2", "0",
    "2", "1",
    "6", "y",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  //Perform another search 
  const newResults = inboxMessages.filter(message => message.from.toLowerCase().includes("amazon"));

  assert.equal(newResults.length, 1);
  assert.equal(newResults[0].id, "3");
});

// Update sender counts after deletion

test("Update sender counts after search deletion", async () => {
  const { inboxMessages, results, gmail, rl} = setup([
    "2", "0",
    "2", "1",
    "6", "y",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);
  
  const senders = groupBySender(inboxMessages);
  const amazon = senders.find(sender => sender.email === "store@amazon.com");

  const netflix = senders.find(sender => sender.email === "info@netflix.com");

  assert.equal(amazon.count, 1);
  assert.equal(netflix.count, 1);
});

//Remove sender when all emails are deleted 

test("Remove sender when all matching emails are deleted", async () => {
  const { inboxMessages, results, gmail, rl } = setup([
    "3",
    "6", "y",
    "7"
  ]);

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  const senders = groupBySender(inboxMessages);

  const amazon = senders.find(
    sender => sender.email === "store@amazon.com"
  );

  assert.equal(amazon,undefined);
  assert.equal(senders.length, 1);
});

test("Remove deleted emails from displayed search results", async (t) => {
  const { inboxMessages, results, gmail, rl } = setup([
    "2", "0",
    "2", "1",
    "6", "y",
    "7"
  ]);

  const tableMock = t.mock.method(console, "table", () => {});

  await searchResultsMenu(results, rl, gmail, inboxMessages);

  const calls = tableMock.mock.calls;

  //Get the final displayed table 
  const lastTable = calls.at(-1).arguments[0];
  assert.equal(lastTable.length, 1);

  assert.equal(
    lastTable[0].subject,
    "Package delivered"
  );

  assert.equal(lastTable[0].selected, "No");
})
