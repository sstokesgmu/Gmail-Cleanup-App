import test from "node:test";
import assert from "node:assert/strict";

import {
  initializeStatistics,
  recordDeletion,
  getStatistics
} from "../services/statisticsService.js";

// Create fresh test email data
function createTestInbox() {
  return [
    {
      id: "1",
      from: "Amazon <store@amazon.com>",
      subject: "Order Confirmed"
    },
    {
      id: "2",
      from: "Amazon <store@amazon.com>",
      subject: "Package Shipped"
    },
    {
      id: "3",
      from: "Steam <store@steam.com>",
      subject: "Game purchased"
    },
    {
      id: "4",
      from: "Netflix <info@netflix.com>",
      subject: "New Releases"
    },
    {
      id: "5",
      from: "Amazon <store@amazon.com>",
      subject: "Order Confirmed"
    },
    {
      id: "6",
      from: "LinkedIn <jobs@linkedIn.com>",
      subject: "New jobs available"
    }
  ];
}

// Initialize a fresh statistics session for each test
function setup() {
  const messages = createTestInbox();

  initializeStatistics(messages);

  return messages;
}

// Test 1: Initialize statistics
test("Initialize cleanup statistics", () => {
  setup();

  const stats = getStatistics();

  assert.equal(stats.initialEmailCount, 6);
  assert.equal(stats.remainingEmailCount, 6);
  assert.equal(stats.deletedCount, 0);
  assert.equal(stats.failedCount, 0);
  assert.equal(stats.cleanupPercentage, 0);
  assert.deepEqual(stats.deletedBySender, []);
});

// Test 2: Record session start time
test("Record session start time", () => {
  setup();

  const stats = getStatistics();

  assert.ok(stats.sessionStartedAt instanceof Date);
  assert.ok(Number.isFinite(stats.sessionStartedAt.getTime()));
});

// Test 3: Delete a single email
test("Record a single successful deletion", () => {
  const messages = setup();

  recordDeletion(messages, ["1"], []);

  const stats = getStatistics();

  assert.equal(stats.deletedCount, 1);
  assert.equal(stats.remainingEmailCount, 5);
  assert.equal(stats.failedCount, 0);
});

// Test 4: Delete multiple emails
test("Record multiple successful deletions", () => {
  const messages = setup();

  recordDeletion(messages, ["1", "2", "3"], []);

  const stats = getStatistics();

  assert.equal(stats.deletedCount, 3);
  assert.equal(stats.remainingEmailCount, 3);
  assert.equal(stats.failedCount, 0);
});

// Test 5: Failed deletions
test("Record failed deletion attempts", () => {
  const messages = setup();

  recordDeletion(messages, [], ["1", "2"]);

  const stats = getStatistics();

  assert.equal(stats.failedCount, 2);
  assert.equal(stats.deletedCount, 0);
  assert.equal(stats.remainingEmailCount, 6);
});

// Test 6: Partial deletion failure
test("Record successful and failed deletions together", () => {
  const messages = setup();

  recordDeletion(messages, ["1", "2"], ["3"]);

  const stats = getStatistics();

  assert.equal(stats.deletedCount, 2);
  assert.equal(stats.failedCount, 1);
  assert.equal(stats.remainingEmailCount, 4);
});

// Test 7: Calculate cleanup percentage
test("Calculate cleanup percentage", () => {
  const messages = setup();

  recordDeletion(messages, ["1", "2", "3"], []);

  const stats = getStatistics();

  assert.equal(stats.cleanupPercentage, 50);
});

// Test 8: Delete all emails
test("Calculate 100 percent cleanup", () => {
  const messages = setup();

  recordDeletion(
    messages,
    ["1", "2", "3", "4", "5", "6"],
    []
  );

  const stats = getStatistics();

  assert.equal(stats.deletedCount, 6);
  assert.equal(stats.remainingEmailCount, 0);
  assert.equal(stats.cleanupPercentage, 100);
});

// Test 9: Handle an empty inbox
test("Handle an empty inbox without division by zero", () => {
  initializeStatistics([]);

  const stats = getStatistics();

  assert.equal(stats.initialEmailCount, 0);
  assert.equal(stats.remainingEmailCount, 0);
  assert.equal(stats.cleanupPercentage, 0);
  assert.ok(Number.isFinite(stats.cleanupPercentage));
});

