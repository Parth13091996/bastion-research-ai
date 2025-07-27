import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowUp, User } from "lucide-react";

export default function Complaince() {
  const [expandedSections, setExpandedSections] = useState({
    complaints: false,
    investor: false,
    grievances: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Complaint Redressal Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("complaints")}
            className="flex items-center text-lg font-semibold text-gray-800 hover:text-red-600"
          >
            {expandedSections.complaints ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            Complaint Redressal
          </button>
        </div>

        {/* Investor Charter Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("investor")}
            className="flex items-center text-lg font-semibold text-gray-800 hover:text-red-600"
          >
            {expandedSections.investor ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            Investor Charter in respect of Research Analyst (RA)
          </button>
        </div>

        {/* Grievances Section */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection("grievances")}
            className="flex items-center text-lg font-semibold text-gray-800 hover:text-red-600 mb-4"
          >
            {expandedSections.grievances ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            Grievances
          </button>

          {expandedSections.grievances && (
            <div className="ml-6">
              <p className="mb-4 text-gray-700">
                In case of any complain or query:
              </p>

              <div className="mb-4 text-gray-700">
                <strong>Compliance Officer – Parth Agrawal</strong> &nbsp;&nbsp;
                <strong>Email ID –</strong>{" "}
                <a
                  href="mailto:connect@bastionresearch.in"
                  className="text-blue-600 hover:underline"
                >
                  connect@bastionresearch.in
                </a>{" "}
                &nbsp;&nbsp;
                <strong>Ph No. – +91 8780507966</strong>
              </div>

              <div className="mb-6 text-gray-700 leading-relaxed">
                In case you are not satisfied with our response you can lodge
                your grievance with SEBI at{" "}
                <a
                  href="#"
                  className="text-red-600 hover:underline font-medium"
                >
                  SCORES
                </a>{" "}
                or you may also write to any of the offices of SEBI. SCORES may
                be accessed thorough SCORES mobile application as well, same can
                be downloaded from this{" "}
                <a
                  href="#"
                  className="text-red-600 hover:underline font-medium"
                >
                  link
                </a>
                .
              </div>

              <div className="text-gray-700 leading-relaxed">
                ODR Portal could be accessed, if unsatisfied with the response.
                Your attention is drawn to the SEBI circular no.
                SEBI/HO/OIAE/OIAE_IAD-1/P/CIR/2023/131 dated July 31, 2023, on
                "Online Resolution of Disputes in the Indian Securities Market".
                A common Online Dispute Resolution Portal ("ODR Portal") which
                harnesses conciliation and online arbitration for resolution of
                disputes arising in the Indian Securities Market has been
                established. ODR Portal can be accessed via the following{" "}
                <a
                  href="#"
                  className="text-red-600 hover:underline font-medium"
                >
                  link
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Annexure B */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Annexure- B</h2>

          <p className="text-gray-700 mb-4">
            Formats for investors complaints data to be disclosed monthly by IAs
            on their website/mobile application:
          </p>

          <p className="text-gray-700 mb-6 font-semibold">
            Data for the month ending May 2025
          </p>

          {/* Monthly Data Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse border border-gray-300 bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Sr. No.
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Received from
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Pending at the end of last month
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Received
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Resolved*
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Total Pending #
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Pending complaints 3months
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Average Resolution time^ (in days)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    1
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    Directly from Investors
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    2
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    SEBI (SCORES)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    3
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    Other Sources (if any)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td
                    className="border border-gray-300 px-4 py-3 text-center"
                    colSpan={2}
                  >
                    Grand Total
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600 mb-8">
            Average Resolution time is the sum total of time taken to resolve
            each complaint in days, in the current month divided by total number
            of complaints resolved in the current month.
          </p>

          {/* Trend of Monthly Disposal */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Trend of monthly disposal of complaints
          </h3>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse border border-gray-300 bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Sr. No.
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Month
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Carried forward from previous month
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Received
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Resolved*
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Pending#
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { num: 1, month: "May'25" },
                  { num: 2, month: "Apr'25" },
                  { num: 3, month: "Mar'25" },
                  { num: 4, month: "Feb'25" },
                  { num: 5, month: "Jan'25" },
                  { num: 6, month: "Dec'24" },
                  { num: 7, month: "Nov'24" },
                  { num: 8, month: "Sep'24" },
                  { num: 9, month: "Aug'24" },
                  { num: 10, month: "Jul'24" },
                  { num: 11, month: "Jun'24" },
                  { num: 12, month: "May'24" },
                ].map((row) => (
                  <tr key={row.num}>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {row.num}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {row.month}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      0
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      0
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      0
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      0
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td
                    className="border border-gray-300 px-4 py-3 text-center"
                    colSpan={2}
                  >
                    Grand Total
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            *Inclusive of complaints of previous months resolved in the current
            month.
          </div>
          <div className="text-sm text-gray-600 mb-8">
            #Inclusive of complaints pending as on the last day of the month.
          </div>

          {/* Yearly Trend Table */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Trend of monthly disposal of complaints
          </h3>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse border border-gray-300 bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Sr. No.
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Year
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Carried forward from previous year
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Received
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Resolved*
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Pending#
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    1
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    2025-26
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    2
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    2024-25
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    3
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    2023-24
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    4
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    2022-23
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    NA
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    NA
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    NA
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    NA
                  </td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td
                    className="border border-gray-300 px-4 py-3 text-center"
                    colSpan={2}
                  >
                    Grand Total
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            *Inclusive of complaints of previous years resolved in the current
            year.
          </div>
          <div className="text-sm text-gray-600">
            #Inclusive of complaints pending as on the last day of the year.
          </div>
        </div>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
