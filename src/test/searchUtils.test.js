import test from "node:test";
import assert from "node:assert/strict";

import { filterMessagesByAge, filterMessagesBySender, filterMessagesByCategory } from "../utils/searchUtils.js";

// Helper: create a date relative to today 
function daysAgo(days){
  return new Date(Date.now() 
  - days * 24 * 60 * 60 * 1000).toISOString();
}

test("Filter emails older than 30 days", () => {
  const messages = [
    {id:"1", date: daysAgo(60)},
    {id:"2", date: daysAgo(45)},
    {id:"3", date: daysAgo(10)}
  ];

  const result = filterMessagesByAge(messages, 30);

  assert.deepEqual(
    result.map((message) => message.id),
    ["1", "2"]
  );
});

test("Return empty array when no emails match", () => {
  const messages = [
    {id: "1", date: daysAgo(5)},
    {id: "2", date: daysAgo(10)},
  ];

  const results = filterMessagesByAge(messages, 30);

  assert.deepEqual(results, []);
});

test("Skip messages with invalid dates", () => {
  const messages = [
    { id: "1", date: "invalid-date" },
    { id: "2", date: daysAgo(60) },
  ];

  const results = filterMessagesByAge(messages, 30);

  assert.deepEqual(
    results.map((message) => message.id), 
    ["2"]
  );
});


test("Reject negative days", () => {
  assert.throws( 
  () => filterMessagesByAge([], -5), RangeError
  );
});

test("Filter messages by sender name", () => {
  const messages = [
    {id: "1", from: "Amazon <store@amazon.com>"},
    {id: "2", from: "LinkedIn <jobs@linkedin.com>"},
    {id: "3", from: "Amazon <deals@amazon.com"},
  ];

  const results = filterMessagesBySender(messages, "amazon");
  
  assert.deepEqual(
    results.map((message) => message.id),
    ["1", "3"]
  );
});

test("Filter messages by sender email address", () => {
  const messages = [ 
    {id: "1", from: "Amazon <store@amazon.com>"},
    {id: "2", from: "LinkedIn <jobs@linkedin.com>"},
  ];

  const results = filterMessagesBySender(messages, "jobs@linkedin.com");

  assert.equal(results.length, 1);
  assert.equal(results[0].id, "2");
});

test("Sender search is case insensitive", () => {
  const messages = [
    { id: "1", from: "Amazon <store@amazon.com>"}
  ];

  const results = filterMessagesBySender(messages, "AMAZON");

  assert.deepEqual(results.length,1);
});

test("Return empty array for blank sender query", () => {
  const messages = [
    { id: "1", from: "Amazon <store@amazon.com>" }
  ];

  assert.deepEqual(
    filterMessagesBySender(messages, "  "), 
    []
  );
});


//----------------- Category Test -------------------- 


test("Filter messages by category", () => {
  const messages = [
    { id: "1", category: "promotions" },
    { id: "2", category: "social" },
    { id: "3", category: "promotions" }
  ];

  const results = filterMessagesByCategory(
    messages,
    "promotions"
  );

  assert.deepEqual(
    results.map((message) => message.id),
    ["1", "3"]
  );
});

test("Category search is case insensitive", () => {
  const messages = [
    { id: "1", category: "Promotions" },
    { id: "2", category: "Social" }
  ];

  const results = filterMessagesByCategory(
    messages,
    "PROMOTIONS"
  );

  assert.equal(results.length, 1);
});

test("Return empty array for unknown category", () => {
  const messages = [
    { id: "1", category: "updates" }
  ];

  const results = filterMessagesByCategory(
    messages,
    "forums"
  );

  assert.deepEqual(results, []);
});

test("Ignore messages with missing categories", () => {
  const messages = [
    { id: "1" },
    { id: "2", category: "social" }
  ];

  const results = filterMessagesByCategory(
    messages,
    "social"
  );

  assert.deepEqual(
    results.map((message) => message.id),
    ["2"]
  );
});

