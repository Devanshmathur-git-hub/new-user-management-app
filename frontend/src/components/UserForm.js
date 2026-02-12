import React, { useState, useEffect } from 'react';

const UserForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phoneNo: '', role: '', isActive: true });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        phoneNo: initialData.phoneNo || '',
        role: initialData.role?.name || initialData.role || '',
        isActive: initialData.isActive !== false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (initialData && !payload.password) delete payload.password;
    onSubmit(payload);
    if (!initialData) setFormData({ name: '', email: '', password: '', phoneNo: '', role: '', isActive: true });
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder={initialData ? 'Leave blank to keep unchanged' : 'Password'} value={formData.password} onChange={handleChange} required={!initialData} />
      <input name="phoneNo" placeholder="Phone" value={formData.phoneNo} onChange={handleChange} />
      <input name="role" placeholder="Role" value={formData.role} onChange={handleChange} />
      <label className="checkbox-label">
        <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} />
        Active
      </label>
      <button type="submit">{initialData ? 'Update' : 'Create'} User</button>
    </form>
  );
};

export default UserForm;