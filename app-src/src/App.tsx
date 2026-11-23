import { HashRouter, Route, Routes } from 'react-router-dom';
import { useStore } from './store';
import { Shell } from './ui/Shell';
import { Setup } from './ui/Setup';
import { JobsPage } from './ui/Jobs';
import { JobPage } from './ui/JobPage';
import { InvoiceView } from './ui/Invoice';
import { TechToday, TechJob } from './ui/Tech';
import { FleetsPage, PricesPage, SettingsPage } from './ui/Admin';

export default function App() {
  const company = useStore(s => s.company); const role = useStore(s => s.role);
  if (!company) return <Setup />;
  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={role === 'owner' ? <JobsPage /> : <TechToday />} />
          <Route path="/jobs/:id" element={role === 'owner' ? <JobPage /> : <TechJob />} />
          <Route path="/jobs/:id/invoice" element={<InvoiceView />} />
          <Route path="/fleets" element={<FleetsPage />} />
          <Route path="/prices" element={<PricesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={role === 'owner' ? <JobsPage /> : <TechToday />} />
        </Routes>
      </Shell>
    </HashRouter>
  );
}
