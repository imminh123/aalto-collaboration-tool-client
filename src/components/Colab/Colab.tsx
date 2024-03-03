import Quill from "quill";
import "quill/dist/quill.bubble.css";
import { useEffect, useLayoutEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "quill/dist/quill.bubble.css";
import Sharedb from "sharedb/lib/client";
import richText from "rich-text";

// Registering the rich text type to make sharedb work
// with our quill editor
Sharedb.types.register(richText.type);

// Connecting to our socket server
const socket = new WebSocket("ws://127.0.0.1:8080");
const connection = new Sharedb.Connection(socket);

// Querying for our document
// const doc = connection.get('documents', 'firstDocument');

const Colab = () => {
  const { id } = useParams();
  const doc = connection.get("documents", id);
  const [subscribed, setSubscribed] = useState(false);

  const userId = useSelector((state: any) => state.login.user_id);
  let quill: Quill;

  const toolbarOptions = ["bold", "italic", "underline", "strike", "align"];
  const options = {
    theme: "bubble",
    modules: {
      toolbar: toolbarOptions,
    },
  };

  useEffect(() => {
    quill = new Quill("#editor", options);

    doc.subscribe(function (err: any) {
      setSubscribed(true);
      if (err) throw err;
      /**
       * update content to editor
       */
 
      quill.setContents(doc.data);

      // broadcasted to all other clients 
      quill.on("text-change", function (delta, oldDelta, source) {
        if (source !== "user") return;
        doc.submitOp(delta, { source: quill });
      });
    });

    /** listening to changes in the document
     * that is coming from our server
     */
    doc.on("op", function (op: any, source: any) {
      if (source === quill) return;
      quill.updateContents(op);
    });

    return () => {
      connection.close();
    };
  }, []);

  return (
    <div style={{ margin: "5%", border: "1px solid" }}>
      <div id="editor"></div>
    </div>
  );
};

export default Colab;
