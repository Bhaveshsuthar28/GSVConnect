import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../redux/slices/authSlice';
import { 
  Loader, Camera, MapPin, 
  Mail, Briefcase, GraduationCap, ArrowLeft,
  Globe, Phone
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, role, isLoading } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('About');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    graduationYear: '',
    degree: '',
    linkedinUrl: '',
    website: '',
    phone: '',
    address: '',
    profileImage: null,
    imagePreview: null,
  });

  const fileInputRef = useRef(null);

  // Initialize data
  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            graduationYear: user.verification?.graduationYear || '',
            degree: user.verification?.degree || '',
            linkedinUrl: user.verification?.linkedinUrl || '',
            website: user.website || '',
            phone: user.phone || '',
            address: user.address || '',
            imagePreview: user.profileImage || null, 
            profileImage: null,
        }));
    }
  }, [user]); // Depend only on user object to update form when user data changes (e.g. initial load or after update)

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Always append basic fields
    data.append('name', formData.name || '');
    
    // Optional contact fields - append empty string if cleared to ensure backend updates it
    data.append('phone', formData.phone || '');
    data.append('address', formData.address || '');
    data.append('website', formData.website || '');

    if (formData.profileImage) {
      data.append('profileImage', formData.profileImage);
    }
    
    // Alumni Specific Fields
    if (role === 'alumni') {
        data.append('graduationYear', formData.graduationYear || '');
        data.append('degree', formData.degree || '');
        data.append('linkedinUrl', formData.linkedinUrl || '');
    }

    try {
      await dispatch(updateProfile(data)).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      // You might want to show a toast/alert here
    }
  };

  if (!user && isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-black" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
      
      {/* Back to Home Button */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
        </button>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[80vh] border border-slate-100 dark:border-slate-800">
          
          {/* Left Column: Sidebar (30%) */}
          <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center md:items-start bg-white dark:bg-slate-900 z-10 transition-colors">
            
            {/* Profile Image */}
            <div className="relative group w-48 h-48 mb-8 mx-auto md:mx-0">
               <div className="w-full h-full rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800">
                 {formData.imagePreview ? (
                    <img 
                      src={formData.imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Camera size={48} />
                    </div>
                 )}
               </div>
               
               {isEditing && (
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                    <Camera className="text-white drop-shadow-md" />
                 </div>
               )}
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                  accept="image/*"
               />
            </div>

            {/* Sidebar Details: Work */}
            <div className="w-full space-y-6">
               <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Work / Education</h3>
                 
                 <div className="space-y-4">
                    {/* Item 1 */}
                    <div className="flex gap-3">
                        <div className="mt-1">
                            {role === 'alumni' ? <Briefcase className="w-4 h-4 text-black dark:text-white" /> : <GraduationCap className="w-4 h-4 text-black dark:text-white" />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                {role === 'alumni' ? 'Alumni' : 'Student'}
                            </p>
                            <p className="text-sm text-slate-500">GSV University</p>
                            {role === 'alumni' && user.verification?.degree && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase rounded">
                                    {user.verification.degree}
                                </span>
                            )}
                        </div>
                    </div>
                 </div>
               </div>

               {/* Sidebar Details: Skills (Static for now) */}
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skills</h3>
                 <div className="flex flex-wrap gap-2">
                    {['Communication', 'Leadership', 'Teamwork', 'Innovation'].map(skill => (
                        <span key={skill} className="text-xs font-medium px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                            {skill}
                        </span>
                    ))}
                 </div>
               </div>
            </div>
          </aside>

          {/* Right Column: Main Content (70%) */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
            
            {/* Header Area */}
            <div className="p-8 md:p-12 pb-0">
               <div className="flex justify-between items-start mb-6">
                 <div>
                        {isEditing ? (
                        <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                           className="text-4xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-black dark:border-white focus:outline-none placeholder-slate-300 w-full md:w-auto"
                           placeholder="Full Name"
                        />
                    ) : (
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{user.name}</h1>
                    )}
                    
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
                        {isEditing && role === 'alumni' ? (
                             <input
                                type="text"
                                value={formData.degree}
                                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                                placeholder="Degree / Job Title"
                                className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
                             />
                        ) : (
                             <span>{user.verification?.degree || (role === 'alumni' ? 'Alumni' : 'Student')}</span>
                        )}
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <MapPin className="w-3 h-3" />
                        <span>{user.address || 'Vadodara, India'}</span>
                    </div>
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-10">
                  {isEditing ? (
                      <>
                        <button 
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white px-8 py-3 rounded font-bold tracking-wide text-sm transition-all flex items-center gap-2"
                        >
                            {isLoading ? <Loader className="animate-spin w-4 h-4" /> : null}
                            Save Changes
                        </button>
                        <button 
                            onClick={() => {
                                setIsEditing(false);
                                setFormData(prev => ({
                                    ...prev,
                                    name: user.name,
                                    imagePreview: user.profileImage || null,
                                    profileImage: null,
                                }));
                            }}
                            className="px-8 py-3 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold tracking-wide text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            Cancel
                        </button>
                      </>
                  ) : (
                      <button 
                            onClick={() => setIsEditing(true)}
                            className="px-8 py-3 rounded bg-gray-100 dark:bg-slate-800 text-black dark:text-white font-bold tracking-wide text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            Edit Profile
                        </button>
                  )}
               </div>

               {/* Tabs */}
               <div className="flex gap-8 mt-6">
                   {['About'].map(tab => (
                       <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${
                              activeTab === tab 
                              ? 'text-slate-900 dark:text-white' 
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                       >
                          {tab}
                          {activeTab === tab && (
                              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-full"></div>
                          )}
                       </button>
                   ))}
               </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

            {/* Content Area */}
            <div className="p-8 md:p-12 bg-slate-50/50 dark:bg-slate-900/50 flex-1 transition-colors">
                
                {activeTab === 'About' && (
                    <div className="grid gap-12 max-w-3xl">
                        
                        {/* Contact Information */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Information</h3>
                            
                            <div className="grid grid-cols-[120px_1fr] gap-y-6 items-center">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">Phone:</span>
                                {isEditing && role === 'alumni' ? (
                                    <input 
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                        placeholder="+91..."
                                    />
                                ) : (
                                    <span className="text-black dark:text-white font-medium text-sm">{user.phone || 'Not provided'}</span>
                                )}

                                <span className="font-bold text-slate-900 dark:text-white text-sm">Address:</span>
                                {isEditing && role === 'alumni' ? (
                                    <input 
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                        placeholder="City, Country"
                                    />
                                ) : (
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">{user.address || 'Not provided'}</span>
                                )}

                                <span className="font-bold text-slate-900 dark:text-white text-sm">E-mail:</span>
                                <span className="text-black dark:text-white font-medium text-sm">{user.email}</span>

                                <span className="font-bold text-slate-900 dark:text-white text-sm">Site:</span>
                                {isEditing && role === 'alumni' ? (
                                    <input 
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                                        className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                        placeholder="https://..."
                                    />
                                ) : (
                                    <a 
                                      href={user.website || '#'} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-black dark:text-white font-medium text-sm hover:underline truncate"
                                    >
                                        {user.website || 'Not provided'}
                                    </a>
                                )}
                                
                                {role === 'alumni' && (
                                    <>
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">LinkedIn:</span>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={formData.linkedinUrl}
                                                onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                                                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        ) : (
                                            <a 
                                            href={user.verification?.linkedinUrl || '#'} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-black dark:text-white font-medium text-sm hover:underline truncate"
                                            >
                                                {user.verification?.linkedinUrl || 'Not provided'}
                                            </a>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Basic Information</h3>
                            
                            <div className="grid grid-cols-[120px_1fr] gap-y-6 items-center">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">Role:</span>
                                <span className="text-slate-500 dark:text-slate-400 text-sm capitalize">{role}</span>

                                <span className="font-bold text-slate-900 dark:text-white text-sm">Joined:</span>
                                <span className="text-slate-500 dark:text-slate-400 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                                
                                {role === 'alumni' && (
                                    <>
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">Graduation:</span>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={formData.graduationYear}
                                                onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                                                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-32 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                                placeholder="Year"
                                            />
                                        ) : (
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">
                                                {user.verification?.graduationYear || 'Not set'}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                )}



            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
