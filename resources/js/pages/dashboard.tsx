import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
            <Head title="Dashboard" />
            
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Welcome to your dashboard! The interactive map has been moved to the welcome page.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        View Map
                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
