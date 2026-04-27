import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ImageIcon, Trash2, Plus, RefreshCw, Save, ArrowLeft, AlertTriangle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { postersAPI, companiesAPI } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DISTRICTS, CATEGORIES, JOB_TYPES, JOB_TYPE_LABELS } from '../../utils/constants';

const SectionCard = ({ children, title, rightSlot, className = '' }) => (
    <div className={`bg-white border border-gray-200 overflow-hidden mb-6 ${className}`}>
        {title && (
            <div className="bg-[#8B1A1A] px-5 py-3 flex items-center justify-between">
                <h2 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-[#E2B325]" />
                    {title}
                </h2>
                {rightSlot && <span>{rightSlot}</span>}
            </div>
        )}
        <div className="p-5">{children}</div>
    </div>
);

const Field = ({ label, children }) => (
    <label className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
        {children}
    </label>
);

const inputCls =
    'w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-[#8B1A1A] bg-white';

export const MyPostersPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [posters, setPosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchMine = async () => {
        setLoading(true);
        try {
            const res = await postersAPI.getMine();
            setPosters(res.data?.posters || []);
        } catch {
            setPosters([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMine(); }, []);

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await postersAPI.delete(deleteId);
            toast.success(t('poster_deleted', { defaultValue: 'Poster deleted' }));
            setPosters(prev => prev.filter(p => p._id !== deleteId));
            setDeleteId(null);
        } catch {
            toast.error(t('poster_delete_failed', { defaultValue: 'Failed to delete poster' }));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <SectionCard
                title={t('my_posters', { defaultValue: 'AI Job Posters' })}
                rightSlot={
                    <Link to="/employer/posters/new">
                        <button className="bg-[#E2B325] text-[#8B1A1A] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 hover:brightness-110 flex items-center gap-1">
                            <Plus size={14} />
                            {t('create_poster', { defaultValue: 'Create Poster' })}
                        </button>
                    </Link>
                }
            >
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />)}
                    </div>
                ) : posters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <ImageIcon size={32} className="text-gray-300" />
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                            {t('no_posters_yet', { defaultValue: 'No posters yet' })}
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs">
                            {t('no_posters_desc', { defaultValue: 'Generate eye-catching AI job posters in seconds.' })}
                        </p>
                        <Link to="/employer/posters/new">
                            <Button className="mt-2 bg-[#8B1A1A] text-white border-[#8B1A1A] hover:bg-[#6e1515]" leftIcon={<Sparkles size={14} />}>
                                {t('create_first_poster', { defaultValue: 'Create your first poster' })}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {posters.map(p => (
                            <motion.div
                                key={p._id}
                                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                className="border border-gray-200 bg-[#FAF7F2] overflow-hidden flex flex-col"
                            >
                                <div className="aspect-[3/4] overflow-hidden bg-white">
                                    <img src={p.imageUrl} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                                </div>
                                <div className="p-3 flex-1 flex flex-col">
                                    <h3 className="font-bold text-sm text-[#1A1A1A] line-clamp-1">{p.title}</h3>
                                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                                        <MapPin size={11} />
                                        <span className="truncate">{[p.town, p.district].filter(Boolean).join(', ') || '-'}</span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 ${p.status === 'PUBLISHED' ? 'bg-[#E2B325] text-[#8B1A1A]' : 'bg-gray-200 text-gray-600'}`}>
                                            {p.status}
                                        </span>
                                        {p.jobType && (
                                            <span className="text-[9px] font-bold uppercase tracking-widest bg-[#8B1A1A]/10 text-[#8B1A1A] px-2 py-0.5">
                                                {JOB_TYPE_LABELS[p.jobType] || p.jobType}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Link to={`/posters/${p._id}`} className="flex-1">
                                            <Button size="sm" variant="outline" fullWidth className="border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white">
                                                {t('view', { defaultValue: 'View' })}
                                            </Button>
                                        </Link>
                                        <button
                                            onClick={() => setDeleteId(p._id)}
                                            className="p-2 border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-600 transition-colors"
                                            title={t('delete', { defaultValue: 'Delete' })}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </SectionCard>

            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title={t('delete_poster', { defaultValue: 'Delete Poster' })}
                size="sm"
            >
                <div className="flex flex-col py-1">
                    <p className="text-sm text-gray-700 mb-6 flex gap-2 items-start">
                        <AlertTriangle size={16} className="text-[#8B1A1A] mt-0.5" />
                        {t('delete_poster_confirm', { defaultValue: 'Are you sure you want to delete this poster? This cannot be undone.' })}
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
                            {t('cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button variant="primary" onClick={confirmDelete} loading={deleting} className="bg-[#8B1A1A] border-[#8B1A1A] hover:bg-[#6e1515]">
                            {t('delete', { defaultValue: 'Delete' })}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export const CreatePosterPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        district: '',
        town: '',
        jobType: 'FULL_TIME',
        salaryMin: '',
        salaryMax: '',
        contactPhone: '',
        contactEmail: '',
        tags: '',
        stylePreset: 'CLASSIC',
    });

    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generated, setGenerated] = useState(null); // { imageUrl, imagePublicId, prompt }

    useEffect(() => {
        (async () => {
            try {
                const res = await companiesAPI.getMyCompany();
                const company = res.data?.company || res.data;
                if (company) {
                    setForm(prev => ({
                        ...prev,
                        district: prev.district || company.district || '',
                        town: prev.town || company.town || '',
                        contactPhone: prev.contactPhone || company.contactPhone || '',
                    }));
                }
            } catch { /* ignore */ }
        })();
    }, []);

    const handleChange = (key) => (e) => {
        setForm(prev => ({ ...prev, [key]: e.target.value }));
    };

    const validateForGenerate = () => {
        if (!form.title || form.title.trim().length < 2) {
            toast.error(t('poster_title_required', { defaultValue: 'Job title is required' }));
            return false;
        }
        return true;
    };

    const validateForSave = () => {
        if (!validateForGenerate()) return false;
        if (!form.description || form.description.trim().length < 10) {
            toast.error(t('poster_description_required', { defaultValue: 'Description must be at least 10 characters' }));
            return false;
        }
        if (!form.contactPhone || !/^(?:\+94|0)[0-9]{9}$/.test(form.contactPhone)) {
            toast.error(t('valid_phone_required', { defaultValue: 'Enter a valid Sri Lankan phone number' }));
            return false;
        }
        if (!generated?.imageUrl) {
            toast.error(t('generate_first', { defaultValue: 'Generate a poster image first' }));
            return false;
        }
        return true;
    };

    const handleGenerate = async () => {
        if (!validateForGenerate()) return;
        setGenerating(true);
        try {
            const payload = {
                title: form.title.trim(),
                category: form.category || undefined,
                district: form.district || undefined,
                town: form.town || undefined,
                jobType: form.jobType || undefined,
                salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
                salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
                contactPhone: form.contactPhone || undefined,
                contactEmail: form.contactEmail || undefined,
                tags: form.tags
                    ? form.tags.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10)
                    : [],
                stylePreset: form.stylePreset,
            };
            const res = await postersAPI.generate(payload);
            const data = res.data || {};
            if (!data.imageUrl) throw new Error('No image returned');
            setGenerated({ imageUrl: data.imageUrl, imagePublicId: data.imagePublicId, prompt: data.prompt });
            toast.success(t('poster_generated', { defaultValue: 'Poster generated!' }));
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || 'Failed to generate poster';
            toast.error(msg);
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!validateForSave()) return;
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category || undefined,
                district: form.district || undefined,
                town: form.town || undefined,
                jobType: form.jobType || undefined,
                salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
                salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
                contactPhone: form.contactPhone.trim(),
                tags: form.tags
                    ? form.tags.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10)
                    : [],
                stylePreset: form.stylePreset,
                prompt: generated.prompt,
                imageUrl: generated.imageUrl,
                imagePublicId: generated.imagePublicId,
                status: 'PUBLISHED',
            };
            await postersAPI.create(payload);
            toast.success(t('poster_published', { defaultValue: 'Poster published!' }));
            navigate('/employer/posters');
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to save poster';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <Link to="/employer/posters" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#8B1A1A] hover:underline">
                    <ArrowLeft size={14} />
                    {t('back_to_posters', { defaultValue: 'Back to posters' })}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <SectionCard title={t('create_poster', { defaultValue: 'Create AI Poster' })}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label={t('job_title', { defaultValue: 'Job Title' })}>
                            <input className={inputCls} value={form.title} onChange={handleChange('title')} placeholder="e.g. Farm Helper" />
                        </Field>

                        <Field label={t('category', { defaultValue: 'Category' })}>
                            <select className={inputCls} value={form.category} onChange={handleChange('category')}>
                                <option value="">{t('select_category', { defaultValue: 'Select category' })}</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>

                        <Field label={t('district', { defaultValue: 'District' })}>
                            <select className={inputCls} value={form.district} onChange={handleChange('district')}>
                                <option value="">{t('select_district', { defaultValue: 'Select district' })}</option>
                                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </Field>

                        <Field label={t('town', { defaultValue: 'Town' })}>
                            <input className={inputCls} value={form.town} onChange={handleChange('town')} placeholder="e.g. Negombo" />
                        </Field>

                        <Field label={t('job_type', { defaultValue: 'Job Type' })}>
                            <select className={inputCls} value={form.jobType} onChange={handleChange('jobType')}>
                                {JOB_TYPES.filter(j => j !== 'CASUAL').map(j => (
                                    <option key={j} value={j}>{JOB_TYPE_LABELS[j]}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label={t('style_preset', { defaultValue: 'Style' })}>
                            <select className={inputCls} value={form.stylePreset} onChange={handleChange('stylePreset')}>
                                <option value="CLASSIC">{t('style_classic', { defaultValue: 'Classic' })}</option>
                                <option value="MINIMAL">{t('style_minimal', { defaultValue: 'Minimal' })}</option>
                                <option value="VIBRANT">{t('style_vibrant', { defaultValue: 'Vibrant' })}</option>
                            </select>
                        </Field>

                        <Field label={t('salary_min', { defaultValue: 'Salary Min (LKR)' })}>
                            <input type="number" min="0" className={inputCls} value={form.salaryMin} onChange={handleChange('salaryMin')} />
                        </Field>

                        <Field label={t('salary_max', { defaultValue: 'Salary Max (LKR)' })}>
                            <input type="number" min="0" className={inputCls} value={form.salaryMax} onChange={handleChange('salaryMax')} />
                        </Field>

                        <Field label={t('contact_phone', { defaultValue: 'Contact Phone' })}>
                            <input className={inputCls} value={form.contactPhone} onChange={handleChange('contactPhone')} placeholder="+94 7XXXXXXXX" />
                        </Field>

                        <Field label={t('contact_email', { defaultValue: 'Contact Email (optional)' })}>
                            <input type="email" className={inputCls} value={form.contactEmail} onChange={handleChange('contactEmail')} placeholder="hr@company.lk" />
                        </Field>

                        <Field label={t('highlight_tags', { defaultValue: 'Highlights (comma-separated)' })}>
                            <input className={inputCls} value={form.tags} onChange={handleChange('tags')} placeholder="meals provided, transport, weekly pay" />
                        </Field>

                        <div className="sm:col-span-2">
                            <Field label={t('description', { defaultValue: 'Description' })}>
                                <textarea
                                    rows={4}
                                    className={inputCls}
                                    value={form.description}
                                    onChange={handleChange('description')}
                                    placeholder={t('description_placeholder', { defaultValue: 'Describe the role, responsibilities, and any requirements...' })}
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
                        <Button
                            onClick={handleGenerate}
                            loading={generating}
                            className="bg-[#8B1A1A] text-white border-[#8B1A1A] hover:bg-[#6e1515]"
                            leftIcon={generated ? <RefreshCw size={14} /> : <Sparkles size={14} />}
                        >
                            {generated
                                ? t('regenerate_poster', { defaultValue: 'Regenerate' })
                                : t('generate_poster', { defaultValue: 'Generate Poster' })}
                        </Button>
                        <Button
                            onClick={handleSave}
                            loading={saving}
                            disabled={!generated}
                            className="bg-[#E2B325] text-[#8B1A1A] border-[#E2B325] hover:brightness-110"
                            leftIcon={<Save size={14} />}
                        >
                            {t('publish_poster', { defaultValue: 'Publish Poster' })}
                        </Button>
                    </div>
                </SectionCard>

                {/* Preview */}
                <SectionCard title={t('preview', { defaultValue: 'Live Preview' })}>
                    <div className="aspect-[3/4] bg-[#FAF7F2] border border-gray-200 flex items-center justify-center overflow-hidden">
                        {generating ? (
                            <div className="flex flex-col items-center gap-3 text-gray-500">
                                <div className="animate-spin h-10 w-10 border-4 border-[#8B1A1A] border-t-[#E2B325]" />
                                <p className="text-xs uppercase tracking-widest">
                                    {t('generating_poster', { defaultValue: 'AI is creating your poster...' })}
                                </p>
                            </div>
                        ) : generated?.imageUrl ? (
                            <img src={generated.imageUrl} alt="Generated poster" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-400 px-6 text-center">
                                <ImageIcon size={42} className="text-gray-300" />
                                <p className="text-xs uppercase tracking-widest">
                                    {t('preview_empty', { defaultValue: 'Fill in the form and click generate' })}
                                </p>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                        {t('poster_ai_disclaimer', {
                            defaultValue: 'Powered by Google Nano Banana Pro. Generated posters are stored on our media CDN once you publish.',
                        })}
                    </p>
                </SectionCard>
            </div>
        </div>
    );
};
