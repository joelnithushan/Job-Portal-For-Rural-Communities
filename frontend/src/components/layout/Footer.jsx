import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-[#1A1A1A] text-white/60 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4">

                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-8">
                    <div className="max-w-xs">
                        <img src="/logo.png" alt="NextEra" className="h-14 w-auto object-contain brightness-0 invert mb-3" />
                        <p className="text-sm leading-relaxed text-white/50">
                            {t('footer_tagline')}
                        </p>
                    </div>

                    <div className="flex flex-1 flex-col sm:flex-row justify-end gap-12 md:gap-24">
                        <div className="pt-2">
                            <h4 className="text-white text-xs tracking-[0.2em] uppercase font-bold mb-4">{t('footer_seekers')}</h4>
                            <ul className="flex flex-col gap-2 text-sm">
                                <li><Link to="/jobs" className="hover:text-[#E2B325] transition-colors">{t('footer_browse')}</Link></li>
                                <li><Link to="/register" className="hover:text-[#E2B325] transition-colors">{t('footer_create_acc')}</Link></li>
                            </ul>
                        </div>

                        <div className="pt-2">
                            <h4 className="text-white text-xs tracking-[0.2em] uppercase font-bold mb-4">{t('footer_employers')}</h4>
                            <ul className="flex flex-col gap-2 text-sm">
                                <li><Link to="/register" className="hover:text-[#E2B325] transition-colors">{t('footer_post_job')}</Link></li>
                                <li><Link to="/companies" className="hover:text-[#E2B325] transition-colors">{t('footer_directory')}</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
                    <p>{t('footer_copyright', { year: new Date().getFullYear() })}</p>
                    <div className="flex gap-6 sm:mr-16">
                        <a href="#" className="hover:text-white transition-colors">{t('footer_privacy')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('footer_terms')}</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};
