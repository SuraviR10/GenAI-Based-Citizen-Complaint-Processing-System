import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  Clock, 
  CheckCircle2, 
  Camera, 
  AlertTriangle, 
  RefreshCw, 
  MapPin, 
  Filter,
  ArrowRight,
  Phone
} from 'lucide-react';
import { WorkerDashboardData, WorkerTask } from '../../lib/types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { WorkerLayout } from '../../components/layout/WorkerLayout';
import { WorkerTaskCard } from '../../components/worker/WorkerTaskCard';
import { ProgressUpdateModal } from '../../components/worker/ProgressUpdateModal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const WorkerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { success } = useToast();

  const workerId = profile?.id || 'b1000000-0000-0000-0000-000000000001';

  const [dashboard, setDashboard] = useState<WorkerDashboardData | null>(null);
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [activeTask, setActiveTask] = useState<WorkerTask | null>(null);
  const [modalMode, setModalMode] = useState<'inspection' | 'progress' | 'complete'>('inspection');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadWorkerData = async () => {
    if (!workerId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [dashData, taskList] = await Promise.all([
        api.getWorkerDashboard(workerId),
        api.listWorkerTasks(workerId, selectedStatus !== 'all' ? selectedStatus : undefined)
      ]);
      setDashboard(dashData);
      setTasks(taskList);
    } catch (err: any) {
      console.error('Error loading worker dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, [workerId, selectedStatus]);

  const openActionModal = (task: WorkerTask, mode: 'inspection' | 'progress' | 'complete') => {
    setActiveTask(task);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <WorkerLayout>
      {/* Worker Greeting & Live Status Header */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 2px 0' }}>
            Field Operations Queue
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            {profile?.department || 'Road Maintenance'} &bull; {profile?.area || 'Kuvempunagar'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw size={14} />}
          onClick={loadWorkerData}
          isLoading={isLoading}
        >
          Sync Tasks
        </Button>
      </div>

      {/* KPI Status Cards */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
          <div
            onClick={() => setSelectedStatus('assigned')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '12px 10px',
              textAlign: 'center',
              border: selectedStatus === 'assigned' ? '2px solid #00adb5' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{dashboard.assigned_count}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned</div>
          </div>

          <div
            onClick={() => setSelectedStatus('inspection')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '12px 10px',
              textAlign: 'center',
              border: selectedStatus === 'inspection' ? '2px solid #eab308' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ca8a04' }}>{dashboard.pending_inspection_count}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ca8a04', textTransform: 'uppercase' }}>Inspection</div>
          </div>

          <div
            onClick={() => setSelectedStatus('in_progress')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '12px 10px',
              textAlign: 'center',
              border: selectedStatus === 'in_progress' ? '2px solid #ea580c' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ea580c' }}>{dashboard.in_progress_count}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>In Progress</div>
          </div>

          <div
            onClick={() => setSelectedStatus('completed')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '12px 10px',
              textAlign: 'center',
              border: selectedStatus === 'completed' ? '2px solid #16a34a' : '1px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#16a34a' }}>{dashboard.completed_count}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Completed</div>
          </div>
        </div>
      )}

      {/* Filter / Reset bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Assigned Tasks ({tasks.length})
        </h2>

        {selectedStatus !== 'all' && (
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0284c7',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Show All ({dashboard?.active_tasks.length || 0})
          </button>
        )}
      </div>

      {/* Task Cards List */}
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <HardHat size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            No Tasks in This Filter
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            You're all caught up on this queue.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tasks.map((task) => (
            <WorkerTaskCard
              key={task.id}
              task={task}
              onInspectionClick={(t) => openActionModal(t, 'inspection')}
              onProgressClick={(t) => openActionModal(t, 'progress')}
              onCompleteClick={(t) => openActionModal(t, 'complete')}
            />
          ))}
        </div>
      )}

      {/* Field Action Modal */}
      <ProgressUpdateModal
        isOpen={isModalOpen}
        task={activeTask}
        mode={modalMode}
        workerId={workerId}
        onClose={() => setIsModalOpen(false)}
        onUpdateSubmitted={(res) => {
          success('Field Update Logged', res.message || 'Task status updated on official timeline.');
          loadWorkerData();
        }}
      />
    </WorkerLayout>
  );
};
