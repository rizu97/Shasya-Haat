import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, AuthFlowState } from '@/types';
import { dbService } from '@/src/services/db';
import { firebaseAuth } from '@/src/services/firebase';
import { cloudSync } from '@/src/services/cloudSync';
import {
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult,
    onAuthStateChanged,
    signOut,
    User,
} from 'firebase/auth';

export const useAuth = (
    appSettings: AppSettings,
    setAppSettings: (settings: AppSettings) => void
) => {
    const [authState, setAuthState] = useState<AuthFlowState>('LANDING');
    const [selectedRole, setSelectedRole] = useState<'SELLER' | 'BUYER' | null>(null);
    const [regData, setRegData] = useState<{ shopName: string; mobile: string }>({ shopName: '', mobile: '' });
    const [loginPhone, setLoginPhone] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const navigate = useNavigate();

    // ─── Firebase auth state listener ───
    useEffect(() => {
        const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                setAuthState('AUTHENTICATED');

                // Load settings from DB
                const dbSettings = await dbService.getSettings();
                if (dbSettings) {
                    setAppSettings(dbSettings);
                }
            } else {
                setFirebaseUser(null);
                // Check local DB for legacy auth (migration support)
                try {
                    const savedAuth = await dbService.getAuthState();
                    if (savedAuth?.authState?.isAuthenticated) {
                        // Legacy local auth — user should re-login with Firebase
                        // but let them in for now
                        setAuthState('AUTHENTICATED');
                    }
                } catch (e) {
                    console.error("Failed to load legacy auth:", e);
                }
            }
            setIsAuthLoading(false);
        });

        return () => unsub();
    }, []);

    // ─── Setup invisible reCAPTCHA ───
    const setupRecaptcha = useCallback(() => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(
                firebaseAuth,
                'recaptcha-container',
                { size: 'invisible' }
            );
        }
        return (window as any).recaptchaVerifier;
    }, []);

    // ─── Send OTP via Firebase ───
    const sendOtp = useCallback(async (phoneNumber: string): Promise<boolean> => {
        try {
            const recaptchaVerifier = setupRecaptcha();
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
            const result = await signInWithPhoneNumber(firebaseAuth, formattedPhone, recaptchaVerifier);
            setConfirmationResult(result);
            return true;
        } catch (error: any) {
            console.error('[useAuth] sendOtp failed:', error);
            // Reset reCAPTCHA on failure so it can be retried
            if ((window as any).recaptchaVerifier) {
                try { (window as any).recaptchaVerifier.clear(); } catch (_) { /* ignore */ }
                (window as any).recaptchaVerifier = null;
            }
            const msg = error?.code === 'auth/invalid-phone-number'
                ? 'Invalid phone number. Please check and try again.'
                : error?.code === 'auth/too-many-requests'
                    ? 'Too many attempts. Please try again later.'
                    : `Failed to send OTP: ${error?.message || 'Unknown error'}`;
            alert(msg);
            return false;
        }
    }, [setupRecaptcha]);

    // ─── Verify OTP ───
    const handleVerifyOtp = useCallback(async (otpCode: string) => {
        if (!confirmationResult) {
            alert('No OTP was sent. Please go back and try again.');
            return;
        }

        try {
            const userCredential = await confirmationResult.confirm(otpCode);
            const user = userCredential.user;
            setFirebaseUser(user);

            // Persist auth state to local DB
            await dbService.saveAuthState({
                authState: { isAuthenticated: true, user: null, token: user.uid },
                userRole: selectedRole === 'SELLER' ? 'SHOP_OWNER' : 'SALES_EXECUTIVE',
                shopDetails: regData.shopName ? { name: regData.shopName, address: '' } : null,
                mobile: user.phoneNumber || regData.mobile || loginPhone || null,
            });

            // Save settings with mobile
            if (regData.shopName || regData.mobile) {
                const newSettings = {
                    ...appSettings,
                    shopName: regData.shopName || appSettings.shopName,
                    mobile: user.phoneNumber || regData.mobile || appSettings.mobile,
                };
                setAppSettings(newSettings);
                await dbService.saveSettings(newSettings);
            }

            // Cloud sync: restore data from cloud, then upload any local data
            const restored = await cloudSync.restoreAll(user.uid);
            if (restored.products === 0 && restored.sales === 0) {
                // No cloud data — upload local data (first-time registration)
                await cloudSync.uploadAll(user.uid);
            }

            // Reload settings after restore
            const dbSettings = await dbService.getSettings();
            if (dbSettings) {
                setAppSettings(dbSettings);
            }

            setAuthState('AUTHENTICATED');
            navigate('/');
        } catch (error: any) {
            console.error('[useAuth] handleVerifyOtp failed:', error);
            const msg = error?.code === 'auth/invalid-verification-code'
                ? 'Invalid OTP. Please check and try again.'
                : error?.code === 'auth/code-expired'
                    ? 'OTP has expired. Please request a new one.'
                    : `Verification failed: ${error?.message || 'Unknown error'}`;
            alert(msg);
        }
    }, [confirmationResult, selectedRole, regData, loginPhone, appSettings, setAppSettings, navigate]);

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

    const handleAuthSelection = (action: 'LOGIN' | 'SIGNUP') => {
        if (action === 'LOGIN') {
            navigate('/auth/login');
        } else {
            navigate('/auth/register');
        }
    };

    const handleRegisterContinue = async (data: Partial<AppSettings>) => {
        const mobile = data.mobile || '';
        setRegData({ shopName: data.shopName || '', mobile });

        if (data.shopName) {
            const newSettings = { ...appSettings, shopName: data.shopName, mobile };
            setAppSettings(newSettings);
            await dbService.saveSettings(newSettings);
        }

        // Send OTP via Firebase
        const sent = await sendOtp(mobile);
        if (sent) {
            navigate('/auth/verify');
        }
    };

    const handleSendOtp = async (phone: string) => {
        setLoginPhone(phone);
        const sent = await sendOtp(phone);
        if (sent) {
            navigate('/auth/login/otp');
        }
    };

    const logout = async () => {
        try {
            // Before logging out, do a final backup
            if (firebaseUser) {
                await cloudSync.uploadAll(firebaseUser.uid);
            }
            await signOut(firebaseAuth);
        } catch (e) {
            console.error('[useAuth] Firebase sign out failed:', e);
        }

        // Clear local auth state
        await dbService.saveAuthState({
            authState: { isAuthenticated: false, user: null, token: null },
            userRole: null,
            shopDetails: null,
            mobile: null,
        });
        setFirebaseUser(null);
        setAuthState('LANDING');
        navigate('/');
    };

    return {
        authState,
        setAuthState,
        selectedRole,
        regData,
        loginPhone,
        uid: firebaseUser?.uid || null,
        isAuthLoading,
        handleRoleSelect,
        handleVerifyOtp,
        handleAuthSelection,
        handleRegisterContinue,
        handleSendOtp,
        logout,
    };
};
