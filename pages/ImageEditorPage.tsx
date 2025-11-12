
import React, { useState, useCallback } from 'react';
import { editImageWithPrompt } from '../services/geminiService';

const ImageEditorPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageType, setOriginalImageType] = useState<string | null>(null);
  const [originalFileInfo, setOriginalFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedImage(null);
      setError(null);
      setOriginalImageType(file.type);
      setOriginalFileInfo({ name: file.name, size: file.size });
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setOriginalImage(null);
    setOriginalImageType(null);
    setOriginalFileInfo(null);
    setEditedImage(null);
    setError(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage || !prompt || !originalImageType) {
      setError('Please upload an image and enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const base64Data = originalImage.split(',')[1];
      const resultBase64 = await editImageWithPrompt(base64Data, originalImageType, prompt);
      setEditedImage(`data:${originalImageType};base64,${resultBase64}`);
    } catch (err) {
      setError('Failed to edit image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt, originalImageType]);
  
  const ImagePlaceholder: React.FC<{ onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ onFileChange }) => (
    <div className="w-full h-80 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <span>Upload an image to start</span>
        <input id="image-upload" type="file" accept="image/*" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={onFileChange} />
    </div>
  );

  const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Promotional Image Editor</h1>
        <p className="text-gray-500 mb-6">Use text prompts to modify images for your pharmacy's marketing needs.</p>

        <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Input Column */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Upload Original Image</h2>
                        <div className="relative">
                           {originalImage && originalFileInfo ? (
                                <div className="w-full h-80 border-2 border-dashed border-gray-200 rounded-lg flex flex-col justify-center items-center text-gray-500 bg-gray-50 p-4 relative">
                                    <img src={originalImage} alt="Preview" className="max-h-48 object-contain rounded-md mb-4" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-800 truncate max-w-xs" title={originalFileInfo.name}>{originalFileInfo.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(originalFileInfo.size)}</p>
                                    </div>
                                    <button onClick={handleRemoveImage} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full bg-white/50 hover:bg-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                           ) : (
                                <ImagePlaceholder onFileChange={handleFileChange} />
                           )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">2. Describe Your Edit</h2>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Add a retro filter', 'Make the background blurry', 'Add text: 50% OFF!'"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            rows={3}
                            disabled={!originalImage}
                        />
                    </div>
                    
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading || !originalImage || !prompt}
                        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                           'Generate Edited Image'
                        )}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                {/* Output Column */}
                <div className="space-y-6">
                   <h2 className="text-lg font-semibold text-gray-700 mb-2">3. Result</h2>
                    <div className="w-full h-80 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center bg-gray-50">
                        {isLoading && <span className="text-gray-500">Processing your image...</span>}
                        {!isLoading && editedImage && (
                            <img src={editedImage} alt="Edited" className="w-full h-full object-contain rounded-lg" />
                        )}
                        {!isLoading && !editedImage && (
                            <span className="text-gray-500 text-center px-4">Your generated image will appear here.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImageEditorPage;
