import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'sonner';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error(error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axiosClient.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            toast.success('Đăng nhập thành công!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
            return false;
        }
    };

    const loginWithGoogle = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);

            console.log("Decoded Google Token:", decoded);

            const res = await axiosClient.post('/auth/google', {
                googleId: decoded.sub,
                email: decoded.email,
                username: decoded.name, // Now this will be correct Vietnamese text
                avatar: decoded.picture
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            toast.success('Đăng nhập Google thành công!');
            return true;
        } catch (error) {
            console.error(error);
            toast.error('Đăng nhập Google thất bại');
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await axiosClient.post('/auth/register', { username, email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            toast.success('Đăng ký thành công!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info('Đã đăng xuất');
    };

    const updateUser = (updatedData) => {
        setUser(prevUser => {
            const newData = { ...prevUser, ...updatedData };
            localStorage.setItem('user', JSON.stringify(newData));
            return newData;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
