import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { User, UserRole } from '../types';
import UserRoleModal from '../components/UserRoleModal';

const initialUsers: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@rohtakpharmacy.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Suresh Sharma', email: 'suresh@rohtakpharmacy.com', role: 'Pharmacist', status: 'Active' },
    { id: '3', name: 'Rita Verma', email: 'rita@rohtakpharmacy.com', role: 'Sales', status: 'Inactive' },
];

const UserRolesPage: React.FC = () => {
    const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleSaveUser = (user: User) => {
        if (userToEdit) {
            setUsers(users.map(u => u.id === user.id ? user : u));
        } else {
            setUsers([...users, { ...user, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
        setUserToEdit(null);
    };

    const handleAddNew = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };
    
    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    }

    const getRoleClass = (role: UserRole) => {
        switch (role) {
            case 'Admin': return 'bg-red-100 text-red-800';
            case 'Pharmacist': return 'bg-blue-100 text-blue-800';
            case 'Sales': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">User Roles & Permissions</h1>
                <button
                    onClick={handleAddNew}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-700"
                >
                    Add New User
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-semibold">{user.name}</p>
                                        <p className="text-gray-600 whitespace-no-wrap text-xs">{user.email}</p>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <span className={`px-2 py-1 font-semibold text-xs rounded-full ${getRoleClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${user.status === 'Active' ? 'text-green-900' : 'text-gray-700'}`}>
                                            <span aria-hidden className={`absolute inset-0 ${user.status === 'Active' ? 'bg-green-200' : 'bg-gray-200'} opacity-50 rounded-full`}></span>
                                            <span className="relative">{user.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                                        <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserRoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
            />
        </div>
    );
};

export default UserRolesPage;