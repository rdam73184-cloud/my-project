import { useCallback, useState } from 'react';
import Nav from '../components/Nav.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Apps from '../components/Apps.jsx';
import AIProjects from '../components/AIProjects.jsx';
import Services from '../components/Services.jsx';
import FutureProjects from '../components/FutureProjects.jsx';
import Gallery from '../components/Gallery.jsx';
import Contact from '../components/Contact.jsx';
import Socials from '../components/Socials.jsx';
import Footer from '../components/Footer.jsx';
import { useSiteData } from '../hooks/useSiteData.js';
import { useReveal } from '../hooks/useReveal.js';

export default function Home() {
  const { data, loading, error, reload } = useSiteData();
  const [presetSubject, setPresetSubject] = useState('');
  useReveal([data]);

  const handleServiceRequest = useCallback((serviceTitle) => {
    setPresetSubject(`درخواست همکاری: ${serviceTitle}`);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const clearPreset = useCallback(() => setPresetSubject(''), []);

  return (
    <div className="site">
      <Nav />

      <main>
        {loading && (
          <div className="container state-block">
            <span className="spinner" aria-hidden="true" />
            <p>در حال بارگذاری…</p>
          </div>
        )}

        {!loading && error && (
          <div className="container state-block">
            <p className="state-error">بارگذاری اطلاعات سایت ممکن نشد: {error}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={reload}>
              تلاش دوباره
            </button>
          </div>
        )}

        {!loading && data && (
          <>
            <Hero heroImageUrl={data.settings.heroImageUrl} />
            <About />
            <Apps apps={data.apps} />
            <AIProjects projects={data.aiProjects} />
            <Services onRequest={handleServiceRequest} />
            <FutureProjects projects={data.futureProjects} />
            <Gallery images={data.gallery} />
            <Contact
              contactEmail={data.settings.contactEmail}
              presetSubject={presetSubject}
              onPresetUsed={clearPreset}
            />
            <Socials socials={data.settings.socials} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
