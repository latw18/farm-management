import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { BatchesView } from './views/BatchesView';
import { ReservoirsView } from './views/ReservoirsView';
import { AIPredictorView } from './views/AIPredictorView';
import { AlertsView } from './views/AlertsView';
import { HarvestView } from './views/HarvestView';
import { farmStore } from './mock/store';
import type { CropBatch } from './types/farm';

export const App: React.FC = () => {
  const navigate = useNavigate();

  // State from Store
  const [batches, setBatches] = useState(() => farmStore.getBatches());
  const [reservoirs, setReservoirs] = useState(() => farmStore.getReservoirs());
  const [cultivars] = useState(() => farmStore.getCultivars());
  const [formulas] = useState(() => farmStore.getFormulas());
  const [sensorHistory, setSensorHistory] = useState(() => farmStore.getSensorHistory());
  const [alerts, setAlerts] = useState(() => farmStore.getAlerts());
  const [harvests, setHarvests] = useState(() => farmStore.getHarvests());
  const [channels, setChannels] = useState(() => farmStore.getChannels());
  const [drainEvents, setDrainEvents] = useState(() => farmStore.getDrainEvents());

  // Batch targeted for AI simulation
  const [selectedBatchForAI, setSelectedBatchForAI] = useState<CropBatch | null>(null);

  // Sync state whenever actions happen
  const refreshState = () => {
    setBatches(farmStore.getBatches());
    setReservoirs(farmStore.getReservoirs());
    setSensorHistory(farmStore.getSensorHistory());
    setAlerts(farmStore.getAlerts());
    setHarvests(farmStore.getHarvests());
    setChannels(farmStore.getChannels());
    setDrainEvents(farmStore.getDrainEvents());
  };

  const handleAddBatch = (data: any) => {
    farmStore.addBatch(data);
    refreshState();
  };

  const handleDeleteBatch = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lô trồng này?')) {
      farmStore.deleteBatch(id);
      refreshState();
    }
  };

  const handleAddMeasurement = (data: any) => {
    farmStore.addMeasurementRecord(data);
    refreshState();
  };

  const handleUpdateVolume = (resId: string, addedLiters: number) => {
    const res = reservoirs.find(r => r.id === resId);
    if (!res) return;
    const newVol = Math.min(res.capacityLiters, res.currentVolumeLiters + addedLiters);
    const newEc = Math.max(1.2, parseFloat((res.currentEc * (res.currentVolumeLiters / newVol)).toFixed(2)));
    farmStore.updateReservoir(resId, {
      currentVolumeLiters: newVol,
      currentEc: newEc,
      lastTopUpDate: new Date().toISOString().split('T')[0]
    });
    refreshState();
  };

  const handleResolveAlert = (id: string, by?: string, note?: string) => {
    farmStore.resolveAlert(id, by, note);
    refreshState();
  };

  const handleAcknowledgeAlert = (id: string, by: string) => {
    farmStore.acknowledgeAlert(id, by);
    refreshState();
  };

  const handleDrainReservoir = (event: any) => {
    farmStore.addDrainEvent(event);
    refreshState();
  };

  const handleRecordHarvest = (data: any) => {
    farmStore.recordHarvest(data);
    refreshState();
  };

  const handleResetData = () => {
    farmStore.resetAllData();
    refreshState();
    window.location.reload();
  };

  const handleSelectBatchForAI = (batch: CropBatch) => {
    setSelectedBatchForAI(batch);
    navigate('/forecast');
  };

  const handleNavigateTab = (tab: string) => {
    navigate('/' + tab);
  };

  const unreadAlertsCount = alerts.filter(a => a.status === 'open' || a.status === 'acknowledged').length;

  return (
    <div className="app-container">
      {/* Sidebar with Route Links */}
      <Sidebar
        unreadAlertCount={unreadAlertsCount}
        onResetData={handleResetData}
      />

      {/* Main Area */}
      <div className="app-main">
        <Header unreadAlertCount={unreadAlertsCount} />

        <main className="content-body">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardView
                  batches={batches}
                  reservoirs={reservoirs}
                  sensorHistory={sensorHistory}
                  alerts={alerts}
                  onNavigateTab={handleNavigateTab}
                  onSelectBatchForAI={handleSelectBatchForAI}
                />
              }
            />
            <Route
              path="/batches"
              element={
                <BatchesView
                  batches={batches}
                  cultivars={cultivars}
                  reservoirs={reservoirs}
                  onAddBatch={handleAddBatch}
                  onDeleteBatch={handleDeleteBatch}
                  onSelectBatchForAI={handleSelectBatchForAI}
                />
              }
            />
            <Route
              path="/reservoirs"
              element={
                <ReservoirsView
                  reservoirs={reservoirs}
                  formulas={formulas}
                  channels={channels}
                  batches={batches}
                  drainEvents={drainEvents}
                  onAddMeasurement={handleAddMeasurement}
                  onUpdateVolume={handleUpdateVolume}
                  onDrainReservoir={handleDrainReservoir}
                />
              }
            />
            <Route
              path="/forecast"
              element={
                <AIPredictorView
                  batches={batches}
                  selectedBatch={selectedBatchForAI}
                  reservoirs={reservoirs}
                  cultivars={cultivars}
                />
              }
            />
            <Route
              path="/alerts"
              element={
                <AlertsView
                  alerts={alerts}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onResolveAlert={handleResolveAlert}
                />
              }
            />
            <Route
              path="/harvest"
              element={
                <HarvestView
                  harvests={harvests}
                  batches={batches}
                  onRecordHarvest={handleRecordHarvest}
                />
              }
            />
            {/* Catch-all redirect to /dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
