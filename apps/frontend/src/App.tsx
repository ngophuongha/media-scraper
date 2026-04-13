import React from "react";
import { Gallery } from "./presentation/containers/Gallery";
import { ScraperFormSection } from "./presentation/containers/ScraperForm";
import { ErrorBoundary } from "./presentation/shared/ErrorBoundary";
import { Main } from "./presentation/shared/Main";
import { Page } from "./presentation/shared/Page";

const Header = React.lazy(() =>
  import("./presentation/shared/Header").then((module) => ({
    default: module.Header,
  })),
);
const NetworkOffline = React.lazy(() =>
  import("./presentation/shared/NetworkOffline").then((module) => ({
    default: module.NetworkOffline,
  })),
);
function App() {
  return (
    <ErrorBoundary>
      <NetworkOffline>
        <Page>
          <Header />
          <Main>
            <ScraperFormSection />
            <Gallery />
          </Main>
        </Page>
      </NetworkOffline>
    </ErrorBoundary>
  );
}

export default App;
