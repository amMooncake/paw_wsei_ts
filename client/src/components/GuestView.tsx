import ManageMeLogo from './ui/ManageMeLogo'
import NeuButton from './ui/NeuButtonBlue'
import { userApi } from '../api/userApi'

interface GuestViewProps {
    onLogout: () => void;
}

export default function GuestView({ onLogout }: GuestViewProps) {
    const handleLogout = async () => {
        await userApi.logout()
        onLogout()
    }

    return (
        <div className="notebook-grid min-h-screen w-full flex flex-col items-center justify-center p-10 gap-8">
            <ManageMeLogo />
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-4xl">⏳</span>
                </div>
                <h1 className="text-3xl font-black uppercase text-center dark:text-white">Oczekiwanie na zatwierdzenie konta</h1>
                <p className="text-center text-lg font-bold text-gray-600 dark:text-gray-400">
                    Twoje konto zostało utworzone. Administrator musi je teraz zatwierdzić i nadać Ci odpowiednią rolę.
                </p>
                <NeuButton
                    className="w-full bg-red-400 hover:bg-red-500"
                    onClick={handleLogout}
                >
                    Wyloguj się
                </NeuButton>
            </div>
        </div>
    )
}
