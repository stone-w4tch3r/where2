import React from "react";
import { MapBuilder } from "@/components/MapBuilder";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "./store/StoreProvider";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      {/* <QueryClientProvider client={queryClient}> */}
      {/* <StoreProvider> */}
      <MapBuilder />
      {/* </StoreProvider> */}
      {/* </QueryClientProvider> */}
    </React.StrictMode>
  );
};

export default App;
