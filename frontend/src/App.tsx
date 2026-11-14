import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MissionControl } from './pages/MissionControl';
import { ExperimentExplorer } from './pages/ExperimentExplorer';
import { CombustionAnalytics } from './pages/CombustionAnalytics';
import { TestDeepDive } from './pages/TestDeepDive';
import { ResearchAssistant } from './pages/ResearchAssistant';
import { DataInventory } from './pages/DataInventory';
import { InsightEngine } from './pages/InsightEngine';
import { FlexProtocolExplorer } from './pages/FlexProtocolExplorer';
import { FlexResultsExplorer } from './pages/FlexResultsExplorer';

export const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cosmic-bg text-space-textMain bg-grid-pattern relative">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 md:hidden transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
        </div>

        {/* Main Application Viewport */}
        <div
          className={`flex flex-col min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`}
        >
          {/* Top Mission Header */}
          <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          {/* Page Routing Viewport */}
          <main className="flex-1 p-4 md:p-8">
            <Routes>
              <Route path="/" element={<MissionControl />} />
              <Route path="/explorer" element={<ExperimentExplorer />} />
              <Route path="/analytics" element={<CombustionAnalytics />} />
              <Route path="/deep-dive" element={<TestDeepDive />} />
              <Route path="/insights" element={<InsightEngine />} />
              <Route path="/flex-protocol" element={<FlexProtocolExplorer />} />
              <Route path="/flex-results" element={<FlexResultsExplorer />} />
              <Route path="/assistant" element={<ResearchAssistant />} />
              <Route path="/inventory" element={<DataInventory />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-cosmic-border/60 py-4 px-6 text-center text-xs font-mono text-space-textMuted bg-cosmic-darkest/40 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Flame in Freefall • NASA Space Apps Challenge 2026</span>
            <span className="text-[11px] text-space-textMuted/80">
              Independent Research Platform • Based on NASA BASS-II (PSI-25) Archives
            </span>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
