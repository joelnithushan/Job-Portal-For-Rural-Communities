import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-[#1A1A1A] text-white/60 py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-2">
                        <img src="/logo.png" alt="NextEra" className="h-20 w-auto object-contain brightness-0 invert mb-4" />
                        <p className="text-sm leading-relaxed max-w-sm">
                            {t('footer_tagline')}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white text-xs tracking-widest uppercase font-semibold mb-4">{t('footer_seekers')}</h4>
                        <ul className="flex flex-col gap-2 text-sm">
                            <li><Link to="/jobs" className="hover:text-white transition-colors">{t('footer_browse')}</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">{t('footer_create_acc')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-xs tracking-widest uppercase font-semibold mb-4">{t('footer_employers')}</h4>
                        <ul className="flex flex-col gap-2 text-sm">
                            <li><Link to="/register" className="hover:text-white transition-colors">{t('footer_post_job')}</Link></li>
                            <li><Link to="/companies" className="hover:text-white transition-colors">{t('footer_directory')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
                    <p>{t('footer_copyright', { year: new Date().getFullYear() })}</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">{t('footer_privacy')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('footer_terms')}</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};
