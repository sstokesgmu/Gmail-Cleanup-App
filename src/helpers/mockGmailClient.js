export function createMockPaginationClient(mockMessages = []) {
  const listCalls = [];
  const getCalls = [];

  const gmail = {
    users: {
      messages: {
        async list({
          userId,
          maxResults = 100,
          pageToken,
          q
        }) {
          listCalls.push({
            userId,
            maxResults,
            pageToken,
            q
          });

          const startIndex = pageToken
            ? Number(pageToken)
            : 0;

          const endIndex = startIndex + maxResults;

          const page = mockMessages.slice(
            startIndex,
            endIndex
          );

          return {
            data: {
              messages: page.map(message => ({
                id: message.id,
                threadId: message.threadId
              })),

              nextPageToken:
                endIndex < mockMessages.length
                  ? String(endIndex)
                  : undefined,

              resultSizeEstimate: mockMessages.length
            }
          };
        },

        async get({ userId, id, format, metadataHeaders }) {
          getCalls.push({
            userId,
            id,
            format,
            metadataHeaders
          });

          const message = mockMessages.find(
            message => message.id === id
          );

          if (!message) {
            throw new Error(`Message ${id} not found`);
          }

          return {
            data: {
              id: message.id,
              threadId: message.threadId,
              snippet: message.snippet ?? "",
              labelIds: message.labels ?? [],

              payload: {
                headers: [
                  {
                    name: "From",
                    value: message.from
                  },
                  {
                    name: "Subject",
                    value: message.subject
                  },
                  {
                    name: "Date",
                    value: message.date
                  }
                ]
              }
            }
          };
        }
      }
    }
  };

  return {
    gmail,
    listCalls,
    getCalls
  };
}
