import React from "react";
import { render } from "react-dom";

import App from "./App";

render(
  <React.StrictMode>
    <React.Suspense fallback={<div>loading...</div>}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);
