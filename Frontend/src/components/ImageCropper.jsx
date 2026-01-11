import React from 'react';
import Cropper from 'react-easy-crop';

const ImageCropper = ({ image, crop, zoom, onCropChange, onZoomChange, onCropComplete }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Crop your photo</h3>
          <span className="text-sm text-slate-500">Drag to position, scroll to zoom</span>
        </div>
        <div className="flex-1 relative bg-slate-900/80">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
