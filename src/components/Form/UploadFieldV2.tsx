import { ChangeEvent, FC, useState } from 'react';
import { handleCopyPaste } from '@/config/globalUtils';

export default function FileUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [imageType, setImageType] = useState<string>(''); // e.g., "img", "svg", "png"
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // New state for preview

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);

    // Generate preview
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleImageTypeSelect = (type: string) => {
    setImageType(type);
  };

  const handleDeleteFile = () => {
    setFile(null);
    setPreviewUrl(null);
    (document.getElementById('myfile') as HTMLInputElement).value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Uploading:', file);
    console.log('Selected type:', imageType);
  };

  return (
    <form onSubmit={handleSubmit} className='uploadWrapper v2'>

      <div className="uploadWrapper__inputField">
        <label htmlFor="myfile">Upload Image</label>
        <input type="file" id="myfile" name="myfile" onChange={handleFileChange} />
      </div>

      {previewUrl && (
        <div className="uploadWrapper__previewBox" style={{ marginTop: '15px' }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '250px',
              maxHeight: '250px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
          />
        </div>
      )}

      <div className="uploadWrapper__btn" style={{ marginTop: '10px' }}>
        <button type="submit" className="uploadWrapper__btn--uploadBtn">
          <img
            width="20"
            height="20"
            alt="Upload"
            src="/images/svg/upload-icon.svg"
            className="img-fluid u-image"
          />
        </button>
        <button
          type="button"
          className="uploadWrapper__btn--deleteBtn"
          onClick={handleDeleteFile}
        >
          <img
            width="20"
            height="20"
            alt="Delete"
            src="/images/svg/delete-icon.svg"
            className="img-fluid u-image"
          />
        </button>
      </div>
      

    </form>
  );
}
