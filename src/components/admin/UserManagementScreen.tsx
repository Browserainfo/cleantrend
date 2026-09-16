import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  HelpCircle, 
  AlertTriangle,
  Key,
  Building,
  Phone,
  Mail,
  Percent,
  X,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const UserManagementScreen: React.FC = () => {
  const { 
    users, 
    currentUser, 
    currentRole, 
    addUser, 
    updateUserStatus, 
    resetUserPassword,
    refreshUsers,
    showToast 
  } = useApp();

  const isManager = currentRole === 'MANAGER';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [storeFilter, setStoreFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('Trendera@2026');
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('MANAGER');
  const [newMobile, setNewMobile] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newStore, setNewStore] = useState<string>('C2 Sector 1 Noida');
  const [newDiscountLimit, setNewDiscountLimit] = useState<number>(0);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState<boolean>(false);

  // Reset Password Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState<boolean>(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [isSubmittingReset, setIsSubmittingReset] = useState<boolean>(false);

  // Sync users on mount
  useEffect(() => {
    refreshUsers().catch(err => console.warn('User refresh note:', err));
  }, []);

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile.includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStore = storeFilter === 'ALL' || u.assignedStore === storeFilter || u.assignedStore === 'All Branches';
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && u.isActive) || (statusFilter === 'INACTIVE' && !u.isActive);

    return matchesSearch && matchesRole && matchesStore && matchesStatus;
  });

  const handleOpenAddUser = () => {
    if (isManager) {
      showToast('ANTI-FRAUD RESTRICTION: Only Admin can create new user accounts or modify permissions.', 'error');
      return;
    }
    setNewPassword('Trendera@2026');
    setIsAddUserModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newName || !newMobile || !newPassword) {
      showToast('Please fill all mandatory user details including password.', 'warning');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await addUser({
        username: newUsername.trim(),
        password: newPassword.trim(),
        name: newName.trim(),
        role: newRole,
        mobile: newMobile.trim(),
        email: newEmail.trim() || `${newUsername}@trendera.com`,
        assignedStore: newStore,
        discountLimitPercent: newRole === 'ADMIN' ? 100 : newDiscountLimit,
        isActive: true,
        canEditOrders: newRole === 'ADMIN',
        canModifyPrices: newRole === 'ADMIN',
        canApplyDiscounts: newRole === 'ADMIN' || newDiscountLimit > 0,
        canManageSettings: newRole === 'ADMIN',
        canDeliverOrders: true
      });

      if (res.success) {
        setIsAddUserModalOpen(false);
        setNewUsername('');
        setNewPassword('Trendera@2026');
        setNewName('');
        setNewMobile('');
        setNewEmail('');
      }
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleOpenResetPassword = (user: User) => {
    if (isManager) {
      showToast('Only Admin can reset user credentials.', 'error');
      return;
    }
    setSelectedUserForReset(user);
    setResetNewPassword('');
    setIsResetPasswordModalOpen(true);
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !resetNewPassword) {
      showToast('Please enter a new secure password.', 'warning');
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await resetUserPassword(selectedUserForReset.id, resetNewPassword);
      if (res.success) {
        setIsResetPasswordModalOpen(false);
        setSelectedUserForReset(null);
        setResetNewPassword('');
      }
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 flex flex-col p-4 sm:p-6 text-slate-800 space-y-4">
      {/* Header matching Screenshot 10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-300 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Users and Permissions</h1>
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded font-mono font-bold">
                {users.length} Users
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Role-Based Access Control (RBAC) & Anti-Fraud Security Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshUsers()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 flex items-center gap-1.5 transition"
            title="Refresh user list from database"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync</span>
          </button>

          <button
            onClick={() => showToast('Help documentation on Admin vs Manager permission segregation loaded.', 'info')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Help</span>
          </button>

          {!isManager ? (
            <button
              id="btn-add-new-user"
              onClick={handleOpenAddUser}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-1.5 bg-slate-200 text-slate-400 text-xs font-bold rounded cursor-not-allowed flex items-center gap-1.5"
              title="Manager cannot create users"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Only</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Segregation Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Admin Card */}
        <div className="bg-emerald-50/70 border border-emerald-300 rounded-lg p-3 text-xs text-emerald-950 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
              <span>ADMIN ROLE (Business Owner / Supreme Authority)</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Full unconstrained authority: Create/edit orders, change garment/service prices, grant discounts, manage users, configure enterprise branding & tax rates, and inspect audit trails.
            </p>
          </div>
        </div>

        {/* Manager Card */}
        <div className="bg-amber-50/70 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <span>MANAGER ROLE (Operational Staff / Anti-Fraud Lock)</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Strict operational tasks only: View customer records, scan garments for delivery, record customer payments, and flag price corrections for Admin approval. Strictly prohibited from changing prices or altering orders.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar matching Screenshot 10 */}
      <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by User name, Role, Mobile, or Email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs p-1.5 border border-slate-300 rounded bg-slate-50 text-slate-800 font-medium"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
        </select>

        {/* Store / Workshop Filter */}
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="text-xs p-1.5 border border-slate-300 rounded bg-slate-50 text-slate-800 font-medium"
        >
          <option value="ALL">All Stores / Workshops</option>
          <option value="C2 Sector 1 Noida">C2 Sector 1 Noida</option>
          <option value="All Branches">All Branches</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-1.5 border border-slate-300 rounded bg-slate-50 text-slate-800 font-medium"
        >
          <option value="ALL">Active / Inactive (All)</option>
          <option value="ACTIVE">Active Users</option>
          <option value="INACTIVE">Inactive Users</option>
        </select>
      </div>

      {/* Users Table matching Screenshot 10 */}
      <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[11px]">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">User Name & Identity</th>
                <th className="p-3">Role</th>
                <th className="p-3">Mobile & Email</th>
                <th className="p-3">Store / Workshop</th>
                <th className="p-3 text-center">Price / Discount Authority</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                  
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-slate-500 font-mono text-[11px]">@{u.username}</div>
                  </td>

                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-extrabold tracking-wider ${
                      u.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="p-3 text-slate-600">
                    <div className="font-mono">{u.mobile}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>

                  <td className="p-3 text-slate-800 font-medium">
                    {u.assignedStore}
                  </td>

                  <td className="p-3 text-center">
                    {u.role === 'ADMIN' ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Full Authority (100%)
                      </span>
                    ) : (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Anti-Fraud Locked (0%)
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => !isManager && updateUserStatus(u.id, !u.isActive)}
                      disabled={isManager || u.role === 'ADMIN'}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        u.isActive 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      } ${u.role === 'ADMIN' ? 'cursor-default opacity-80' : ''}`}
                      title={u.role === 'ADMIN' ? 'Admin account cannot be deactivated' : 'Click to toggle active/inactive status'}
                    >
                      {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Password Reset Button */}
                      <button
                        onClick={() => handleOpenResetPassword(u)}
                        disabled={isManager}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"
                        title="Reset User Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      
                      {!isManager && u.role !== 'ADMIN' && (
                        <button
                          onClick={() => updateUserStatus(u.id, false)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Deactivate user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Provision New CRM User</h3>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. ramesh"
                    className="w-full p-2 border border-slate-300 rounded font-mono font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. Trendera@2026"
                  className="w-full p-2 border border-slate-300 rounded font-mono font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  User will use this password to log in. Must be at least 6 characters.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Assignment *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-slate-800 bg-slate-50"
                  >
                    <option value="MANAGER">MANAGER (Operational Staff)</option>
                    <option value="ADMIN">ADMIN (Owner / Full Authority)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Store *</label>
                  <select
                    value={newStore}
                    onChange={(e) => setNewStore(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-800 bg-slate-50"
                  >
                    <option value="C2 Sector 1 Noida">C2 Sector 1 Noida</option>
                    <option value="All Branches">All Branches</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@trendera.com"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              {newRole === 'MANAGER' && (
                <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>Anti-Fraud Protection Applied</span>
                  </div>
                  <p>
                    Manager users cannot modify prices, delete items, or change discounts. Discount authority is strictly locked at 0%.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingAdd ? 'Provisioning...' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPasswordModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Reset User Password</h3>
              </div>
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700">
                <div>User: <strong className="text-slate-900">{selectedUserForReset.name}</strong></div>
                <div className="text-[11px] text-slate-500 font-mono">@{selectedUserForReset.username} ({selectedUserForReset.role})</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full p-2 border border-slate-300 rounded font-mono font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  disabled={isSubmittingReset}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingReset ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
