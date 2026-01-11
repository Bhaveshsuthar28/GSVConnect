import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
    Loader, Camera, MapPin,
    Briefcase, GraduationCap, ArrowLeft
} from 'lucide-react';

const BRANCH_MAP = {
    AIDS: "Artificial Intelligence and Data Science",
    ECE: "Electronics and Communication Engineering",
    EE: "Electrical Engineering",
    ME: "Mechanical Engineering",
    AE: "Aerospace Engineering",
};

const BRANCH_OPTIONS = Object.entries(BRANCH_MAP).map(([value, label]) => ({ value, label }));

const parseDegreeFromEmail = (email) => {
    // Extract alpha portion between underscore and trailing two-digit year, e.g. john.doe_btech24@gsv.ac.in -> btech
    const match = /_([a-zA-Z]+)\d{2}@gsv\.ac\.in$/.exec(email || "");
    return match ? match[1] : "";
};

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, role, isLoading, updateProfile } = useAuth();

    const previewUrlRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('About');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    graduationYear: '',
    degree: '',
    branch: '',
    linkedinUrl: '',
    companyName: '',
    portfolioUrl: '',
    cgpa: '',
    phone: '',
    address: '',
    profileImage: null,
    imagePreview: null,
        skillsInput: '',
        skills: [],
        proofDocument: null,
        proofName: '',
  });
    const [locationLoading, setLocationLoading] = useState(false);
    const fileInputRef = useRef(null);

  // Initialize data
  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            graduationYear: user.verification?.graduationYear || '',
            degree: role === 'student'
                ? (parseDegreeFromEmail(user.email) || '')
                : (user.verification?.degree || user.degree || ''),
            branch: role === 'alumni'
                ? (user.verification?.degree || '')
                : (user.branch || ''),
            linkedinUrl: user.verification?.linkedinUrl || '',
            companyName: user.companyName || '',
            portfolioUrl: user.portfolioUrl || '',
            cgpa: user.cgpa ?? '',
            phone: user.phone || '',
            address: user.address || '',
            imagePreview: user.profileImage || null, 
            profileImage: null,
                                                skills: Array.isArray(user.skills) ? user.skills : [],
                                                skillsInput: Array.isArray(user.skills) ? user.skills.join(', ') : '',
                        proofDocument: null,
                        proofName: '',
        }));
    }
    }, [user, role]); // Re-run when user or role changes

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Revoke previous object URL (only if we created it)
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }

        const objectUrl = URL.createObjectURL(file);
        previewUrlRef.current = objectUrl;
        setFormData((prev) => ({ ...prev, profileImage: file, imagePreview: objectUrl }));
    };

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }
        };
    }, []);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return;
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                    const data = await resp.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || '';
                    const state = data.address?.state || '';
                    const combined = [city, state].filter(Boolean).join(', ');
                    if (combined) {
                        setFormData((prev) => ({ ...prev, address: combined }));
                    }
                } catch (err) {
                    console.error('Failed to fetch location', err);
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                console.error('Geolocation error', err);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleProofChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                proofDocument: file,
                proofName: file.name,
            }));
        }
    };

    const commitSkillsFromInput = () => {
        setFormData((prev) => {
            const raw = prev.skillsInput || '';
            const parts = raw
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            const merged = Array.from(new Set([...(prev.skills || []), ...parts]));
            return { ...prev, skills: merged, skillsInput: merged.join(', ') };
        });
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commitSkillsFromInput();
        }
    };

    const handleSkillBlur = () => {
        commitSkillsFromInput();
    };

    const handleRemoveSkill = (skill) => {
        setFormData((prev) => {
            const filtered = (prev.skills || []).filter((s) => s.toLowerCase() !== skill.toLowerCase());
            return { ...prev, skills: filtered, skillsInput: filtered.join(', ') };
        });
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
        if (formData.linkedinUrl) {
            const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[-a-zA-Z0-9_.%]+\/?$/;
            if (!linkedInPattern.test(formData.linkedinUrl)) {
                alert('Please enter a valid LinkedIn profile URL.');
                return;
            }
        }
        if (role === 'student' && !formData.branch) {
            alert('Branch is required.');
            return;
        }
        const derivedDegree = role === 'student' ? parseDegreeFromEmail(user?.email) : (formData.branch || formData.degree);
        if (role === 'student' && !derivedDegree) {
            alert('Could not determine degree from email.');
            return;
        }
        if (role === 'student' && formData.cgpa !== '' && formData.cgpa !== null && formData.cgpa !== undefined) {
            const numCgpa = Number(formData.cgpa);
            if (Number.isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
                alert('CGPA must be between 0 and 10');
                return;
            }
        }
    const data = new FormData();
    commitSkillsFromInput();
    
    // Always append basic fields
    data.append('name', formData.name || '');
    
    // Optional contact fields - append empty string if cleared to ensure backend updates it
    data.append('phone', formData.phone || '');
    data.append('address', formData.address || '');
    data.append('portfolioUrl', formData.portfolioUrl || '');
    data.append('companyName', role === 'alumni' ? (formData.companyName || '') : '');
    if (role === 'student') {
        data.append('degree', derivedDegree || '');
        data.append('branch', formData.branch || '');
        data.append('cgpa', formData.cgpa === '' ? '' : formData.cgpa);
    }

    if (formData.profileImage) {
      data.append('profileImage', formData.profileImage);
    }

        if (formData.proofDocument && role === 'alumni') {
            data.append('proofDocument', formData.proofDocument);
        }
    
        // Alumni Specific Fields
    if (role === 'alumni') {
        data.append('graduationYear', formData.graduationYear || '');
        data.append('degree', formData.branch || formData.degree || '');
        data.append('linkedinUrl', formData.linkedinUrl || '');
    }

        if (formData.skillsInput !== undefined) {
            data.append('skills', (formData.skills || []).join(','));
        }

    try {
            await updateProfile(data);
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
        <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[80vh] border border-slate-300 dark:border-slate-800">
          
          {/* Left Column: Sidebar (30%) */}
          <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center md:items-start bg-white dark:bg-slate-900 z-10 transition-colors">
            
            {/* Profile Image */}
                <div className="relative group w-48 h-48 mb-8 mx-auto md:mx-0">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
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
                            <p className="text-sm text-slate-500">
                                {role === 'alumni' ? ((isEditing ? formData.companyName : user.companyName) || 'Company not set') : 'GSV University'}
                            </p>
                            {role === 'alumni' && user.verification?.degree && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase rounded">
                                    {user.verification.degree}
                                </span>
                            )}
                        </div>
                    </div>
                 </div>
               </div>

               {/* Sidebar Details: Skills */}
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skills</h3>
                 <div className="flex flex-wrap gap-2">
                    {Array.isArray(user.skills) && user.skills.length ? (
                        user.skills.map((skill) => (
                            <span key={skill} className="text-xs font-medium px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">No skills added</span>
                    )}
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
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{role === 'alumni' ? 'Alumni' : 'Student'}</span>
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
                                    graduationYear: user.verification?.graduationYear || '',
                                    degree: role === 'student' ? (parseDegreeFromEmail(user.email) || '') : (user.verification?.degree || user.degree || ''),
                                    branch: role === 'alumni'
                                        ? (user.verification?.degree || '')
                                        : (user.branch || ''),
                                    linkedinUrl: user.verification?.linkedinUrl || '',
                                    companyName: user.companyName || '',
                                    portfolioUrl: user.portfolioUrl || '',
                                    cgpa: user.cgpa ?? '',
                                    phone: user.phone || '',
                                    address: user.address || '',
                                    skills: Array.isArray(user.skills) ? user.skills : [],
                                    skillsInput: Array.isArray(user.skills) ? user.skills.join(', ') : '',
                                    imagePreview: user.profileImage || null,
                                    profileImage: null,
                                    proofDocument: null,
                                    proofName: '',
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
                                {isEditing ? (
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
                                {isEditing ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="relative w-full max-w-xs">
                                            <input 
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full pr-10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                                placeholder="City, State"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleUseCurrentLocation}
                                                disabled={locationLoading}
                                                className="absolute inset-y-0 right-1 px-2 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white disabled:opacity-60"
                                                aria-label="Use current city and state"
                                            >
                                                <MapPin className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">{user.address || 'Not provided'}</span>
                                )}

                                        <span className="font-bold text-slate-900 dark:text-white text-sm">Portfolio:</span>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={formData.portfolioUrl}
                                                onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                                                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                                placeholder="https://..."
                                            />
                                        ) : (
                                            <a 
                                              href={user.portfolioUrl || '#'} 
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-black dark:text-white font-medium text-sm hover:underline truncate"
                                            >
                                                {user.portfolioUrl || 'Not provided'}
                                            </a>
                                        )}

                                <span className="font-bold text-slate-900 dark:text-white text-sm">Skills:</span>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={formData.skillsInput}
                                            onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                                            onKeyDown={handleSkillKeyDown}
                                            onBlur={handleSkillBlur}
                                            className='text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none'
                                            placeholder="Type skills separated by commas, then Enter"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {(formData.skills || []).map((skill) => (
                                                <span key={skill} className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        aria-label={`Remove ${skill}`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(user.skills) && user.skills.length)
                                            ? user.skills.map((skill) => (
                                                <span key={skill} className="text-xs font-medium px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                                    {skill}
                                                </span>
                                            ))
                                            : <span className="text-slate-500 dark:text-slate-400 text-sm">Not provided</span>}
                                    </div>
                                )}
                                
                                {role === 'alumni' && (
                                    <>
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">Company:</span>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                                placeholder="Company name"
                                            />
                                        ) : (
                                            <span className="text-black dark:text-white font-medium text-sm">{user.companyName || 'Not provided'}</span>
                                        )}

                                        <span className="font-bold text-slate-900 dark:text-white text-sm">LinkedIn:</span>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={formData.linkedinUrl}
                                                onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                                                pattern="https?://(www\.)?linkedin\.com/(in|company)/[-a-zA-Z0-9_.%]+/?"
                                                title="Enter a valid LinkedIn profile URL"
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

                                                                {role === 'alumni' && (
                                                                    <>
                                                                        <span className="font-bold text-slate-900 dark:text-white text-sm">Verification Proof:</span>
                                                                        {isEditing ? (
                                                                            <div className="flex items-center gap-3">
                                                                                <label className="px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded cursor-pointer text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                                                                    Upload PDF / Image
                                                                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleProofChange} />
                                                                                </label>
                                                                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{formData.proofName || 'No file chosen'}</span>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-slate-500 dark:text-slate-400 text-sm">
                                                                                {user.verification?.proofUrl ? 'Proof on file' : 'Not provided'}
                                                                            </span>
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
                                <span className="text-slate-500 dark:text-slate-400 text-sm">{role === 'alumni' ? 'Alumni' : 'Student'}</span>

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

                                <span className="font-bold text-slate-900 dark:text-white text-sm">Branch:</span>
                                {isEditing ? (
                                    <select
                                        value={formData.branch}
                                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                    >
                                        <option value="" disabled>Select branch</option>
                                        {BRANCH_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                                        {user.verification?.degree
                                            ? (BRANCH_MAP[user.verification.degree] || user.verification.degree)
                                            : (BRANCH_MAP[user.branch] || user.branch || 'Not set')}
                                    </span>
                                )}

                                {role === 'student' && (
                                    <>
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">Batch:</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">{user.year || 'Not set'}</span>

                                        <span className="font-bold text-slate-900 dark:text-white text-sm">Degree:</span>
                                        {isEditing ? (
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">{formData.degree || 'Not set (from email)'}</span>
                                        ) : (
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">{user.degree || 'Not set'}</span>
                                        )}

                                        <span className="font-bold text-slate-900 dark:text-white text-sm">CGPA:</span>
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.01"
                                                value={formData.cgpa}
                                                onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                                                className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 w-32 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                                placeholder="0 - 10"
                                            />
                                        ) : (
                                            <span className="text-slate-500 dark:text-slate-400 text-sm">{user.cgpa === null || user.cgpa === undefined ? 'N/A' : user.cgpa}</span>
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
