import { useState } from 'react';
import api from '../../services/api'

export default function LoginRegister() {
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');

    // Handle form field changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Login submit
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
            });
            setMessage(`Welcome back, ${res.data.username || 'user'}`)
            console.log('Login Success:', res.data)
        } catch (err) {
            setMessage(`Login failed: ${err.response?.data?.error || err.message}`)
            console.log('Login Failed:', res.data)
        }
    }

    // Handle Register submit
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            setMessage(`Account created for ${res.data.username || formData.username}`);
            console.log("Register Success:", res.data);
        } catch (err) {
            setMessage(`Register failed: ${err.response?.data?.error || err.message}`);
            console.log("Register Failed:", res.data);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
                {/* Tabs */}
                <div className='flex justify-around mb-6'>
                    <button onclick={() => setActiveTab('login')}
                        className={`w-1/2 py-2 text-lg font-semibold rounded-t-xl ${activeTab === 'login' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                        Login
                    </button>
                    <button onClick={() => setActiveTab('register')}
                        className={`w-1/2 py-2 text-lg font-semibold rounded-t-xl ${activeTab === 'login' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                        Register
                    </button>
                </div>

                {/* Login Form */}
                {activeTab === 'login' && (
                    <form className='flex flex-col space-y-4' onSubmit={handleLogin}>
                        <input
                            type="email"
                            name="email"
                            placeholder='Email'
                            className='border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type='submit'
                            className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            Login
                        </button>

                        <a href="#" className="text-sm text-blue-500 text-center hover:underline">
                            Forgot password?
                        </a>
                    </form>
                )}

                {/* Register Form */}
                {activeTab === 'register' && (
                    <form className='flex flex-col space-y-4' onSubmit={handleRegister}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                            value={formData.password}
                            onChange={handleChange}
                            required

                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type='submit'
                            className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                        >
                            Create Account
                        </button>
                    </form>
                )}

                {/* Response Message */}
                {message && (
                    <p className="mt-4 text-center text-sm font-medium text-gray-700">
                        {message}
                    </p>
                )}
            </div>
        </div>

    )
}