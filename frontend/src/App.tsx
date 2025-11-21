import { useState } from 'react';
import UploadZone from './components/UploadZone';
import Viewer from './components/Viewer';
import ErrorDisplay from './components/ErrorDisplay';
import ThemeToggle from './components/ThemeToggle';
import { uploadScormPackage, deleteSession } from './services/api';
import { useTheme } from './hooks/useTheme';

interface SessionData {
  sessionId: string;
  title: string;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      const response = await uploadScormPackage(file, (progress) => {
        setProgress(progress);
      });

      if (response.success) {
        setSession({
          sessionId: response.sessionId,
          title: response.manifest.title || 'SCORM Package',
        });
      } else {
        setError(response.message || 'Erro ao processar o pacote SCORM');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Response data:', err.response?.data);

      if (err.response?.data?.error) {
        const errorMsg = err.response.data.error;
        const details = err.response.data.details;
        const fullError = details ? `${errorMsg}\n\nDetalhes: ${JSON.stringify(details, null, 2)}` : errorMsg;
        setError(fullError);
      } else if (err.message) {
        setError(`Erro: ${err.message}`);
      } else {
        setError('Erro desconhecido ao fazer upload do arquivo');
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleClose = async () => {
    if (session) {
      try {
        await deleteSession(session.sessionId);
      } catch (err) {
        console.error('Error deleting session:', err);
      }
    }
    setSession(null);
    setError(null);
  };

  const handleErrorClose = () => {
    setError(null);
  };

  return (
    <div className="app">
      <div className="background"></div>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {!session && !error && (
        <UploadZone
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          progress={progress}
        />
      )}

      {session && (
        <Viewer
          sessionId={session.sessionId}
          title={session.title}
          onClose={handleClose}
        />
      )}

      {error && (
        <ErrorDisplay
          error={error}
          onClose={handleErrorClose}
        />
      )}

      <footer className="footer">
        <p>
          Made with <img src="/logo-footer.png" alt="Simpl.Labs" className="footer-logo" /> by Simpl.Labs
        </p>
      </footer>
    </div>
  );
}

export default App;
