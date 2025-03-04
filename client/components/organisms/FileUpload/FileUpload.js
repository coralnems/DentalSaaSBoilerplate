import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DropZone = styled.div`
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isDragActive ? '#f8f9fa' : '#fff'};
  border-color: ${props => props.isDragActive ? '#4CAF50' : '#ddd'};

  &:hover {
    border-color: #4CAF50;
  }
`;

const FileList = styled.div`
  margin-top: 20px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  background: ${props => props.isUploading ? '#f8f9fa' : '#fff'};
`;

const FileName = styled.div`
  flex: 1;
`;

const FileType = styled.div`
  margin: 0 16px;
  color: #666;
`;

const Progress = styled.div`
  width: 100px;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: #4CAF50;
  width: ${props => props.progress}%;
  transition: width 0.2s ease;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 16px;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  color: #dc3545;
  margin-top: 4px;
  font-size: 14px;
`;

const FileUpload = ({ patientId, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [
      ...prev,
      ...acceptedFiles.map(file => ({
        file,
        progress: 0,
        error: null,
        uploaded: false
      }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const uploadFile = async (fileItem, index) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);
    formData.append('patientId', patientId);
    formData.append('folderPath', fileItem.file.type.startsWith('image/') ? 'xrays' : 'documents');

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setFiles(prev => prev.map((item, i) => 
            i === index ? { ...item, progress } : item
          ));
        }
      });

      setFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, uploaded: true, url: response.data.url } : item
      ));

      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (error) {
      setFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, error: error.message } : item
      ));
    }
  };

  const uploadAll = async () => {
    setUploading(true);
    const unuploadedFiles = files.filter(f => !f.uploaded && !f.error);
    await Promise.all(
      unuploadedFiles.map((file, index) => uploadFile(file, index))
    );
    setUploading(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <DropZone {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag and drop files here, or click to select files</p>
        )}
        <small>
          Supported formats: JPG, PNG, PDF, DOC, DOCX (max 10MB)
        </small>
      </DropZone>

      {files.length > 0 && (
        <FileList>
          {files.map((fileItem, index) => (
            <FileItem key={index} isUploading={!fileItem.uploaded && !fileItem.error}>
              <FileName>{fileItem.file.name}</FileName>
              <FileType>{fileItem.file.type}</FileType>
              {!fileItem.uploaded && !fileItem.error && (
                <Progress>
                  <ProgressBar progress={fileItem.progress} />
                </Progress>
              )}
              {fileItem.error && (
                <Error>{fileItem.error}</Error>
              )}
              {!fileItem.uploaded && !fileItem.error && (
                <Button onClick={() => uploadFile(fileItem, index)}>
                  Upload
                </Button>
              )}
              <Button 
                onClick={() => removeFile(index)}
                style={{ background: '#dc3545' }}
              >
                Remove
              </Button>
            </FileItem>
          ))}
          {files.some(f => !f.uploaded && !f.error) && (
            <Button 
              onClick={uploadAll}
              disabled={uploading}
              style={{ marginTop: '16px' }}
            >
              Upload All
            </Button>
          )}
        </FileList>
      )}
    </Container>
  );
};

FileUpload.propTypes = {
  patientId: PropTypes.string.isRequired,
  onUploadComplete: PropTypes.func
};

export default FileUpload; 