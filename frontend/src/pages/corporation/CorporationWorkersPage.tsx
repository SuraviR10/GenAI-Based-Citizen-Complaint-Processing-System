import React, { useState, useEffect } from 'react';
import { 
  Users, 
  HardHat, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Filter, 
  RefreshCw,
  Search
} from 'lucide-react';
import { WorkerProfile } from '../../lib/types';
import { api } from '../../lib/api';
import { CorporationLayout } from '../../components/layout/CorporationLayout';
import { Button } from '../../components/common/Button';

export const CorporationWorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [department, setDepartment] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const data = await api.listWorkers({
        department: department !== 'all' ? department : undefined,
        status: status !== 'all' ? status : undefined
      });
      setWorkers(data);
    } catch (err: any) {
      console.error('Error fetching workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [department, status]);

  const filteredWorkers = workers.filter((w) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      w.full_name.toLowerCase().includes(s) ||
      w.department.toLowerCase().includes(s) ||
      (w.area && w.area.toLowerCase().includes(s))
    );
  });

  return (
    <CorporationLayout>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
            Field Crew Directory &amp; Dispatch
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Real-time availability, department rosters, active workloads, and field assignments.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw size={14} />}
          onClick={fetchWorkers}
          isLoading={isLoading}
        >
          Refresh Roster
        </Button>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worker by name, area, department..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem'
            }}
          />
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            backgroundColor: '#ffffff'
          }}
        >
          <option value="all">All Departments</option>
          <option value="Road Maintenance">Road Maintenance</option>
          <option value="Water & Sewage">Water &amp; Sewage</option>
          <option value="Street Lighting">Street Lighting</option>
          <option value="Garbage & Sanitation">Garbage &amp; Sanitation</option>
          <option value="Public Safety & Hazards">Public Safety &amp; Hazards</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            backgroundColor: '#ffffff'
          }}
        >
          <option value="all">All Worker Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="on_site">On Site</option>
          <option value="busy">Busy</option>
        </select>
      </div>

      {/* Workers Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredWorkers.map((w) => {
          const isAvailable = w.worker_status === 'available';
          const isOnSite = w.worker_status === 'on_site';

          return (
            <div
              key={w.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(0, 173, 181, 0.12)',
                        border: '1px solid #00adb5',
                        color: '#00adb5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <HardHat size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                        {w.full_name}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                        {w.department}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: isAvailable ? 'rgba(22, 163, 74, 0.12)' : isOnSite ? 'rgba(234, 179, 8, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                      color: isAvailable ? '#16a34a' : isOnSite ? '#ca8a04' : '#0284c7',
                      textTransform: 'capitalize'
                    }}
                  >
                    {w.worker_status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#475569', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                  {w.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color="#00adb5" /> <span>{w.phone}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#00adb5" /> <span>Zone: {w.area || 'Citywide Emergency Squad'}</span>
                  </div>
                </div>
              </div>

              {/* Workload Stats */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem' }}>
                  <span>Active: <strong style={{ color: '#0f172a' }}>{w.active_tasks_count}</strong></span>
                  <span>Completed: <strong style={{ color: '#16a34a' }}>{w.completed_tasks_count}</strong></span>
                </div>

                {w.phone && (
                  <a
                    href={`tel:${w.phone}`}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Phone size={12} /> Call
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CorporationLayout>
  );
};