// Test 10: Track deleted emails by sender
test("Track deleted emails by sender", () => {
  const messages = setup();

  recordDeletion(messages, ["1", "2", "5", "3"], []);

  const stats = getStatistics();

  assert.deepEqual(stats.deletedBySender, [
    {
      email: "store@amazon.com",
      count: 3
    },
    {
      email: "store@steam.com",
      count: 1
    }
  ]);
});

// Test 11: Accumulate multiple deletion operations
test("Accumulate statistics across deletion operations", () => {
  const messages = setup();

  recordDeletion(messages, ["1"], []);
  recordDeletion(messages, ["2", "5"], []);
  recordDeletion(messages, ["3"], ["4"]);

  const stats = getStatistics();

  assert.equal(stats.deletedCount, 4);
  assert.equal(stats.failedCount, 1);
  assert.equal(stats.remainingEmailCount, 2);

  assert.deepEqual(stats.deletedBySender, [
    {
      email: "store@amazon.com",
      count: 3
    },
    {
      email: "store@steam.com",
      count: 1
    }
  ]);
});

// Test 12: Exclude failed deletions from sender statistics
test("Exclude failed deletions from sender statistics", () => {
  const messages = setup();

  recordDeletion(messages, ["1"], ["2", "3"]);

  const stats = getStatistics();

  assert.deepEqual(stats.deletedBySender, [
    {
      email: "store@amazon.com",
      count: 1
    }
  ]);

  assert.equal(stats.failedCount, 2);
});

// Test 13: Sort senders by deletion count
test("Sort senders by highest deletion count", () => {
  const messages = setup();

  recordDeletion(messages, ["3"], []);
  recordDeletion(messages, ["1", "2", "5"], []);

  const stats = getStatistics();

  assert.equal(
    stats.deletedBySender[0].email,
    "store@amazon.com"
  );

  assert.equal(stats.deletedBySender[0].count, 3);

  assert.equal(
    stats.deletedBySender[1].email,
    "store@steam.com"
  );

  assert.equal(stats.deletedBySender[1].count, 1);
});

// Test 14: Reset statistics
test("Reset statistics when initializing a new session", () => {
  const messages = setup();

  recordDeletion(messages, ["1", "2"], ["3"]);

  initializeStatistics(messages);

  const stats = getStatistics();

  assert.equal(stats.initialEmailCount, 6);
  assert.equal(stats.remainingEmailCount, 6);
  assert.equal(stats.deletedCount, 0);
  assert.equal(stats.failedCount, 0);
  assert.equal(stats.cleanupPercentage, 0);
  assert.deepEqual(stats.deletedBySender, []);
});

// Test 15: Empty deletion operation
test("Preserve statistics when no deletions occur", () => {
  const messages = setup();

  recordDeletion(messages, [], []);

  const stats = getStatistics();

  assert.equal(stats.deletedCount, 0);
  assert.equal(stats.failedCount, 0);
  assert.equal(stats.remainingEmailCount, 6);
  assert.deepEqual(stats.deletedBySender, []);
});

// Test 16: Retry a failed deletion
test("Record successful retry after a failed deletion", () => {
  const messages = setup();

  recordDeletion(messages, [], ["1"]);
  recordDeletion(messages, ["1"], []);

  const stats = getStatistics();

  assert.equal(stats.deletedCount, 1);
  assert.equal(stats.failedCount, 1);
  assert.equal(stats.remainingEmailCount, 5);
});

// Test 17: Normalize sender email addresses
test("Normalize sender email addresses in statistics", () => {
  const messages = setup();

  recordDeletion(messages, ["6"], []);

  const stats = getStatistics();

  assert.deepEqual(stats.deletedBySender, [
    {
      email: "jobs@linkedin.com",
      count: 1
    }
  ]);
});

// Test 18: Calculate fractional cleanup percentage
test("Calculate fractional cleanup percentage", () => {
  const messages = setup();

  recordDeletion(messages, ["1"], []);

  const stats = getStatistics();

  assert.equal(
    stats.cleanupPercentage.toFixed(2),
    "16.67"
  );
});
