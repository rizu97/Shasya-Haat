import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, AuthFlowState } from '@/types';
import { dbService } from '@/src/services/db';

export const useAuth = (
    appSettings: AppSettings,
    setAppSettings: (settings: AppSettings) => void
) => {
    const [authState, setAuthState] = useState<AuthFlowState>('LANDING');
    const [selectedRole, setSelectedRole] = useState<'SELLER' | 'BUYER' | null>(null);
    const [regData, setRegData] = useState<{ shopName: string, mobile: string }>({ shopName: '', mobile: '' });
    const [loginPhone, setLoginPhone] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadAuth = async () => {
            try {
                // Check auth state from IndexedDB
                const savedAuth = await dbService.getAuthState();
                if (savedAuth?.authState?.isAuthenticated) {
                    setAuthState('AUTHENTICATED');
                }

                // Load settings from DB
                const dbSettings = await dbService.getSettings();
                if (dbSettings) {
                    setAppSettings(dbSettings);
                }
            } catch (e) {
                console.error("Failed to load auth/settings from DB", e);
            }
        };
        loadAuth();
    }, []);

    const handleRoleSelect = (role: 'SELLER' | 'BUYER') => {
        setSelectedRole(role);
        if (role === 'SELLER') {
            setAuthState('AUTH_FLOW');
            navigate('/auth');
        } else {
            setAuthState('AUTH_FLOW');
            navigate('/auth/login');
        }
    };

    const handleLoginSuccess = async () => {
        // Persist auth state to IndexedDB
        await dbService.saveAuthState({
            authState: { isAuthenticated: true, user: null, token: null },
            userRole: selectedRole === 'SELLER' ? 'SHOP_OWNER' : 'SALES_EXECUTIVE',
            shopDetails: regData.shopName ? { name: regData.shopName, address: '' } : null,
            mobile: regData.mobile || loginPhone || null,
        });

        setAuthState('AUTHENTICATED');
        navigate('/');
    };

    const handleAuthSelection = (action: 'LOGIN' | 'SIGNUP') => {
        if (action === 'LOGIN') {
            navigate('/auth/login');
        } else {
            navigate('/auth/register');
        }
    };

    const handleRegisterContinue = async (data: Partial<AppSettings>) => {
        setRegData({ shopName: data.shopName || '', mobile: data.mobile || '' });
        if (data.shopName) {
            const newSettings = { ...appSettings, shopName: data.shopName, mobile: data.mobile || '' };
            setAppSettings(newSettings);
            await dbService.saveSettings(newSettings);
        }
        navigate('/auth/verify');
    };

    const handleSendOtp = (phone: string) => {
        setLoginPhone(phone);
        navigate('/auth/login/otp');
    };

    const logout = async () => {
        // Clear auth state from IndexedDB
        await dbService.saveAuthState({
            authState: { isAuthenticated: false, user: null, token: null },
            userRole: null,
            shopDetails: null,
            mobile: null,
        });
        setAuthState('LANDING');
        navigate('/');
    };

    return {
        authState,
        setAuthState,
        selectedRole,
        regData,
        loginPhone,
        handleRoleSelect,
        handleLoginSuccess,
        handleAuthSelection,
        handleRegisterContinue,
        handleSendOtp,
        logout
    };
};
