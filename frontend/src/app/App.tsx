import { BrowserRouter } from "react-router";

import { AppProviders } from "./providers";
import { AppRouter } from "./router";

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  );
}
