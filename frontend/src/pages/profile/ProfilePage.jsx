import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../api/services';
import toast from 'react-hot-toast';
const defaultAvatar = 'https://res.cloudinary.com/dedoxaqug/image/upload/v1774887841/ruralwork/defaults/default_avatar.png';
import {
    Camera, Trash2, User, Phone, MapPin, FileText,
    Mail, Shield, Calendar, Edit3, Save, X, CheckCircle, CreditCard
} from 'lucide-react';

const DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy',
    'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
    'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const profileSchema = yup.object({
    name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters').max(60, 'Name must be at most 60 characters').trim(),
    phone: yup.string().nullable().transform(v => v === '' ? null : v).matches(/^[0-9+\-\s()]{7,20}$/, { message: 'Enter a valid phone number (7–20 digits)', excludeEmptyString: true }),
    district: yup.string().nullable().transform(v => v === '' ? null : v),
    nic: yup.string().nullable().transform(v => v === '' ? null : v).matches(/^(?:\d{9}[vVxX]|\d{12})$/, { message: 'Enter a valid Sri Lankan NIC', excludeEmptyString: true }),
    bio: yup.string().nullable().transform(v => v === '' ? null : v).max(500, 'Bio cannot exceed 500 characters'),
});

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [deletingPhoto, setDeletingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [bioLength, setBioLength] = useState(user?.bio?.length || 0);
    const fileInputRef = useRef(null);

    const { register, handleSubmit, reset, formState: { errors, isDirty }, watch } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
            nic: user?.nic || '',
            district: user?.district || '',
            bio: user?.bio || '',
        },
    });

    // Watch bio for character counter
    const bioValue = watch('bio');
    useEffect(() => {
        setBioLength(bioValue?.length || 0);
    }, [bioValue]);

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            toast.error('Only JPG, PNG, or WEBP images allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
        handlePhotoUpload(file);
    };

    const handlePhotoUpload = async (file) => {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('profilePicture', file);
        try {
            const res = await profileAPI.uploadProfilePicture(formData);
            const newUrl = res.data?.data?.profilePicture || res.data?.profilePicture;
            updateUser({ ...user, profilePicture: newUrl });
            setPhotoPreview(null);
            toast.success('Profile picture updated!');
        } catch (err) {
            setPhotoPreview(null);
            toast.error(err.response?.data?.message || 'Upload failed.');
        } finally {
            setUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeletePhoto = async () => {
        if (!user?.profilePicture) return;
        if (!window.confirm('Remove your profile picture?')) return;
        setDeletingPhoto(true);
        try {
            await profileAPI.deleteProfilePicture();
            updateUser({ ...user, profilePicture: defaultAvatar });
            toast.success('Profile picture removed (reset to default).');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not remove photo.');
        } finally {
            setDeletingPhoto(false);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const res = await profileAPI.updateProfile(data);
            const updated = res.data?.data?.user || res.data?.user;
            updateUser(updated);
            reset({
                name: updated.name || '',
                phone: updated.phone || '',
                nic: updated.nic || '',
                district: updated.district || '',
                bio: updated.bio || '',
            });
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        reset({
            name: user?.name || '',
            phone: user?.phone || '',
            nic: user?.nic || '',
            district: user?.district || '',
            bio: user?.bio || '',
        });
        setIsEditing(false);
    };

    const inputCls = (err) => `border border-gray-300 pl-9 pr-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white ${err ? 'border-red-400' : ''}`;

    const roleBadge = {
        JOB_SEEKER: 'bg-[#E2B325] text-[#8B1A1A]',
        EMPLOYER: 'bg-[#1A1A1A] text-white',
        ADMIN: 'bg-[#8B1A1A] text-white',
    };

    return (
        <>
            {/* Action Buttons */}
            <div className="mb-6 flex justify-end gap-3">
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-[#E2B325] text-[#8B1A1A] text-sm font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#d4a420]">
                        <Edit3 className="h-4 w-4" /> EDIT PROFILE
                    </button>
                ) : (
                    <button onClick={handleCancelEdit} className="flex items-center gap-2 border border-gray-300 text-gray-600 bg-white text-sm uppercase tracking-wider px-4 py-2.5 hover:bg-gray-50 shadow-sm">
                        <X className="h-4 w-4" /> CANCEL
                    </button>
                )}
            </div>

            {/* Main Content: 2 column grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT: Profile Picture Card */}
                <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className="bg-[#8B1A1A] px-5 py-3">
                        <h2 className="text-white text-sm font-bold uppercase tracking-widest">Profile Picture</h2>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                        {/* Avatar */}
                        <div className="relative inline-block">
                            {(photoPreview || user?.profilePicture) ? (
                                <img src={photoPreview || user.profilePicture} alt="Profile" className="h-32 w-32 object-cover rounded-full border-4 border-[#E2B325] bg-white shadow-md" />
                            ) : (
                                <img src={defaultAvatar} alt="Default Profile" className="h-32 w-32 object-cover rounded-full border-4 border-[#E2B325] bg-white shadow-md" />
                            )}
                            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                                className="absolute bottom-1 right-1 bg-[#E2B325] text-[#8B1A1A] p-2 rounded-full border-2 border-white hover:bg-[#d4a420] transition-colors" title="Change photo">
                                {uploadingPhoto ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-[#8B1A1A] border-t-transparent rounded-full" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />

                        <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#1A1A1A] mt-4 text-center">{user?.name}</h2>
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest mt-1 ${roleBadge[user?.role] || 'bg-gray-200 text-gray-600'}`}>
                            {user?.role?.replace('_', ' ')}
                        </span>

                        {/* Photo action buttons */}
                        <div className="flex flex-col gap-2 w-full mt-5">
                            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                                className="w-full border border-[#8B1A1A] text-[#8B1A1A] text-xs uppercase tracking-wider py-2 hover:bg-[#8B1A1A] hover:text-white transition-colors flex items-center justify-center gap-2">
                                <Camera className="h-3.5 w-3.5" />
                                {uploadingPhoto ? 'UPLOADING...' : 'CHANGE PHOTO'}
                            </button>
                            {user?.profilePicture && (
                                <button onClick={handleDeletePhoto} disabled={deletingPhoto}
                                    className="w-full border border-red-300 text-red-400 text-xs uppercase tracking-wider py-2 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {deletingPhoto ? 'REMOVING...' : 'REMOVE PHOTO'}
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-300 text-center mt-3">JPG, PNG or WEBP · Max 5MB · 400×400px recommended</p>

                        {/* Divider + Account info */}
                        <div className="border-t border-gray-100 mt-5 pt-5 w-full">
                            {[
                                { icon: Mail, label: 'Email', value: user?.email },
                                { icon: Shield, label: 'Role', value: user?.role?.replace('_', ' ') },
                                { icon: Calendar, label: 'Member Since', value: fmtDate(user?.createdAt) },
                                { icon: CheckCircle, label: 'Status', value: user?.status, color: user?.status === 'ACTIVE' ? '#16a34a' : '#dc2626' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                    <item.icon className="h-4 w-4 text-[#8B1A1A] flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
                                        <p className="text-sm font-medium text-[#1A1A1A]" style={item.color ? { color: item.color } : {}}>{item.value || '—'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Profile Details Card */}
                <div className="md:col-span-2 bg-white border border-gray-200 overflow-hidden">
                    <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                        <h2 className="text-white text-sm font-bold uppercase tracking-widest">Personal Information</h2>
                        {isEditing && (
                            <span className="text-[#E2B325] text-xs">
                                {isDirty ? '● Unsaved changes' : '✓ Up to date'}
                            </span>
                        )}
                    </div>
                    <div className="p-6">
                        {!isEditing ? (
                            /* VIEW MODE */
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    {[
                                        { icon: User, label: 'Full Name', value: user?.name },
                                        { icon: Phone, label: 'Phone', value: user?.phone },
                                        { icon: CreditCard, label: 'National ID (NIC)', value: user?.nic },
                                        { icon: MapPin, label: 'District', value: user?.district },
                                    ].map(field => (
                                        <div key={field.label} className="flex flex-col py-4 border-b border-gray-100">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">{field.label}</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">
                                                {field.value || <span className="text-gray-300 italic">Not provided</span>}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Bio / About Me</span>
                                    <div className="text-sm text-gray-600 leading-relaxed bg-[#FAF7F2] p-4">
                                        {user?.bio || <span className="text-gray-300 italic">No bio added yet.</span>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* EDIT MODE */
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Full Name <span className="text-[#8B1A1A]">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <input {...register('name')} type="text" placeholder="Your full name" className={inputCls(errors.name)} />
                                        </div>
                                        {errors.name && <p className="text-xs text-[#8B1A1A] mt-0.5">{errors.name.message}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <input {...register('phone')} type="tel" placeholder="+94 71 234 5678" className={inputCls(errors.phone)} />
                                        </div>
                                        {errors.phone && <p className="text-xs text-[#8B1A1A] mt-0.5">{errors.phone.message}</p>}
                                    </div>

                                    {/* NIC */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">National ID (NIC)</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <input {...register('nic')} type="text" placeholder="e.g. 199912345678 or 987654321V" className={inputCls(errors.nic)} />
                                        </div>
                                        {errors.nic && <p className="text-xs text-[#8B1A1A] mt-0.5">{errors.nic.message}</p>}
                                    </div>

                                    {/* District */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">District</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <select {...register('district')} className={`${inputCls(errors.district)} cursor-pointer appearance-none`}>
                                                <option value="">Select district...</option>
                                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        {errors.district && <p className="text-xs text-[#8B1A1A] mt-0.5">{errors.district.message}</p>}
                                    </div>

                                    {/* Email (read-only) */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Email Address <span className="text-gray-300 ml-1 normal-case">(cannot change)</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-300" />
                                            <input type="email" value={user?.email || ''} disabled className="border border-gray-200 pl-9 pr-4 py-2.5 text-sm w-full bg-gray-50 text-gray-400 cursor-not-allowed" />
                                        </div>
                                        <p className="text-xs text-gray-300">Contact support to change your email address.</p>
                                    </div>

                                    {/* Bio (full width) */}
                                    <div className="md:col-span-2 flex flex-col gap-1">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 flex justify-between">
                                            <span>Bio / About Me <span className="text-gray-300 ml-1 normal-case">(optional)</span></span>
                                            <span className={`text-xs ${bioLength > 450 ? 'text-[#8B1A1A]' : 'text-gray-300'}`}>{bioLength}/500</span>
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <textarea {...register('bio')} rows={4}
                                                placeholder={user?.role === 'EMPLOYER' ? 'Tell job seekers about yourself as an employer...' : 'Tell employers about your skills and experience...'}
                                                className="border border-gray-300 pl-9 pr-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A] bg-white resize-y min-h-[100px]"
                                            />
                                        </div>
                                        {errors.bio && <p className="text-xs text-[#8B1A1A] mt-0.5">{errors.bio.message}</p>}
                                    </div>
                                </div>

                                {/* Form Footer */}
                                <div className="border-t border-gray-200 pt-5 mt-5 flex items-center justify-between">
                                    <p className="text-xs text-gray-400">* Required fields</p>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={handleCancelEdit} className="border border-gray-300 text-gray-600 text-sm uppercase tracking-wider px-5 py-2.5 hover:bg-gray-50 flex items-center gap-2">
                                            <X className="h-4 w-4" /> CANCEL
                                        </button>
                                        <button type="submit" disabled={saving || !isDirty}
                                            className="bg-[#8B1A1A] text-white text-sm uppercase tracking-wider px-6 py-2.5 hover:bg-[#6e1515] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                            {saving ? (
                                                <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> SAVING...</>
                                            ) : (
                                                <><Save className="h-4 w-4" /> SAVE CHANGES</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
