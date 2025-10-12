import React from 'react';
import Profile1 from '../../../public/media/mithlesh-profile.png'
import Profile2 from '../../../public/media/mith-profile.png';
import Profile3 from '../../../public/media/parth-profile.png';

const TeamBastion = () => {
  const teamMembers = [
    {
      name: 'Navid Virani',
      role: 'Co-founder',
      qualifications: 'CFA Charter Holder & BBA (Marketing)',
      experience: '8+ Years',
      previousRole: 'Research Head, Concept Investwell Pvt. Ltd.',
      image:
        Profile1,
    },
    {
      name: 'Sanjay Ladha',
      role: 'Co-founder',
      qualifications: 'CFA Level III Candidate & BBA (Finance)',
      experience: '8+ Years',
      previousRole: 'Research Analyst, Concept Investwell Pvt. Ltd.',
      image:
        Profile2,
    },
    {
      name: 'Parth Agarwal',
      role: 'Co-founder',
      qualifications: 'Chartered Accountant, CFA Level III Cleared & BCom',
      experience: '7+ Years',
      previousRole: 'Quant Analyst, Angel One Ltd.',
      image:
        Profile3,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title with decorative underline */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#1C2852] via-[#2a3862] to-[#1C2852] bg-clip-text text-transparent">
            Team Bastion
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-[#C00000] rounded-full"></div>
            <div className="w-2 h-2 bg-[#C00000] rounded-full"></div>
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-[#C00000] rounded-full"></div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="overflow-x-auto">
          <div className="flex justify-center items-start gap-0 min-w-max mx-auto">
            {teamMembers.map((member, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center px-8 group">
                  {/* Profile Image with gradient border */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C00000] to-[#1C2852] rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative w-44 h-44 rounded-full overflow-hidden ring-4 ring-white shadow-2xl group-hover:ring-[#C00000] transition-all duration-300">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  {/* Name and Role */}
                  <h2 
                    className="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300" 
                    style={{ color: '#1C2852' }}
                  >
                    {member.name}
                  </h2>
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C00000]"></div>
                    <p className="text-base font-medium text-gray-600">{member.role}</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C00000]"></div>
                  </div>

                  {/* Values with improved styling */}
                  <div className="flex flex-col gap-6 w-full max-w-xs">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                      <p className="text-xs font-semibold text-[#C00000] uppercase tracking-wider mb-2">Academic Qualifications</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{member.qualifications}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                      <p className="text-xs font-semibold text-[#C00000] uppercase tracking-wider mb-2">Research Experience</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{member.experience}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                      <p className="text-xs font-semibold text-[#C00000] uppercase tracking-wider mb-2">Previous Role</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{member.previousRole}</p>
                    </div>
                  </div>
                </div>

                {/* Vertical Red Line Separator */}
                {index < teamMembers.length - 1 && (
                  <div className="flex items-center h-auto py-20">
                    <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-[#C00000] to-transparent rounded-full"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBastion;