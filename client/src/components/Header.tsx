import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout, isAuthenticated } from '../services/auth.service'
import { Menu, X, ShieldCheck, ChevronRight } from 'lucide-react'

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    const authed = isAuthenticated()
    const isAdmin = location.pathname.startsWith('/admin')
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [menuOpen])

    const handleLogout = () => {
        logout()
        navigate('/admin/login')
        setMenuOpen(false)
    }

    const navTo = (path: string) => {
        navigate(path)
        setMenuOpen(false)
    }

    const isActive = (path: string) => location.pathname === path

    const linkClass = (path: string) =>
        `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(path)
            ? 'bg-white/15 text-white'
            : 'text-white/55 hover:text-white hover:bg-white/8'
        }`

    return (
        <>
            <header className="bg-stone-950 text-white h-20 px-6 flex items-center justify-between sticky top-0 z-50 border-b border-white/5 backdrop-blur-md bg-stone-950/90">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 h-12"
                >
                    <img
                        src="/favicon.svg"
                        alt=""
                        className="h-full w-auto py-1"
                    />
                    <span className="font-serif text-2xl tracking-tighter">
                        Compli<span className="text-red-500">IQ</span>
                    </span>
                </button>

                <nav className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-1">
                        <button onClick={() => navTo('/')} className={linkClass('/')}>Submit</button>
                        {authed && isAdmin && (
                            <>
                                <button onClick={() => navTo('/admin')} className={linkClass('/admin')}>Dashboard</button>
                                <button onClick={() => navTo('/admin/analytics')} className={linkClass('/admin/analytics')}>Analytics</button>
                                <button
                                    onClick={() => navTo('/admin/settings')}
                                    className={linkClass('/admin/settings')}
                                >
                                    Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/55 hover:text-white transition-all"
                                >
                                    Sign out
                                </button>
                            </>
                        )}
                    </div>

                    {!isAdmin && (
                        <button
                            onClick={() => navTo('/track')}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group"
                        >
                            Track Your Complaint
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    )}
                </nav>

                <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 transition-all"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {menuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm md:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <div className={`
        fixed top-16 right-0 bottom-0 z-40 w-72 bg-stone-950 border-l border-white/5
        transform transition-transform duration-300 ease-in-out md:hidden
        ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
                <div className="flex flex-col h-full p-4">
                    <div className="space-y-1 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 px-3 py-2">Navigation</p>

                        <button
                            onClick={() => navTo('/')}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/') ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/8'
                                }`}
                        >
                            Submit a Complaint
                        </button>

                        <button
                            onClick={() => navTo('/track')}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/track') ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/8'
                                }`}
                        >
                            Track Complaint
                        </button>

                        {authed && isAdmin && (
                            <>
                                <div className="pt-3">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 px-3 py-2">Admin</p>
                                </div>

                                <button
                                    onClick={() => navTo('/admin')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin') ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/8'
                                        }`}
                                >
                                    Dashboard
                                </button>

                                <button
                                    onClick={() => navTo('/admin/analytics')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/analytics') ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/8'
                                        }`}
                                >
                                    Analytics
                                </button>
                                <button
                                    onClick={() => navTo('/admin/settings')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/admin/settings') ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/8'
                                        }`}
                                >
                                    Settings
                                </button>
                            </>
                        )}
                    </div>

                    <div className="border-t border-stone-800 pt-4 space-y-2">
                        {authed && isAdmin ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 transition-all"
                            >
                                Sign out
                            </button>
                        ) : (
                            <button
                                onClick={() => navTo('/track')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                            >
                                <span className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-red-500" />
                                    Track Your Complaint
                                </span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}