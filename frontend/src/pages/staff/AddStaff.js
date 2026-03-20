import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddStaff() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', phone:'', role:'', salaryType:'monthly', salary:'', joiningDate:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())       return toast.error('Name is required');
    if (!form.salary || Number(form.salary) <= 0) return toast.error('Enter a valid salary amount');
    setLoading(true);
    try {
      const payload = {
        name:       form.name.trim(),
        phone:      form.phone.trim(),
        role:       form.role.trim(),
        salaryType: form.salaryType,
        salary:     Number(form.salary),
        notes:      form.notes.trim(),
        joiningDate: form.joiningDate || new Date().toISOString(),
      };
      await axios.post('/api/staff', payload);
      toast.success('Staff added successfully!');
      navigate('/staff', { replace: true });
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to add staff');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div className="grad-blue" style={{ padding:'16px 16px 24px', color:'white' }}>
        <div className="hdr-row">
          <button className="back-btn" onClick={()=>navigate(-1)}>←</button>
          <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Add Staff Member</h2>
        </div>
      </div>

      <form onSubmit={submit} style={{ padding:16 }}>
        <div className="field">
          <label>Full Name *</label>
          <input placeholder="Staff member name" value={form.name} onChange={set('name')} autoFocus />
        </div>
        <div className="field">
          <label>Phone Number</label>
          <input type="tel" placeholder="Mobile number (optional)" value={form.phone} onChange={set('phone')} inputMode="numeric" />
        </div>
        <div className="field">
          <label>Role / Designation</label>
          <input placeholder="e.g. Cashier, Manager, Helper" value={form.role} onChange={set('role')} />
        </div>
        <div className="field">
          <label>Salary Type *</label>
          <select value={form.salaryType} onChange={set('salaryType')}>
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div className="field">
          <label>Salary Amount (₹) *</label>
          <input type="number" inputMode="numeric" placeholder="e.g. 15000" value={form.salary} onChange={set('salary')} min="0" />
        </div>
        <div className="field">
          <label>Joining Date</label>
          <input type="date" value={form.joiningDate} onChange={set('joiningDate')} max={new Date().toISOString().split('T')[0]} />
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea rows={2} placeholder="Any notes about this staff member" value={form.notes} onChange={set('notes')} />
        </div>

        <button type="submit" className="btn btn-primary btn-full" style={{ padding:15, marginTop:6 }} disabled={loading}>
          {loading ? 'Adding…' : '+ Add Staff Member'}
        </button>
      </form>
    </div>
  );
}
