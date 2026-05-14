import { useState, useEffect, useRef } from 'react'
import { userApi } from '../api/userApi'
import ManageMeLogo from './ui/ManageMeLogo'
import NeuButton from './ui/NeuButtonBlue'
import { LuMail, LuUser, LuLock } from 'react-icons/lu'
import { CONFIG } from '../config'
import { jwtDecode } from 'jwt-decode'

interface LoginViewProps {
    onLogin: () => void;
}

interface GoogleJwtPayload {
    email: string;
    given_name: string;
    family_name: string;
    picture: string;
}

type Mode = 'main' | 'login' | 'register'

const inputClass = "w-full border-2 border-black p-2 pl-10 font-bold focus:outline-none dark:bg-zinc-800 dark:text-white dark:border-white"
const labelClass = "font-black uppercase text-xs dark:text-gray-400"

export default function LoginView({ onLogin }: LoginViewProps) {
    const [mode, setMode] = useState<Mode>('main')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const googleButtonRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (typeof window !== 'undefined' && (window as any).google && CONFIG.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
                try {
                    (window as any).google.accounts.id.initialize({
                        client_id: CONFIG.GOOGLE_CLIENT_ID,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    if (googleButtonRef.current) {
                        (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
                            theme: 'outline',
                            size: 'large',
                            width: 320,
                            text: 'signin_with',
                            shape: 'rectangular',
                        });
                    }
                } catch (err) {
                    console.error('Error initializing Google Sign-In:', err);
                }
            }
        };

        let retries = 0;
        const interval = setInterval(() => {
            if ((window as any).google) {
                initializeGoogleSignIn();
                clearInterval(interval);
            } else if (retries > 10) {
                clearInterval(interval);
            }
            retries++;
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const handleGoogleResponse = async (response: any) => {
        try {
            const decoded = jwtDecode<GoogleJwtPayload>(response.credential);
            await userApi.loginWithGoogle(decoded.email, decoded.given_name, decoded.family_name || '');
            onLogin();
        } catch (err) {
            console.error('Login failed:', err);
            setError('Logowanie przez Google nie powiodło się. Spróbuj ponownie.');
        }
    }

    const handleLogin = async (e: { preventDefault(): void }) => {
        e.preventDefault()
        setError(null)
        try {
            await userApi.loginWithPassword(email, password)
            onLogin()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleRegister = async (e: { preventDefault(): void }) => {
        e.preventDefault()
        setError(null)
        try {
            await userApi.register(email, password, name, lastName)
            onLogin()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const goToMode = (m: Mode) => {
        setError(null)
        setEmail('')
        setPassword('')
        setName('')
        setLastName('')
        setMode(m)
    }

    const hasConfiguredGoogle = CONFIG.GOOGLE_CLIENT_ID !== 'your-google-client-id'

    const ErrorBox = () => error ? (
        <div className="w-full bg-red-100 border-2 border-red-600 p-3 text-red-600 font-bold text-sm">
            {error}
        </div>
    ) : null

    if (mode === 'login') {
        return (
            <div className="notebook-grid min-h-screen w-full flex flex-col items-center justify-center p-10 gap-10">
                <ManageMeLogo />
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]">
                    <h2 className="text-2xl font-black uppercase mb-6 dark:text-white">Logowanie</h2>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <ErrorBox />
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>E-mail</label>
                            <div className="relative">
                                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" className={inputClass} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Hasło</label>
                            <div className="relative">
                                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <NeuButton type="button" className="flex-1 bg-zinc-200 dark:bg-zinc-800 dark:text-white" onClick={() => goToMode('main')}>Powrót</NeuButton>
                            <NeuButton type="submit" className="flex-[2] bg-blue-400 hover:bg-blue-500">Zaloguj</NeuButton>
                        </div>
                        <p className="text-center text-xs font-bold dark:text-gray-400">
                            Nie masz konta?{' '}
                            <button type="button" className="underline cursor-pointer" onClick={() => goToMode('register')}>Zarejestruj się</button>
                        </p>
                    </form>
                </div>
            </div>
        )
    }

    if (mode === 'register') {
        return (
            <div className="notebook-grid min-h-screen w-full flex flex-col items-center justify-center p-10 gap-10">
                <ManageMeLogo />
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]">
                    <h2 className="text-2xl font-black uppercase mb-6 dark:text-white">Rejestracja</h2>
                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        <ErrorBox />
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>E-mail</label>
                            <div className="relative">
                                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" className={inputClass} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Hasło</label>
                            <div className="relative">
                                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Imię</label>
                            <div className="relative">
                                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Imię" className={inputClass} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Nazwisko</label>
                            <div className="relative">
                                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nazwisko" className={inputClass} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <NeuButton type="button" className="flex-1 bg-zinc-200 dark:bg-zinc-800 dark:text-white" onClick={() => goToMode('main')}>Powrót</NeuButton>
                            <NeuButton type="submit" className="flex-[2] bg-blue-400 hover:bg-blue-500">Zarejestruj</NeuButton>
                        </div>
                        <p className="text-center text-xs font-bold dark:text-gray-400">
                            Masz już konto?{' '}
                            <button type="button" className="underline cursor-pointer" onClick={() => goToMode('login')}>Zaloguj się</button>
                        </p>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="notebook-grid min-h-screen w-full flex flex-col items-center justify-center p-10 gap-10">
            <ManageMeLogo />
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                <h1 className="text-4xl font-black uppercase text-center dark:text-white">Witaj w ManageMe</h1>

                <ErrorBox />

                {hasConfiguredGoogle ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <div ref={googleButtonRef} className="w-full flex justify-center" />
                        <div className="flex items-center gap-2 w-full">
                            <div className="h-[2px] bg-black dark:bg-white flex-1 opacity-20" />
                            <span className="text-[10px] font-black uppercase opacity-50 dark:text-white">lub</span>
                            <div className="h-[2px] bg-black dark:bg-white flex-1 opacity-20" />
                        </div>
                    </div>
                ) : null}

                <NeuButton
                    className="w-full bg-zinc-900 text-white hover:invert px-8 py-4 text-lg font-black uppercase"
                    onClick={() => goToMode('login')}
                >
                    Zaloguj się
                </NeuButton>
                <NeuButton
                    className="w-full !bg-zinc-200 !text-black dark:!bg-zinc-700 dark:!text-white px-8 py-4 text-lg font-black uppercase"
                    onClick={() => goToMode('register')}
                >
                    Zarejestruj się
                </NeuButton>
            </div>
        </div>
    )
}
