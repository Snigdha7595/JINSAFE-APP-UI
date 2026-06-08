import { ChangeEvent, FC } from "react";
import { handleCopyPaste } from "@/config/globalUtils";

import { useState } from "react";

export default function FileUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [imageType, setImageType] = useState<string>(""); // e.g., "img", "svg", "png"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleImageTypeSelect = (type: string) => {
    setImageType(type);
    // You can use this value later when submitting
  };

  const handleDeleteFile = () => {
    setFile(null);
    (document.getElementById("myfile") as HTMLInputElement).value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic using file and imageType
    console.log("Uploading:", file);
    console.log("Selected type:", imageType);
  };

  return (
    <form onSubmit={handleSubmit} className="uploadWrapper">
      <div className="uploadWrapper__inputField">
        <label htmlFor="myfile">Upload Image</label>
        <input
          type="file"
          id="myfile"
          name="myfile"
          onChange={handleFileChange}
        />
      </div>

      {/*<div className="uploadWrapper__btn">
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
          className="uploadWrapper__btn--imgBtn"
          onClick={() => handleImageTypeSelect('img')}
        >
          img
        </button>

        <button
          type="button"
          className="uploadWrapper__btn--imgBtn"
          onClick={() => handleImageTypeSelect('svg')}
        >
          svg
        </button>

        <button
          type="button"
          className="uploadWrapper__btn--imgBtn"
          onClick={() => handleImageTypeSelect('png')}
        >
          png
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
      </div>*/}
    </form>
  );
}
