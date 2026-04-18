import { useNavigate, useLocation } from 'react-router-dom'
import { logout, isAuthenticated } from '../services/auth.service'

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const authed = isAuthenticated()
    const isAdmin = location.pathname.startsWith('/admin')

    const handleLogout = () => {
        logout()
        navigate('/admin/login')
    }

    return (
        <header className="bg-stone-900 text-white h-16 px-6 flex items-center justify-between sticky top-0 z-50">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 h-12"
            >
                <img
                    src="/favicon.svg"
                    alt=""
                    className="h-full w-auto py-1"
                />
                <span className="font-serif text-xl tracking-tight">
                    Compli<span className="text-red-500">IQ</span>
                </span>
            </button>

            <nav className="flex items-center gap-1">
                <button
                    onClick={() => navigate('/')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/'
                        ? 'bg-white/15 text-white'
                        : 'text-white/55 hover:text-white hover:bg-white/8'
                        }`}
                >
                    Submit
                </button>

                <button
                    onClick={() => navigate('/track')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/track'
                        ? 'bg-white/15 text-white'
                        : 'text-white/55 hover:text-white hover:bg-white/8'
                        }`}
                >
                    Track
                </button>

                {authed && isAdmin && (
                    <>
                        <button
                            onClick={() => navigate('/admin')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/admin'
                                ? 'bg-white/15 text-white'
                                : 'text-white/55 hover:text-white hover:bg-white/8'
                                }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/admin/analytics')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/admin/analytics'
                                ? 'bg-white/15 text-white'
                                : 'text-white/55 hover:text-white hover:bg-white/8'
                                }`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all"
                        >
                            Sign out
                        </button>
                    </>
                )}
            </nav>
        </header>
    )
}