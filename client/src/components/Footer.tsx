import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function Footer() {
    const navigate = useNavigate()
    const year = new Date().getFullYear()

    return (
        <footer className="bg-stone-900 text-stone-400 mt-auto">
            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 h-10 mb-2">
                            <img
                                src="/favicon.svg"
                                alt=""
                                className="h-full w-auto"
                            />
                            <p className="font-serif text-white text-xl">
                                Complait<span className="text-red-500">IQ</span>
                            </p>
                        </div>
                        <p className="text-sm text-stone-500 max-w-xs leading-relaxed">
                            A structured complaint management platform built for transparency, accountability, and fast resolutions.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-10">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Platform</p>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => navigate('/')} className="text-sm hover:text-white transition-colors">
                                        Submit a Complaint
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => navigate('/track')} className="text-sm hover:text-white transition-colors">
                                        Track Complaint
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">System</p>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => navigate('/admin/login')}
                                        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-white transition-colors"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Admin Access
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-stone-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-stone-600">&copy; {year} ComplaitIQ. All rights reserved.</p>
                    <p className="text-xs text-stone-600">Built with React, Express & PostgreSQL</p>
                </div>
            </div>
        </footer>
    )
}