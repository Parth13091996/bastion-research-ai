import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowUp, User } from "lucide-react";

export default function Complaince() {
  const [expandedSections, setExpandedSections] = useState({
    complaints: false,
    investor: false,
    grievances: false,
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
          
          {expandedSections.complaints && (
            <div className="ml-6 mt-4 text-gray-700 leading-relaxed">
              <p className="mb-4">
                Client's queries / complaints may arise due to lack of understanding or a deficiency of service experienced by clients. Deficiency of service may include lack of explanation, clarifications, understanding which escalates into shortfalls in the expected delivery standards, either due to inadequacy of facilities available or through the attitude of staff towards client.
              </p>
              
              <p className="mb-4">
                Clients can seek clarification to their query and are further entitled to make a complaint in writing, orally or telephonically. An email may be sent to the Client Servicing Team on <strong><u>connect@bastionresearch.in</u></strong>. Alternatively, the Investor may call on <strong>8780507966</strong>.
              </p>

              <ol className="list-decimal ml-6 mb-4 space-y-4">
                <li>
                  A letter may also be written with their query/complaint and posted at the below mentioned address:
                  <br />
                  <strong className="text-base block ml-4 mt-2">
                    UG-64, VIP Plaza<br />
                    VIP Road, Surat<br />
                    395007, Gujrat, India
                  </strong>
                </li>
                
                <li>
                  Clients can write to the research analyst at <strong>connect@bastionresearch.in</strong> if the Investor does not receive a response within 10 business days of writing to the Client Servicing Team. The client can expect a reply within 10 business days of approaching research analyst.
                </li>
                
                <li>
                  In case you are not satisfied with our response you can lodge your grievance with SEBI at <a href="http://scores.sebi.gov.in" className="text-red-600 hover:underline">http://scores.sebi.gov.in</a> or you may also write to any of the offices of SEBI. SCORES may be accessed thorough SCORES mobile application as well, same can be downloaded from this <a href="https://play.google.com/store/apps/details?id=com.sebi.invapp&hl=en&gl=US" className="text-red-600 hover:underline">link.</a>
                </li>
              </ol>

              <p>
                ODR Portal could be accessed, if unsatisfied with the response. Your attention is drawn to the SEBI circular no. SEBI/HO/OIAE/OIAE_IAD-1/P/CIR/2023/131 dated July 31, 2023, on "Online Resolution of Disputes in the Indian Securities Market". A common Online Dispute Resolution Portal ("ODR Portal") which harnesses conciliation and online arbitration for resolution of disputes arising in the Indian Securities Market has been established. ODR Portal can be accessed via the following <a href="https://smartodr.in/" className="text-red-600 hover:underline">link.</a>
              </p>
            </div>
          )}
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
          
          {expandedSections.investor && (
            <div className="ml-6 mt-4 text-gray-700 leading-relaxed">
              <ol className="list-decimal ml-6 space-y-6">
                <li>
                  <strong>Vision and Mission Statements for investors</strong>
                  <div className="mt-2">
                    <strong className="text-base">Vision : </strong>Invest with knowledge & safety.
                    <br />
                    <strong className="text-base">Mission :</strong> Every investor should be able to invest in right investment products based on their needs, manage and monitor them to meet their goals, access reports and enjoy financial wellness.
                  </div>
                </li>
                
                <li>
                  <strong>Details of business transacted by the Research Analyst with respect to the investors.</strong>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>To publish research report based on the research activities of the RA.</li>
                    <li>To provide an independent unbiased view on securities.</li>
                    <li>To offer unbiased recommendation, disclosing the financial interests in recommended securities.</li>
                    <li>To provide research recommendation, based on analysis of publicly available information and known observations.</li>
                    <li>To conduct audit annually.</li>
                  </ul>
                </li>
              </ol>

              <div className="mt-4">
                <strong className="text-base">3. Details of services provided to investors (No Indicative Timelines)</strong>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Onboarding of Clients</li>
                  <li>Disclosure to Clients</li>
                  <li>To distribute research reports and recommendations to the clients without discrimination.</li>
                  <li>To maintain confidentiality w.r.t publication of the research report until made available in the public domain.</li>
                </ul>
              </div>

              <div className="mt-4">
                <strong className="text-base">4. Details of grievance redressal mechanism and how to access it</strong>
                <div className="ml-6 mt-2 space-y-2">
                  <p>In case of any grievance / complaint, an investor should approach the concerned research analyst and shall ensure that the grievance is resolved within 30 days.</p>
                  <p>If the investor's complaint is not redressed satisfactorily, one may lodge a complaint with SEBI on SEBI's SCORES portal which is a centralized web-based complaints redressal system. SEBI takes up the complaints registered via SCORES with the concerned intermediary for timely redressal. SCORES facilitates tracking the status of the complaint.</p>
                  <p>With regard to physical complaints, investors may send their complaints to:<br />
                  Office of Investor Assistance and Education, Securities and Exchange Board of India, SEBI Bhavan. Plot No. C4-A, 'G' Block, Bandra-Kurla Complex, Bandra (E), Mumbai – 400 051.</p>
                </div>
              </div>

              <div className="mt-4">
                <strong>5. Expectations from the investors (Responsibilities of investors)</strong>
                
                <div className="mt-3">
                  <strong className="block mb-2">Do's</strong>
                  <ol className="list-decimal ml-6 space-y-1 text-sm">
                    <li>Always deal with SEBI registered Research Analyst.</li>
                    <li>Ensure that the Research Analyst has a valid registration certificate.</li>
                    <li>Check for SEBI registration number.</li>
                    <li>Please refer to the list of all SEBI registered Research Analysts which is available on SEBI website in this <a href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14" className="text-red-600 hover:underline">link.</a></li>
                    <li>Always pay attention towards disclosures made in the research reports before investing.</li>
                    <li>Pay your Research Analyst through banking channels only and maintain duly signed receipts mentioning the details of your payments.</li>
                    <li>Before buying securities or applying in public offer, check for the research recommendation provided by your research Analyst.</li>
                    <li>Ask all relevant questions and clear your doubts with your Research Analyst before acting on the recommendation.</li>
                    <li>Inform SEBI about Research Analyst offering assured or guaranteed returns.</li>
                  </ol>
                </div>

                <div className="mt-3">
                  <strong className="block mb-2">Don'ts</strong>
                  <ol className="list-decimal ml-6 space-y-1 text-sm">
                    <li>Do not provide funds for investment to the Research Analyst.</li>
                    <li>Don't fall prey to luring advertisements or market rumours.</li>
                    <li>Do not get attracted to limited period discount or other incentive, gifts, etc. offered by Research Analyst.</li>
                    <li>Do not share login credentials and password of your trading and demat accounts with the Research Analyst.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
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
                  href="http://scores.gov.in"
                  className="text-red-600 hover:underline font-medium"
                >
                  SCORES
                </a>{" "}
                or you may also write to any of the offices of SEBI. SCORES may
                be accessed thorough SCORES mobile application as well, same can
                be downloaded from this{" "}
                <a
                  href="https://play.google.com/store/apps/details?id=com.sebi.invapp&hl=en&gl=US"
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
                  href="https://smartodr.in/"
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
            Data for the month ending Aug 2025
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
                    Pending complaints&gt; 3months
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
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    &nbsp;
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
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
                  { num: 1, month: "Aug'25" },
                  { num: 2, month: "Jul'25" },
                  { num: 3, month: "Jun'25" },
                  { num: 4, month: "May'25" },
                  { num: 5, month: "Apr'25" },
                  { num: 6, month: "Mar'25" },
                  { num: 7, month: "Feb'25" },
                  { num: 8, month: "Jan'25" },
                  { num: 9, month: "Dec'24" },
                  { num: 10, month: "Nov'24" },
                  { num: 11, month: "Sep'24" },
                  { num: 12, month: "Aug'24" },
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
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    &nbsp;
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
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
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    &nbsp;
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
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

      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}