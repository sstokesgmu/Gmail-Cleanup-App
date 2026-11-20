import test from "node:test";
import assert from "node:assert/strict";

import { filterMessagesByAge } from "../utils/searchUtils.js";

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
