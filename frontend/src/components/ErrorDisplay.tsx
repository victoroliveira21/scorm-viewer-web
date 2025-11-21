import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClose }) => {
  return (
    <div className="error-overlay">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">Erro ao processar SCORM</h3>
        <p className="error-message">{error}</p>
        <button className="error-button" onClick={onClose}>
          Tentar novamente
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
