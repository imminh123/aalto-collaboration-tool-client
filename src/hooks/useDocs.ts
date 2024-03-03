import "quill/dist/quill.bubble.css";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import ReconnectingWebSocket from "reconnecting-websocket";
import richText from "rich-text";
import Sharedb from "sharedb/lib/client";
import useWebSocket from "react-use-websocket";

Sharedb.types.register(richText.type);

// const socket = new ReconnectingWebSocket("ws://localhost:8080", [], {
//   // ShareDB handles dropped messages, and buffering them while the socket
//   // is closed has undefined behavior
//   maxEnqueuedMessages: 0,
// });
const socket = new WebSocket("ws://127.0.0.1:8080");

const connection = new Sharedb.Connection(socket);

export const useDocs = (documentId?: string) => {
  const [documents, setDocuments] = useState([]);
  const doc = connection.get("documents", documentId);

  const query = connection.createSubscribeQuery("documents", {});
 
  query.on("ready", () => {
    // The initial results are available in query.results
    if (query.results) {
      setDocuments(query.results.map((item: any) => item.id));
    }
  });

  return { doc, connection, documents };
};
