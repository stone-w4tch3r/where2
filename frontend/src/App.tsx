import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigProvider } from "antd";
import MapPage from "./pages/MapPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <MapPage />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
