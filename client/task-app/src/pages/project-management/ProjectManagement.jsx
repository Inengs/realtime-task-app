import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Button from '../../components/Common/Button';
import NewProjectModal from '../../components/NewProjectModal';
import ActiveProjects from '../../components/ActiveProjects';
import api from '../../services/api';

const ProjectManagementPage = () => {
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState({ name: 'John Doe' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data.projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    const handleProjectCreated = () => {
        fetchProjects();
        setShowModal(false);
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6 pt-20">
            <Header
                unreadCount={unreadCount}
                onSearchChange={handleSearchChange}
                user={user}
                searchQuery={searchQuery}
            />
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-purple-300"></div>
                        <div className="w-16 h-8 bg-green-300"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-purple-300"></div>
                        <div className="w-12 h-8 bg-green-300"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-purple-300"></div>
                        <div className="w-8 h-8 bg-green-300"></div>
                    </div>
                </div>
                <h2 className="text-lg font-semibold mt-6 mb-2">Current Tasks</h2>
                <div className="space-y-2">
                    <div className="border rounded p-2">Design Mockups - Status: In Progress</div>
                    <div className="border rounded p-2">Develop Login Screen - Status: Completed</div>
                    <div className="border rounded p-2">Testing Phase - Status: Not Started</div>
                </div>
                <h2 className="text-lg font-semibold mt-6 mb-2">Team Members</h2>
                <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">A</div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">B</div>
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">C</div>
                </div>
                <div className="mt-6">
                    <Button text="Edit Project Details" onClick={() => setShowModal(true)} />
                    <div className="mt-2 border rounded p-2">
                        <input type="text" placeholder="Project Name" className="w-full p-1 border rounded" />
                        <textarea placeholder="Project Description" className="w-full p-1 border rounded mt-2"></textarea>
                        <Button text="Save Changes" onClick={() => { }} />
                    </div>
                </div>
            </div>
            {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreated={handleProjectCreated} />}
            <ActiveProjects projects={filteredProjects} />
        </div>
    );
};

export default ProjectManagementPage;