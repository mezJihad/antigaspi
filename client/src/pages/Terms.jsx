import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="mb-8">
                    <Link to="/register" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
                        <ArrowLeft size={20} className="mr-2" /> Retour à l'inscription
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Conditions Générales d'Utilisation (CGU)</h1>

                <div className="prose prose-green max-w-none text-gray-700 space-y-6">


                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Objet et Champ d'Application</h2>
                        <p>
                            Les présentes Conditions Générales ont pour objet de définir les modalités de mise à disposition des services de l'application <strong>Antigaspi</strong> (ci-après "la Plateforme") et les conditions d'utilisation du Service par les Utilisateurs (Acheteurs) et les Partenaires (Vendeurs).
                        </p>
                        <p>
                            La Plateforme est un service de mise en relation permettant à des commerçants de proposer des invendus alimentaires à prix réduit à des utilisateurs.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Rôle de la Plateforme (Intermédiaire)</h2>
                        <p><strong>Antigaspi agit en tant qu'intermédiaire technique.</strong></p>
                        <p>
                            La Plateforme héberge les offres des Partenaires mais <strong>n'est pas le vendeur des produits</strong>.
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Le contrat de vente des produits est conclu exclusivement et directement entre le Partenaire (Vendeur) et l'Utilisateur.</li>
                            <li>Antigaspi ne peut être tenu responsable de la qualité, de la sécurité, de la comestibilité ou de la conformité des produits vendus par les Partenaires.</li>
                            <li>Antigaspi n'exerce aucun contrôle sur les produits remis aux Utilisateurs.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Accès au Service</h2>
                        <p>
                            L'accès à la Plateforme est gratuit pour les Utilisateurs.
                            L'accès pour les Partenaires (Vendeurs) est soumis à inscription et validation par l'administrateur de la Plateforme.
                        </p>
                        <p>
                            Antigaspi se réserve le droit de refuser, suspendre ou supprimer tout compte ne respectant pas les présentes conditions, sans indemnité.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Obligations des Parties</h2>

                        <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">4.1 Obligations des Partenaires (Vendeurs)</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Le Partenaire s'engage à remettre des produits propres à la consommation, respectant les dates limites de consommation (DLC/DDM) et les normes d'hygiène en vigueur.</li>
                            <li>Le Partenaire est seul responsable des informations fournies dans ses offres (description, allergènes, prix).</li>

                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">4.2 Obligations des Utilisateurs (Acheteurs)</h3>
                        <ul className="list-disc pl-5 space-y-1">

                            <li>L'Utilisateur doit vérifier la marchandise lors de la collecte. Toute réclamation concernant le produit doit être adressée directement au Partenaire.</li>
                        </ul>
                    </section>


                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Modération et Signalement</h2>
                        <p>
                            Bien que les litiges commerciaux (remboursement, échange) doivent être réglés directement entre l'Acheteur et le Vendeur, Antigaspi met à disposition un outil de signalement.
                        </p>
                        <p className="mt-2">
                            Antigaspi se réserve le droit de <strong>suspendre ou de bannir définitivement</strong> tout Partenaire vendeur en cas de :
                        </p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Signalements répétés de la part des utilisateurs concernant la qualité des produits.</li>
                            <li>Manquement grave aux règles d'hygiène ou de sécurité.</li>
                            <li>Comportement frauduleux ou inapproprié.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Responsabilité</h2>
                        <p>Antigaspi décline toute responsabilité en cas de :</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Intoxication alimentaire ou problème de santé lié à la consommation des produits (la responsabilité incombant au Partenaire Vendeur).</li>
                            <li>Indisponibilité de la Plateforme pour des raisons techniques (maintenance, panne).</li>
                            <li>Litige entre un Utilisateur et un Partenaire (bien que la Plateforme puisse proposer un service de médiation à sa discrétion).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Propriété Intellectuelle</h2>
                        <p>
                            Tous les éléments de la Plateforme (textes, graphismes, logos, logiciels, codes sources) sont la propriété exclusive de l'éditeur du site Antigaspi. Toute reproduction ou exploitation non autorisée est interdite.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Données Personnelles</h2>
                        <p>
                            La Plateforme collecte et traite des données personnelles (Nom, Email, Localisation) pour le bon fonctionnement du service. Ces données ne sont transmises aux Partenaires que dans la stricte nécessité du traitement de la commande.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">8. Droit Applicable</h2>
                        <p>
                            Les présentes conditions sont soumises au droit local en vigueur. Tout litige relatif à leur interprétation relève des tribunaux compétents.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
