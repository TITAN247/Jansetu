import React, { useState } from 'react';

const UploadImage = ({ onImageUpload }) => {
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onImageUpload(file);
        }
    };

    return (
        <div className="upload-image">
            <label htmlFor="file-upload" className="custom-file-upload">
                Drag & Drop or Click to Upload Image
            </label>
            <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
                <div className="image-preview">
                    <img src={preview} alt="Preview" />
                    <button onClick={() => setPreview(null)}>Remove</button>
                </div>
            )}
        </div>
    );
};

export default UploadImage;
