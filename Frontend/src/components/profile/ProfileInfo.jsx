import React from 'react';
import { Mail, BookOpen, Calendar, Shield, Linkedin, Award, GraduationCap, FileText, Upload } from 'lucide-react';

const ReadOnlyField = ({ label, value, icon: Icon, note }) => (
  <div className="group relative">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-800 rounded-xl opacity-50 blur transition duration-200"></div>
    <div className="relative bg-gray-50 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-slate-400">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center justify-between">
         <p className="text-gray-700 dark:text-slate-200 font-medium truncate pr-4">{value || 'N/A'}</p>
         <Shield className="w-3 h-3 text-gray-400" />
      </div>
      {note && <p className="text-[10px] text-gray-400 mt-1">{note}</p>}
    </div>
  </div>
);

const ProfileInfo = ({ 
  user, 
  role, 
  isEditing, 
  formData, 
  setFormData,
  handleProofChange,
  proofName
}) => {
  return (
    <div className="space-y-8 px-6 pb-10">
      <div>
         {isEditing ? (
              <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                  <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full pb-2 placeholder-gray-300 dark:placeholder-slate-600"
                      placeholder="Your Name"
                  />
              </div>
         ) : (
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
         )}
         <p className="text-indigo-600 dark:text-indigo-400 font-medium capitalize mt-1 flex items-center gap-1.5">
             <Shield className="w-4 h-4" />
             {role === 'alumni' ? 'Alumni Account' : 'Student Account'}
         </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
          {/* Common Fields */}
          <ReadOnlyField 
            label="Email Address" 
            value={user.email} 
            icon={Mail}
            note="Verified Contact" 
          />
          
          <ReadOnlyField 
            label="Joined On" 
            value={new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} 
            icon={Calendar} 
          />

          {/* Student Specific */}
          {role === 'student' && (
               <ReadOnlyField 
                 label="Academic ID" 
                 value={user.email.split('@')[0].split('_')[1]?.toUpperCase() || 'N/A'} 
                 icon={BookOpen}
                 note="Derived from Email"
               />
          )}

          {/* Alumni Specific - Editable Fields */}
          {role === 'alumni' && (
            <>
                {/* Graduation Year */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Graduation Batch</span>
                    </div>
                    {isEditing ? (
                        <input
                            type="number"
                            value={formData.graduationYear}
                            onChange={(e) => setFormData(prev => ({ ...prev, graduationYear: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="e.g. 2023"
                        />
                    ) : (
                         <p className="text-gray-900 dark:text-white font-medium">
                             {user.verification?.graduationYear || formData.graduationYear || 'Not set'}
                         </p>
                    )}
                </div>

                {/* Degree */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                        <Award className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Degree</span>
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.degree}
                            onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="e.g. B.Tech CSE"
                        />
                    ) : (
                         <p className="text-gray-900 dark:text-white font-medium">
                             {user.verification?.degree || formData.degree || 'Not set'}
                         </p>
                    )}
                </div>

                {/* LinkedIn */}
                <div className="col-span-1 sm:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                        <Linkedin className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">LinkedIn Profile</span>
                    </div>
                    {isEditing ? (
                        <input
                            type="url"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="https://linkedin.com/in/..."
                        />
                    ) : (
                         <a 
                             href={user.verification?.linkedinUrl || formData.linkedinUrl} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-blue-600 hover:underline truncate block"
                         >
                             {user.verification?.linkedinUrl || formData.linkedinUrl || 'Not set'}
                         </a>
                    )}
                </div>

                 {/* Proof Document Upload */}
                 <div className="col-span-1 sm:col-span-2 bg-amber-50 dark:bg-slate-800/50 p-4 rounded-xl border border-amber-200 dark:border-slate-700 border-dashed">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Verification Proof</span>
                        </div>
                        {user.verification?.proofUrl && <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">Uploaded</span>}
                    </div>
                    {isEditing ? (
                         <div className="mt-2">
                             <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-indigo-300 border-dashed rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                                 <div className="flex items-center gap-2">
                                     <Upload className="w-5 h-5 text-indigo-500" />
                                     <span className="text-sm text-gray-600 dark:text-gray-300">
                                         {proofName ? proofName : "Upload ID / Degree Proof"}
                                     </span>
                                 </div>
                                 <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleProofChange} />
                             </label>
                             <p className="text-[10px] text-gray-400 mt-1 pl-1">Accepted: PDF, JPG, PNG</p>
                         </div>
                    ) : (
                         <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                             {user.verification?.proofUrl ? "Proof document on file." : "No proof document uploaded yet."}
                         </div>
                    )}
                </div>
            </>
          )}
      </div>
    </div>
  );
};

export default ProfileInfo;
