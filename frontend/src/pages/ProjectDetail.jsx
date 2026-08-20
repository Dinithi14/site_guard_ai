import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../api/projects';
import {
  listProjectMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../api/milestones';
import Modal from '../components/common/Modal';
import {
  FolderKanban,
  Calendar,
  DollarSign,
  MapPin,
  Building,
  Plus,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  AlertTriangle,
} from 'lucide-react';

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    planned_date: '',
    progress_percentage: 0,
    status: 'NOT_STARTED',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, mileRes] = await Promise.all([
        getProject(projectId),
        listProjectMilestones(projectId),
      ]);
      setProject(projRes);
      setMilestones(mileRes.data || []);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'progress_percentage' ? parseInt(value) || 0 : value,
    });
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await createMilestone(projectId, formData);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        description: '',
        planned_date: '',
        progress_percentage: 0,
        status: 'NOT_STARTED',
      });
      await fetchData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to create milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      const progress = newStatus === 'COMPLETED' ? 100 : newStatus === 'NOT_STARTED' ? 0 : 50;
      await updateMilestone(milestoneId, { status: newStatus, progress_percentage: progress });
      await fetchData();
    } catch (err) {
      console.error('Failed to update milestone status:', err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await deleteMilestone(milestoneId);
        await fetchData();
      } catch (err) {
        console.error('Failed to delete milestone:', err);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: '#64748b' }}>Loading project milestones...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Project not found</h3>
        <button onClick={() => navigate('/projects')} className="btn btn-outline" style={{ marginTop: '16px' }}>
          Back to Projects
        </button>
      </div>
    );
  }

  const overallProgress =
    milestones.length > 0
      ? Math.round(
          milestones.reduce((acc, m) => acc + (m.progress_percentage || 0), 0) / milestones.length
        )
      : 0;

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '20px', gap: '6px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Projects</span>
      </button>

      {/* Project Overview Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-primary">{project.project_type}</span>
              <span className={`badge badge-${project.status.toLowerCase().replace('_', '-')}`}>
                {project.status}
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{project.name}</h2>
            {project.description && (
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>{project.description}</p>
            )}
          </div>

          <button
            onClick={() => navigate('/predictions', { state: { selectedProjectId: project.id } })}
            className="btn btn-primary"
            style={{ gap: '8px' }}
          >
            <BrainCircuit size={18} />
            <span>Launch AI Predictor</span>
          </button>
        </div>

        {/* Project Metrics Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>CONTRACT VALUE</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              LKR {Number(project.budget).toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>LOCATION</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {project.location}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>SCHEDULE</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
              {project.start_date} → {project.expected_end_date}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>CLIENT</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {project.client_name || 'N/A'}
            </div>
          </div>
        </div>

        {/* Overall Progress Meter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              Overall Project Milestone Progress
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>
              {overallProgress}%
            </span>
          </div>
          <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${overallProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Milestones Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Project Milestones ({milestones.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Track phase deliverables, completion rates, and delay points
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary" style={{ gap: '6px' }}>
          <Plus size={16} />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Milestones List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {milestones.length > 0 ? (
          milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="card"
              style={{
                padding: '18px 24px',
                borderLeft: `4px solid ${
                  milestone.status === 'COMPLETED'
                    ? '#16a34a'
                    : milestone.status === 'DELAYED'
                    ? '#dc2626'
                    : '#2563eb'
                }`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a' }}>
                      {milestone.name}
                    </h4>
                    <span
                      className={`badge badge-${
                        milestone.status === 'COMPLETED'
                          ? 'completed'
                          : milestone.status === 'DELAYED'
                          ? 'delayed'
                          : 'in-progress'
                      }`}
                    >
                      {milestone.status.replace('_', ' ')}
                    </span>
                  </div>

                  {milestone.description && (
                    <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '10px' }}>
                      {milestone.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: '#94a3b8' }} />
                      <span>Planned Date: <strong>{milestone.planned_date}</strong></span>
                    </div>
                    {milestone.actual_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: '#94a3b8' }} />
                        <span>Actual Date: <strong>{milestone.actual_date}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar + Action buttons */}
                <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span>{milestone.progress_percentage}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${milestone.progress_percentage}%`,
                          height: '100%',
                          background: milestone.progress_percentage === 100 ? '#16a34a' : '#2563eb',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                      value={milestone.status}
                      onChange={(e) => handleStatusChange(milestone.id, e.target.value)}
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="DELAYED">Delayed</option>
                    </select>

                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px', color: '#dc2626', borderColor: '#fecaca' }}
                      title="Delete Milestone"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
            <Clock size={40} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              No Milestones Defined Yet
            </h4>
            <p style={{ fontSize: '0.84rem', marginBottom: '16px' }}>
              Add construction phases (e.g. Foundation, Structural Frame, MEP Installation).
            </p>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add First Milestone</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Milestone Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Milestone to Project">
        {formError && (
          <div className="alert-box danger" style={{ marginBottom: '16px' }}>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateMilestone}>
          <div className="form-group">
            <label className="form-label">Milestone Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Foundation & Piling"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Planned Completion Date *</label>
              <input
                type="date"
                name="planned_date"
                className="form-input"
                value={formData.planned_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELAYED">Delayed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Progress: {formData.progress_percentage}%
            </label>
            <input
              type="range"
              name="progress_percentage"
              min="0"
              max="100"
              style={{ width: '100%' }}
              value={formData.progress_percentage}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={3}
              placeholder="Key specifications or deliverables for this milestone..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
