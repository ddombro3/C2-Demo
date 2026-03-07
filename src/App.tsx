import Header from "./components/Header";
import SplitLayout from "./components/SplitLayout";
import StatusBar from "./components/StatusBar";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <SplitLayout />
      </main>
      <StatusBar />
    </div>
  );
}