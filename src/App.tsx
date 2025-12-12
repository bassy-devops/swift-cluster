
import { AppProvider } from './context/AppContext';
import { SplitLayout } from './components/Layout/SplitLayout';
import { ChatInterface } from './components/Chat/ChatInterface';
import { BoardInterface } from './components/Board/BoardInterface';

function App() {
  return (
    <AppProvider>
      <SplitLayout
        left={<ChatInterface />}
        right={<BoardInterface />}
      />
    </AppProvider>
  );
}

export default App;
