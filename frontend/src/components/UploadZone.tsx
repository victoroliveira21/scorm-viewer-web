import React, { useState, useRef } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  progress: number;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isLoading, progress }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        onFileSelect(file);
      } else {
        alert('Por favor, selecione um arquivo .zip');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-zone-container">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p className="upload-text">Processando pacote SCORM...</p>
            {progress > 0 && (
              <>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="progress-text">{progress}%</p>
              </>
            )}
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon" style={{ marginBottom: '5px' }}>
              <img src="/logo.png" alt="Scorm.Lab" style={{ width: '140px', height: '140px' }} />
            </div>
            <h2 className="upload-title">Scorm.Lab</h2>
            <p className="upload-instruction">
              Arraste um arquivo .zip aqui<br />
              ou clique para selecionar
            </p>
            <p className="upload-hint">
              Suporta SCORM 1.2 e SCORM 2004
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
