import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SiteDataProvider } from './context/SiteDataContext';
import { AboutPage } from './pages/AboutPage';
import { AccountStubPage } from './pages/AccountStubPage';
import { AdminPage } from './pages/AdminPage';
import { CataloguePage } from './pages/CataloguePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ContactPage } from './pages/ContactPage';
import { CuratedCollectionPage } from './pages/CuratedCollectionPage';
import { EnquiryListPage } from './pages/EnquiryListPage';
import { EnquirySubmitPage } from './pages/EnquirySubmitPage';
import { EnquiryThankYouPage } from './pages/EnquiryThankYouPage';
import { HomePage } from './pages/HomePage';
import { HowWholesaleWorksPage } from './pages/HowWholesaleWorksPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <SiteDataProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:category" element={<CollectionsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/new-arrivals" element={<CuratedCollectionPage mode="new-arrivals" />} />
          <Route path="/best-sellers" element={<CuratedCollectionPage mode="best-sellers" />} />
          <Route path="/how-wholesale-works" element={<HowWholesaleWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/enquiry" element={<EnquiryListPage />} />
          <Route path="/enquiry/submit" element={<EnquirySubmitPage />} />
          <Route path="/enquiry/thank-you" element={<EnquiryThankYouPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountStubPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </SiteDataProvider>
  );
}
