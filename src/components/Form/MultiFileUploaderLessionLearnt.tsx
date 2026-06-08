import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { serverRequest } from '@/services/getServerSideRender';
import { toast } from 'react-toastify';
import { CONSTANTS } from '@/config/constant';
import { UPLOAD_FILE, BUCKET_URL } from '@/config/apiConfig';

interface LRImages {
  imageId?: number;
  pirId?: string;
  mongoId?: string;
  fileName?: string;
  fileType?: string;
  fileThumbnail?: string;
  createdAt?: string;
  createdBy?: string;
}
interface MultiPhotoUploaderProps {
  required?: boolean;
  token: string;
  disabled?: boolean;
  elName: string;
  createdBy?: string;
  existingFiles?: LRImages[];
  onFilesChange: (files: LRImages[], deletedIds: string[]) => void;
}

const MultiFileUploaderLessionLearnt: React.FC<MultiPhotoUploaderProps> = ({
  token,
  disabled,
  required,
  elName,
  createdBy,
  existingFiles = [],
  onFilesChange
}) => {
  const [displayedFiles, setDisplayedFiles] = useState<LRImages[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (existingFiles?.length) setDisplayedFiles(existingFiles);
  }, [existingFiles]);

  const handleFileClick = () => fileInputRef.current?.click();

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
        const uploaded: LRImages = {
          mongoId: response.objectId,
          fileName: file.name,
          fileType: file.type || '',
          fileThumbnail: response.objectId,
          createdAt: new Date().toISOString(),
          createdBy: createdBy || ''
        };

        const updatedFiles = [...displayedFiles, uploaded];
        setDisplayedFiles(updatedFiles);
        onFilesChange(updatedFiles, deletedFileIds);
      } else {
        toast.error('Upload failed: ' + (response?.message || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Error uploading file.');
      console.error(err);
    }

    e.target.value = '';
  };

  const handleDeleteFile = (index: number) => {
    const fileToDelete = displayedFiles[index];
    if (!fileToDelete?.mongoId) return;

    const newDeletedIds = [...deletedFileIds, fileToDelete.mongoId];
    setDeletedFileIds(newDeletedIds);

    const updatedFiles = displayedFiles.filter((_, i) => i !== index);
    setDisplayedFiles(updatedFiles);
    onFilesChange(updatedFiles, newDeletedIds);
  };

  const getPreviewUrl = (file: LRImages) => {
    if (!file.fileThumbnail) return '/images/icons/file-icon.svg';
    if (file.fileType?.startsWith('image/')) return `${BUCKET_URL}/${file.fileThumbnail}`;
    if (file.fileType?.startsWith('video/')) return '/images/icons/video-icon.svg';
    const ext = file.fileName?.split('.').pop()?.toLowerCase();
    if (['zip', 'rar'].includes(ext || '')) return '/images/icons/zip-icon.svg';
    if (ext === 'pdf') return '/images/icons/pdf-icon.svg';
    if (['doc', 'docx'].includes(ext || '')) return '/images/icons/doc-icon.svg';
    if (['xls', 'xlsx'].includes(ext || '')) return '/images/icons/xls-icon.svg';
    return '/images/icons/file-icon.svg';
  };

  return (
    <div className="multi-photo-uploader">
      {displayedFiles.length > 0 && (
        <div className="preview-gallery d-flex">
          {displayedFiles.map((file, index) => (
            <div key={`${file.mongoId}-${index}`} className="preview-item me-4">
              <Image
                src={getPreviewUrl(file)}
                alt={file.fileName || 'file'}
                width={90}
                height={90}
              />
              {!disabled && (
                <button className="img-btn m-2" onClick={() => handleDeleteFile(index)}>
                 <Image src="/images/svg/delete-icon.svg" alt="Delete" width={20} height={20} />
                </button>
              )}
              <div>{file.fileName}</div>
            </div>
          ))}
        </div>
      )}
      <div className="upload-section" onClick={handleFileClick}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          name={elName}
          disabled={disabled}
        />
        {!disabled && <div className="upload-label" style={{cursor: "pointer"}} >
            <div style={{  maxWidth: '60px', display: 'flex', justifyContent: "center", alignItems: "center", padding: "5px", backgroundColor: "orange" }}>
            <Image
              src="/images/svg/upload-icon.svg"
              alt="Upload"
              width={40}
              height={40}
            />
            </div>
            <div className="text mb-2">Click to Upload {required && <span className="text-danger">*</span>}</div>
          </div>}
      </div>
    </div>
  );
};

export default MultiFileUploaderLessionLearnt;