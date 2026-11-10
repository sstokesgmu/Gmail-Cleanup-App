import test from "node:test";
import assert from "node:assert/strict";

import {parseSender, groupBySender} from "../utils/senderUtils.js";

test("Parse sender name and email", ()=> {
  const sender = parseSender("Amazon <store@example.com>");

  assert.deepEqual(sender, {
    name: "Amazon",
    email: "store@example.com"
  });
});

test("Group emails by sender", () => {
  const messages = [
    {id: "1", from: "Amazon <store@example.com>"},
    {id: "2", from: "Amazon <store@example.com>"},
    {id: "3", from: "LinkedIn <jobs@example.com>"}
  ];

  const senders = groupBySender(messages);

  assert.equal(senders.length,2);
  assert.equal(senders[0].count, 2);
  assert.equal(senders[0].email, "store@example.com");
  assert.equal(senders[1].count, 1);
});

test("Normalize sender email addresses", () => {
  const sender = parseSender("Example <USER@EXAMPLE.COM>");

  assert.equal(sender.email, "user@example.com");
});
