import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ScreenshotOverlay from './components/ScreenshotOverlay';

function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (route === '#/screenshot') {
    return <ScreenshotOverlay />;
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Layout />
    </div>
  );
}

export default App;
