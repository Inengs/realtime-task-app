import React from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import api from '../services/api';

const ProfilePage = () => {
    const user = {
        name: "Alex Johnson",
        role: "Project Manager",
        availability: "9:00 AM - 5:00 PM",
        email: "alex.johnson@taskflow.com",
        avatar: "https://via.placeholder.com/150",
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-20">
            <Header
                unreadCount={3}
                onSearchChange={() => { }}
                user={user}
                searchQuery=""
            />
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 mt-6">
                <div className="flex flex-col items-center">
                    <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-24 h-24 rounded-full object-cover mb-4"
                    />
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-gray-600">{user.role}</p>
                    <p className="text-gray-500 text-sm">Available for tasks</p>
                    <p className="text-gray-500 text-sm">{user.availability}</p>
                    <a href={`mailto:${user.email}`} className="text-blue-600 mt-2">
                        {user.email}
                    </a>
                    <div className="mt-4 space-x-4">
                        <button className="text-blue-600">Call</button>
                        <button className="text-blue-600">Video</button>
                        <button className="text-blue-600">Chat</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;