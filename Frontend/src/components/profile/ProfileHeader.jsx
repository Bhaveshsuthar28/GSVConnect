import React from 'react';
import { ArrowLeft, User, Camera, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ 
  role, 
  theme, 
  toggleTheme, 
  imagePreview, 
  isEditing, 
  fileInputRef, 
  handleImageChange 
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {role === 'alumni' ? 'Alumni Profile' : 'Student Profile'}
              </h1>
            </div>
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
          </div>
        </div>
      </nav>

      <div className="h-32 sm:h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative rounded-t-3xl"></div>

      <div className="px-6 sm:px-10 relative">
        <div className="relative -mt-16 sm:-mt-20 mb-6 flex justify-between items-end">
            <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden bg-white dark:bg-slate-800 relative">
                    {imagePreview ? (
                        <img 
                            src={imagePreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500">
                            <User className="w-16 h-16" />
                        </div>
                    )}
                    
                    {isEditing && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    )}
                </div>
                {isEditing && (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors sm:hidden"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
