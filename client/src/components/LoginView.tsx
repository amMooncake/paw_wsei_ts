import { useState, useEffect, useRef } from 'react'
import { userApi } from '../api/userApi'
import ManageMeLogo from './ui/ManageMeLogo'
import NeuButton from './ui/NeuButtonBlue'
import { LuMail, LuUser, LuLoaderCircle } from 'react-icons/lu'
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

export default function LoginView({ onLogin }: LoginViewProps) {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [isSimulating, setIsSimulating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const googleButtonRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (typeof window !== 'undefined' && (window as any).google && CONFIG.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
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

        // Retry a few times if script is not yet loaded
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

    const handleMockLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !name || !lastName) return

        await userApi.loginWithGoogle(email, name, lastName)
        onLogin()
    }

    const hasConfiguredGoogle = CONFIG.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'

    return (
        <div className="notebook-grid min-h-screen w-full flex flex-col items-center justify-center p-10 gap-10">
            <ManageMeLogo />

            {!isSimulating ? (
                <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                    <h1 className="text-4xl font-black uppercase text-center dark:text-white">Witaj w ManageMe</h1>

                    {error && (
                        <div className="w-full bg-red-100 border-2 border-red-600 p-3 flex items-center gap-2 text-red-600 font-bold text-sm mb-2">
                            <LuLoaderCircle />
                            {error}
                        </div>
                    )}

                    {hasConfiguredGoogle ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div ref={googleButtonRef} className="w-full flex justify-center" />
                            <div className="flex items-center gap-2 w-full">
                                <div className="h-[2px] bg-black dark:bg-white flex-1 opacity-20" />
                                <span className="text-[10px] font-black uppercase opacity-50 dark:text-white">lub</span>
                                <div className="h-[2px] bg-black dark:bg-white flex-1 opacity-20" />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-100 border-2 border-yellow-600 p-4 text-xs font-bold text-yellow-800 mb-4">
                            Uzupełnij <strong>GOOGLE_CLIENT_ID</strong> w <code>config.ts</code> aby włączyć prawdziwe logowanie Google.
                        </div>
                    )}

                    <NeuButton
                        className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-200 text-black px-8 py-4 text-lg font-black uppercase"
                        onClick={() => setIsSimulating(true)}
                    >
                        Użyj logowania demo
                    </NeuButton>

                </div>
            ) : (
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]">
                    <h2 className="text-2xl font-black uppercase mb-6 dark:text-white flex items-center gap-2">
                        Logowanie DEMO
                    </h2>
                    <form onSubmit={handleMockLogin} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="font-black uppercase text-xs dark:text-gray-400">E-mail</label>
                            <div className="relative">
                                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="w-full border-2 border-black p-2 pl-10 font-bold focus:outline-none dark:bg-zinc-800 dark:text-white dark:border-white"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-black uppercase text-xs dark:text-gray-400">Imię</label>
                            <div className="relative">
                                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Imię"
                                    className="w-full border-2 border-black p-2 pl-10 font-bold focus:outline-none dark:bg-zinc-800 dark:text-white dark:border-white"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-black uppercase text-xs dark:text-gray-400">Nazwisko</label>
                            <div className="relative">
                                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white" />
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Nazwisko"
                                    className="w-full border-2 border-black p-2 pl-10 font-bold focus:outline-none dark:bg-zinc-800 dark:text-white dark:border-white"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <NeuButton
                                type="button"
                                className="flex-1 bg-zinc-200 dark:bg-zinc-800 dark:text-white"
                                onClick={() => setIsSimulating(false)}
                            >
                                Powrót
                            </NeuButton>
                            <NeuButton
                                type="submit"
                                className="flex-[2] bg-blue-400 hover:bg-blue-500"
                            >
                                Zaloguj
                            </NeuButton>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

