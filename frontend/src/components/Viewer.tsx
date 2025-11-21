import React from 'react';

interface ViewerProps {
  sessionId: string;
  title: string;
  onClose: () => void;
}

const Viewer: React.FC<ViewerProps> = ({ sessionId, title, onClose }) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const viewerUrl = `${apiUrl}/api/sessions/${sessionId}/viewer`;

  return (
    <div className="viewer-overlay">
      <div className="viewer-container">
        <div className="viewer-header">
          <span className="viewer-title">{title}</span>
          <button className="close-button" onClick={onClose} title="Fechar">
            ✕
          </button>
        </div>
        <div className="viewer-content">
          <iframe
            src={viewerUrl}
            className="viewer-iframe"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            title="SCORM Content"
          />
        </div>
      </div>
    </div>
  );
};

export default Viewer;
