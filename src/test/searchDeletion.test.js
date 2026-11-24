import test from "node:test";
import assert from "node:assert/strict";

import { searchResultsMenu } from "../cli/searchResultsMenu.js";

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
