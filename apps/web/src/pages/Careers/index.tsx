import React from 'react';
import { Search, MapPin, Clock, Home, ImportIcon } from 'lucide-react';

const CareerPage = () => {
    return (
        <div className="min-h-50vh bg-gray-50 p-8">


            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        {/* Job Type Filter */}
                        <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent whitespace-nowrap">
                           
                            <option>Full Time</option>
                            <option>Part Time</option>
                            <option>Contract</option>
                        </select>

                        {/* Location Filter */}
                        <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent whitespace-nowrap">
                            
                            <option>Office</option>
                            <option>Work From Home</option>
                            <option>Hybrid</option>
                        </select>
                    </div>
                </div>

                {/* Job Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-50%">
                    {/* Research Analyst Trainee */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Analyst Trainee</h3>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Full Time</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>Office</span>
                            </div>
                        </div>

                        <button className="text-red-500 hover:text-red-600 font-medium">
                            <a href="/"> More Details →</a>
                        </button>
                    </div>

                    {/* Freelance Python Developer */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Freelance Python Developer</h3>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Part Time</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Home className="w-4 h-4 mr-2" />
                                <span>Work From Home</span>
                            </div>
                        </div>

                        <button className="text-red-500 hover:text-red-600 font-medium">
                            <a href="/"> More Details →</a>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CareerPage;