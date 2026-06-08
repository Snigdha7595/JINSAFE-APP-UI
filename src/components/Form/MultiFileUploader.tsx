import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { serverRequest } from '@/services/getServerSideRender';
import { toast } from 'react-toastify';
import { CONSTANTS } from '@/config/constant';
import { UPLOAD_FILE, BUCKET_URL, DOWNLOAD_FILE } from '@/config/apiConfig';

interface UploadedFile {
  fileId: string;
  fileType: string;
  fileName: string;
  fileSize: string;
  fileThumbnail: string;
  createdAt: string;
  createdBy: string;
}

interface MultiFileUploaderProps {
  required?: boolean;
  token: string;
  disabled?: boolean;
  elName: string;
  createdBy?: string;
  existingFiles?: UploadedFile[];
  onFilesChange: (files: UploadedFile[], deletedIds: string[]) => void;
}

const MultiFileUploader: React.FC<MultiFileUploaderProps> = ({ disabled, required, token, elName, createdBy, existingFiles = [], onFilesChange }) => {
  const [displayedFiles, setDisplayedFiles] = useState<UploadedFile[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

 useEffect(() => {
  if (existingFiles?.length > 0) {
    const validFiles = existingFiles.filter(file => !!(file && (file.fileId || file.fileThumbnail)));
    if (validFiles.length > 0) {
      setDisplayedFiles(validFiles);
    }
  }
}, [existingFiles]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

   if (!file) return;

      const formData = new FormData();
      formData.append('file', file, file.name);

      try {
        const response = await serverRequest(
          formData,
          UPLOAD_FILE,
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token,
          true,
          false
        );

        if (response?.success && response?.objectId) {
          const uploadedObj: UploadedFile = {
            fileId: response.objectId,
            fileType: file.type || '',
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(3), // KB
            fileThumbnail: response.objectId,
            createdAt: new Date().toISOString(),
            createdBy: createdBy || ''
          };

          const updatedList = [...displayedFiles, uploadedObj];
          setDisplayedFiles(updatedList);
          onFilesChange(updatedList, deletedFileIds);
        } else {
          toast.error('Upload failed: ' + (response?.message || 'Unknown error'));
        }
      } catch (error) {
        toast.error('Error uploading file.');
        console.error(error);
      }    
    e.target.value = '';
  };

  const handleDeleteFile = async (index: number) => {
    const fileToDelete = displayedFiles[index];
    if (!fileToDelete?.fileId) return;

    const newDeletedIds = [...deletedFileIds, fileToDelete.fileId];
    setDeletedFileIds(newDeletedIds);
    const updatedList = displayedFiles.filter((_, i) => i !== index);
    setDisplayedFiles(updatedList);
    onFilesChange(updatedList, newDeletedIds);
  };

  // const getFilePreviewIcon = (file: UploadedFile) => {
  //   const ext = file.fileName.split('.').pop()?.toLowerCase();
  //   if (file.fileType.startsWith('image/')) {
  //     return file.fileThumbnail?.startsWith('http')
  //       ? file.fileThumbnail
  //       : `${BUCKET_URL}/${file.fileThumbnail}`;
  //   }
  //   if (file.fileType.startsWith('video/')) {
  //     return '/images/icons/video-icon.svg';
  //   }
  //   if (ext === 'zip' || ext === 'rar') {
  //     return '/images/icons/zip-icon.svg';
  //   }
  //   if (ext === 'pdf') {
  //     return '/images/icons/pdf-icon.svg';
  //   }
  //   if (ext === 'doc' || ext === 'docx') {
  //     return '/images/icons/doc-icon.svg';
  //   }
  //   if (ext === 'xls' || ext === 'xlsx') {
  //     return '/images/icons/xls-icon.svg';
  //   }
  //   return '/images/icons/file-icon.svg';
  // };

  const downloadFile = async (fileId) => {
    const payload = fileId;
    try {
        const response = await serverRequest(
            payload,
            DOWNLOAD_FILE,
            CONSTANTS.REQUEST_POST,
            true,
            true,
            token,
            false,   
            true,  
           "blob"   // responseType — tell it to treat response as a Blob
        );
        let blob;
        if (response instanceof Response) {
            blob = await response.blob();
        } else {
            blob = response; // already a Blob
        }
        const url = window.URL.createObjectURL(blob);
        // console.log("url",url);
        window.open(url, "_blank");
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);
    } catch (error) {
        console.error("Open failed:", error);
        toast.error("File open failed. Please try again.");
    }
  };

  const getFilePreviewIcon = (file: UploadedFile) => {
  const ext = file.fileName?.split('.').pop()?.toLowerCase() || '';
  
  if (file.fileType && typeof file.fileType === 'string') {
    if (file.fileType.startsWith('image/')) {
      return file.fileThumbnail?.startsWith('http')
        ? file.fileThumbnail
        : `${BUCKET_URL}/${file.fileThumbnail}`;
    }
    if (file.fileType.startsWith('video/')) {
      return '/images/icons/video-icon.svg';
    }
  }
  
  if (ext === 'zip' || ext === 'rar') {
    return '/images/icons/zip-icon.svg';
  }
  if (ext === 'pdf') {
    return '/images/icons/pdf-icon.svg';
  }
  if (ext === 'doc' || ext === 'docx') {
    return '/images/icons/doc-icon.svg';
  }
  if (ext === 'xls' || ext === 'xlsx') {
    return '/images/icons/xls-icon.svg';
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    return file.fileThumbnail?.startsWith('http')
      ? file.fileThumbnail
      : `${BUCKET_URL}/${file.fileThumbnail}`;
  }
  if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'].includes(ext)) {
    return '/images/icons/video-icon.svg';
  }

  return '/images/icons/file-icon.svg';
};
  return (
    <div className="multi-file-uploader">
      {displayedFiles.length > 0 && (
        <div className="preview-gallery d-flex">
          {displayedFiles.map((file, index) => {
            const previewUrl = getFilePreviewIcon(file);

            return (
              <div key={`${file.fileId}-${index}`} className="preview-item me-4">
                <Image onClick={() => downloadFile(file.fileId)}
                  style={{cursor: "pointer"}}
                  title='click to download the image'
                  src={previewUrl}
                  alt={file.fileName}
                  className="preview-thumb"
                  width={disabled?100:70}
                  height={disabled?100:70}
                />
                <button disabled={disabled} style={{marginLeft: "10px"}} className="delete-btn" onClick={() => handleDeleteFile(index)} aria-label={`Delete ${file.fileName}`}>
                  <Image src="/images/svg/delete-icon.svg" alt="Delete" width={20} height={20} />
                </button>
                <div className="filename">{file.fileName}</div>
                {deletedFileIds.includes(file.fileId) && (
                  <div className="pending-deletion-marker">Pending Deletion</div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="upload-section">
        <div className="upload-input" onClick={handleFileClick}>
          <input
            type="file"
            disabled={disabled}
            name={elName}
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          { !disabled && <div className="upload-label" style={{cursor: "pointer"}} >
            <div style={{  maxWidth: '60px', display: 'flex', justifyContent: "center", alignItems: "center", padding: "5px", backgroundColor: "orange" }}>
            <Image
              src="/images/svg/upload-icon.svg"
              alt="Upload"
              width={30}
              height={30}
            />
            </div>
            <div className="text mb-2">Click to Upload {required && <span className="text-danger">*</span>}</div>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default MultiFileUploader;