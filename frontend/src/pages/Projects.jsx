import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProjects, createProject } from '../api/projects';
import Modal from '../components/common/Modal';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  Building,
  ArrowRight,
  BrainCircuit,
  Filter,
} from 'lucide-react';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'Residential',
    location: '',
    client_name: '',
    budget: '',
    start_date: '',
    expected_end_date: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await listProjects();
      setProjects(res.data || []);
      setFilteredProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let result = [...projects];

    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term) ||
          p.project_type.toLowerCase().includes(term)
      );
    }

    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await createProject({
        ...formData,
        budget: parseFloat(formData.budget),
      });
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        project_type: 'Residential',
        location: '',
        client_name: '',
        budget: '',
        start_date: '',
        expected_end_date: '',
      });
      await fetchProjects();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge badge-completed">Completed</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-in-progress">In Progress</span>;
      case 'PLANNED':
        return <span className="badge badge-planned">Planned</span>;
      default:
        return <span className="badge badge-delayed">{status}</span>;
    }
  };

  return (
    <div>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Construction Projects</h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Manage site profiles, milestones, and monitor delay forecasts</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by project name, location, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#64748b' }}>Loading projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredProjects.map((project) => (
            <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.15s ease' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-primary">{project.project_type}</span>
                  {getStatusBadge(project.status)}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  {project.name}
                </h3>
                {project.description && (
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.4 }}>
                    {project.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '16px', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                    <MapPin size={15} style={{ color: '#94a3b8' }} />
                    <span>{project.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                    <Building size={15} style={{ color: '#94a3b8' }} />
                    <span>Client: {project.client_name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600 }}>
                    <DollarSign size={15} style={{ color: '#16a34a' }} />
                    <span>LKR {Number(project.budget).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                    <Calendar size={15} style={{ color: '#94a3b8' }} />
                    <span>{project.start_date} → {project.expected_end_date}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: '0.82rem' }}
                >
                  Milestones
                </button>
                <button
                  onClick={() => navigate('/predictions', { state: { selectedProjectId: project.id } })}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.82rem', gap: '4px' }}
                >
                  <BrainCircuit size={14} />
                  <span>AI Predict</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <FolderKanban size={48} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>No Projects Found</h3>
          <p style={{ fontSize: '0.88rem', marginBottom: '20px' }}>Create your first construction project to get started with SiteGuard AI.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Create New Project</span>
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Construction Project" maxWidth="600px">
        {formError && (
          <div className="alert-box danger" style={{ marginBottom: '16px' }}>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Kandy Shopping Mall"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Project Type *</label>
              <select
                name="project_type"
                className="form-select"
                value={formData.project_type}
                onChange={handleInputChange}
                required
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Colombo 03"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Client Name</label>
              <input
                type="text"
                name="client_name"
                className="form-input"
                placeholder="e.g. ABC Holdings"
                value={formData.client_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contract Budget (LKR) *</label>
              <input
                type="number"
                name="budget"
                className="form-input"
                placeholder="e.g. 45000000"
                value={formData.budget}
                onChange={handleInputChange}
                required
                min="1000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                name="start_date"
                className="form-input"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected End Date *</label>
              <input
                type="date"
                name="expected_end_date"
                className="form-input"
                value={formData.expected_end_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Scope</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={3}
              placeholder="Brief outline of the construction project deliverables..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
