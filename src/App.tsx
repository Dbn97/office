import { useState } from 'react';
import WordEditor from './components/WordEditor';
import ExcelSheet from './components/ExcelSheet';
import PowerPointEditor from './components/PowerPointEditor';
import OfficeHome from './components/OfficeHome';

export type AppType = 'home' | 'word' | 'excel' | 'powerpoint';

export default function App() {
  const [currentApp, setCurrentApp] = useState<AppType>('home');

  const renderApp = () => {
    switch (currentApp) {
      case 'home':
        return <OfficeHome onSelectApp={setCurrentApp} />;
      case 'word':
        return <WordEditor onBack={() => setCurrentApp('home')} />;
      case 'excel':
        return <ExcelSheet onBack={() => setCurrentApp('home')} />;
      case 'powerpoint':
        return <PowerPointEditor onBack={() => setCurrentApp('home')} />;
      default:
        return <OfficeHome onSelectApp={setCurrentApp} />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      {renderApp()}
    </div>
  );
}
