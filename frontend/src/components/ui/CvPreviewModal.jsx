import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Download, FileText, AlertTriangle } from 'lucide-react';

const detectExtension = (url) => {
    if (!url) return '';
    try {
        const clean = url.split('?')[0].split('#')[0];
        const last = clean.substring(clean.lastIndexOf('.') + 1).toLowerCase();
        return ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'].includes(last) ? last : '';
    } catch {
        return '';
    }
};

export const CvPreviewModal = ({ isOpen, cvUrl, applicantName, onClose }) => {
    const { t } = useTranslation();
    const [loadFailed, setLoadFailed] = useState(false);
    const ext = detectExtension(cvUrl);

    useEffect(() => {
        if (isOpen) setLoadFailed(false);
    }, [isOpen, cvUrl]);

    if (!isOpen || !cvUrl) return null;

    const isPdf = ext === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
    const isDoc = ['doc', 'docx'].includes(ext);

    // Google Docs Viewer for Word documents
    const docViewerSrc = isDoc
        ? `https://docs.google.com/gview?url=${encodeURIComponent(cvUrl)}&embedded=true`
        : null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={applicantName ? `${t('view_cv', { defaultValue: 'View CV' })} — ${applicantName}` : t('view_cv', { defaultValue: 'View CV' })}
            size="lg"
        >
            <div className="flex flex-col py-1">
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <FileText size={14} className="text-[#8B1A1A]" />
                        {ext ? ext.toUpperCase() : t('document', { defaultValue: 'Document' })}
                    </span>
                    <div className="flex items-center gap-2">
                        <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <ExternalLink size={12} /> {t('open_in_new_tab', { defaultValue: 'Open in new tab' })}
                        </a>
                        <a
                            href={cvUrl}
                            download
                            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider px-3 py-1.5 bg-[#8B1A1A] text-white hover:bg-[#6e1515]"
                        >
                            <Download size={12} /> {t('download', { defaultValue: 'Download' })}
                        </a>
                    </div>
                </div>

                <div className="bg-[#FAF7F2] border border-gray-200 w-full" style={{ height: '70vh' }}>
                    {loadFailed ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                            <AlertTriangle size={32} className="text-[#8B1A1A]" />
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                                {t('cv_preview_failed', { defaultValue: 'Could not preview this document.' })}
                            </p>
                            <p className="text-xs text-gray-500 max-w-sm">
                                {t('cv_preview_failed_hint', { defaultValue: 'Use the buttons above to open or download the file.' })}
                            </p>
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={cvUrl}
                            title="CV Preview"
                            className="w-full h-full border-0"
                            onError={() => setLoadFailed(true)}
                        />
                    ) : isImage ? (
                        <div className="w-full h-full overflow-auto flex items-start justify-center bg-white">
                            <img
                                src={cvUrl}
                                alt="CV"
                                className="max-w-full"
                                onError={() => setLoadFailed(true)}
                            />
                        </div>
                    ) : isDoc ? (
                        <iframe
                            src={docViewerSrc}
                            title="CV Preview"
                            className="w-full h-full border-0"
                            onError={() => setLoadFailed(true)}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                            <FileText size={32} className="text-gray-400" />
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                                {t('cv_preview_unsupported', { defaultValue: 'Preview not available for this file type.' })}
                            </p>
                            <p className="text-xs text-gray-500 max-w-sm">
                                {t('cv_preview_failed_hint', { defaultValue: 'Use the buttons above to open or download the file.' })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-100 border border-gray-300 text-gray-700 text-xs px-6 py-2 uppercase tracking-widest hover:bg-gray-200 transition-colors font-bold"
                    >
                        {t('close').toUpperCase()}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
