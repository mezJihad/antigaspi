import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

const Terms = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    return (
        <div className={`min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="mb-8">
                    <Link to="/register" className={`inline-flex items-center text-green-600 hover:text-green-700 font-medium`}>
                        <ArrowLeft size={20} className={`${isRtl ? 'ml-2 rotate-180' : 'mr-2'}`} /> {t('terms.back_to_register')}
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">{t('terms.page_title')}</h1>

                <div className="prose prose-green max-w-none text-gray-700 space-y-6">

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.object.title')}</h2>
                        <p>
                            <Trans i18nKey="terms.sections.object.content_1" components={{ strong: <strong /> }} />
                        </p>
                        <p>{t('terms.sections.object.content_2')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.role.title')}</h2>
                        <p><strong>{t('terms.sections.role.subtitle')}</strong></p>
                        <p>
                            <Trans i18nKey="terms.sections.role.content_1" components={{ strong: <strong /> }} />
                        </p>
                        <ul className={`list-disc mt-2 space-y-1 ${isRtl ? 'pr-5' : 'pl-5'}`}>
                            <li>{t('terms.sections.role.list.item_1')}</li>
                            <li>{t('terms.sections.role.list.item_2')}</li>
                            <li>{t('terms.sections.role.list.item_3')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.access.title')}</h2>
                        <p>{t('terms.sections.access.content_1')}</p>
                        <p>{t('terms.sections.access.content_2')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.obligations.title')}</h2>

                        <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{t('terms.sections.obligations.partners.title')}</h3>
                        <ul className={`list-disc space-y-1 ${isRtl ? 'pr-5' : 'pl-5'}`}>
                            <li>{t('terms.sections.obligations.partners.list.item_1')}</li>
                            <li>{t('terms.sections.obligations.partners.list.item_2')}</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{t('terms.sections.obligations.users.title')}</h3>
                        <ul className={`list-disc space-y-1 ${isRtl ? 'pr-5' : 'pl-5'}`}>
                            <li>{t('terms.sections.obligations.users.list.item_1')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.moderation.title')}</h2>
                        <p>{t('terms.sections.moderation.content_1')}</p>
                        <p className="mt-2">
                            <Trans i18nKey="terms.sections.moderation.content_2" components={{ strong: <strong /> }} />
                        </p>
                        <ul className={`list-disc mt-1 space-y-1 ${isRtl ? 'pr-5' : 'pl-5'}`}>
                            <li>{t('terms.sections.moderation.list.item_1')}</li>
                            <li>{t('terms.sections.moderation.list.item_2')}</li>
                            <li>{t('terms.sections.moderation.list.item_3')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.liability.title')}</h2>
                        <p>{t('terms.sections.liability.content_1')}</p>
                        <ul className={`list-disc mt-2 space-y-1 ${isRtl ? 'pr-5' : 'pl-5'}`}>
                            <li>{t('terms.sections.liability.list.item_1')}</li>
                            <li>{t('terms.sections.liability.list.item_2')}</li>
                            <li>{t('terms.sections.liability.list.item_3')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.ip.title')}</h2>
                        <p>{t('terms.sections.ip.content_1')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.data.title')}</h2>
                        <p>{t('terms.sections.data.content_1')}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.sections.law.title')}</h2>
                        <p>{t('terms.sections.law.content_1')}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
