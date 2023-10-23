import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { registerIcons } from "@fluentui/react/lib/Styling";
import { ChevronDownIcon } from "@fluentui/react-icons-mdl2";
import "./index.css";

registerIcons({
  icons: {
    ChevronDown: <ChevronDownIcon />,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.getElementById("root")!,
);
