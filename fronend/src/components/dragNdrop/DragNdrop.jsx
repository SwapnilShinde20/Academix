import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { keyframes } from 'styled-components';
import filelogo from '../noticeboard/filelogo.png'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const DropzoneContainer = styled.div`
  border: 2px dashed #3a2b51;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const FilePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
`;

const FilePreview = styled.div`
  width: 120px;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-in;
`;

const PreviewImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FileName = styled.p`
  font-size: 8px;
  margin: 8px 0;
`;

const ProgressBarContainer = styled.div`
  background-color: #ddd;
  border-radius: 10px;
  height: 10px;
  margin-top: 5px;
  overflow: hidden;
`;

const Progress = styled.div`
  background-color: #8e6ac4;
  height: 100%;
  width: ${(props) => props.width}%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  transition: width 0.4s ease;
  border-radius: inherit;
`;

const DragAndDropFileUpload = ({ onFilesUploaded,files,setFiles }) => {
  // const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );

    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...newFiles];
      // Call the parent callback function with the updated files array
      onFilesUploaded(updatedFiles);
      return updatedFiles;

    });

    newFiles.forEach((file) => {
      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [file.name]: 0,
      }));

      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = Math.min(prevProgress[file.name] + 10, 100);
          if (newProgress === 100) clearInterval(interval);
          return { ...prevProgress, [file.name]: newProgress };
        });
      }, 200);
    });
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: '*/*',
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <DropzoneContainer {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>Drag & drop files here, or click to select files</p>
      )}

      <FilePreviewContainer>
        {files.map((file) => (
          <FilePreview key={file.name}>
            <div className="flex flex-row">
              <PreviewImage src={file.preview || filelogo} alt="preview" />
              <FileName>{file.name}</FileName>
            </div>
            <ProgressBarContainer>
              <Progress width={uploadProgress[file.name] || 0}>
                {uploadProgress[file.name] < 100 && `${uploadProgress[file.name]}%`}
              </Progress>
            </ProgressBarContainer>
          </FilePreview>
        ))}
      </FilePreviewContainer>
    </DropzoneContainer>
  );
};

export default DragAndDropFileUpload;
