import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowUp, User } from "lucide-react";
import MonthEndingTitle from "../../components/MonthEndingTitle";

function getFinancialYearMonths() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0–11

  const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;

  const months = [
    { name: "Apr", index: 3 },
    { name: "May", index: 4 },
    { name: "Jun", index: 5 },
    { name: "Jul", index: 6 },
    { name: "Aug", index: 7 },
    { name: "Sep", index: 8 },
    { name: "Oct", index: 9 },
    { name: "Nov", index: 10 },
    { name: "Dec", index: 11 },
    { name: "Jan", index: 0 },
    { name: "Feb", index: 1 },
    { name: "Mar", index: 2 },
  ];

  const result = [];

  months.forEach((m) => {
    const year = m.index >= 3 ? fyStartYear : fyStartYear + 1;
    const monthDate = new Date(year, m.index, 1);

    if (monthDate <= today) {
      result.push({
        month: `${m.name}'${String(year).slice(-2)}`,
      });
    }
  });

  return result.map((item, index) => ({
    num: index + 1,
    ...item,
  }));
}


export default function Complaince() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentFY =
    currentMonth >= 4
      ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
      : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

  // Starting financial year (first entry in your table)
  const startFY = "2021-20";

  // Generate all financial years up to current year automatically
  const fyList = [];
  let start = parseInt(startFY.split("-")[0]);
  const end = parseInt(currentFY.split("-")[0]);

  let srNo = 1;

  for (let year = start + 1; year <= end; year++) {
    fyList.push({
      srNo,
      fy: `${year - 1}-${year.toString().slice(-2)}`,
    });
    srNo++;
  }


  const rows = getFinancialYearMonths();

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
            className="flex sm:items-center items-start text-lg font-semibold text-gray-800 hover:text-red-600"
          >
            {expandedSections.complaints ? (
              <ChevronDown className="w-8 h-8 mr-2 sm:w-4 sm:h-4" />
            ) : (
              <ChevronRight className="w-8 h-8 mr-2 sm:w-4 sm:h-4" />
            )}
            Complaints redressal and scores to be mentioned on website
          </button>

          {expandedSections.complaints && (
            <div className="ml-6 mt-4 text-gray-700 leading-relaxed">
              <p className="mb-4">
                Client's queries / complaints may arise due to lack of
                understanding or a deficiency of service experienced by clients.
                Deficiency of service may include lack of explanation,
                clarifications, understanding which escalates into shortfalls in
                the expected delivery standards, either due to inadequacy of
                facilities available or through the attitude of staff towards
                client.
              </p>

              <ol className="list-decimal ml-6 mb-4 space-y-4">
                <li>
                  In case of any complain or query:
                  <br />
                  <br />
                  Please contact our compliance officer Mr. Navid Virani, email
                  id –{" "}
                  <span className="text-red-600">
                    navid@bastionresearch.in
                  </span>{" "}
                  and phone no{" "}
                  <span className="font-semibold">+91 7874205366</span>.
                  <br />
                  <br />
                  You may also approach Partner/RA - Mr. Parth L Agarwal, Email
                  ID:{" "}
                  <span className="text-red-600">
                    subscription@bastionresearch.in
                  </span>{" "}
                  and Phone No.-{" "}
                  <span className="font-semibold">+91 8866358747</span>.
                </li>

                <li>
                  Clients can write to the research analyst at{" "}
                  <span className="text-red-600">
                    connect@bastionresearch.in
                  </span>{" "}
                  if the Investor does not receive a response within 10 business
                  days of writing to the Client Servicing Team. The client can
                  expect a reply within 10 business days of approaching research
                  analyst.
                </li>

                <li>
                  In case you are not satisfied with our response you can lodge
                  your grievance with SEBI at{" "}
                  <a
                    href="https://scores.sebi.gov.in/"
                    className="text-red-600 hover:underline"
                  >
                    https://scores.sebi.gov.in/
                  </a>{" "}
                  or you may also write to any of the offices of SEBI. SCORES
                  may be accessed thorough SCORES mobile application as well,
                  same can be downloaded from below link:
                  <br />
                  <a
                    href="https://play.google.com/store/apps/details?id=com.sebi&pcampaignid=web"
                    className="text-red-600 hover:underline"
                  >
                    https://play.google.com/store/apps/details?id=com.sebi&pcampaignid=web
                  </a>
                  <br />
                  <br />
                  ODR Portal could be accessed, if unsatisfied with the
                  response. Your attention is drawn to the SEBI circular no.
                  SEBI/HO/OIAE/OIAE_JAD-1/P/CIR/2023/131 dated July 31, 2023, on
                  "Online Resolution of Disputes in the Indian Securities
                  Market". A common Online Dispute Resolution Portal ("ODR
                  Portal") which harnesses conciliation and online arbitration
                  for resolution of disputes arising in the Indian Securities
                  Market has been established. ODR Portal can be accessed via
                  the following link -{" "}
                  <a
                    href="https://smartodr.in/"
                    className="text-red-600 hover:underline"
                  >
                    https://smartodr.in/
                  </a>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Investor Charter Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("investor")}
            className="flex sm:items-center items-start  text-lg font-semibold text-gray-800 hover:text-red-600"
          >
            {expandedSections.investor ? (
              <ChevronDown className="w-8 h-8 mr-2 sm:w-4 sm:h-4" />
            ) : (
              <ChevronRight className="w-8 h-8 mr-2 sm:w-4 sm:h-4" />
            )}
            Investor Charter in respect of Research Analyst (RA)
          </button>

          {expandedSections.investor && (
            <div className="ml-6 mt-4 text-gray-700 leading-relaxed">
              <ol className="space-y-6">
                <li>
                  <strong>
                    A. Vision and Mission Statements for investors
                  </strong>
                  <div className="mt-2">
                    <strong className="text-base">Vision : </strong>Invest with
                    knowledge & safety.
                    <br />
                    <strong className="text-base">Mission :</strong> Every
                    investor should be able to invest in right investment
                    products based on their needs, manage and monitor them to
                    meet their goals, access reports and enjoy financial
                    wellness.
                  </div>
                </li>

                <li>
                  <strong>
                    B. Details of business transacted by the Research Analyst
                    with respect to the investors.
                  </strong>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>
                      To publish research report based on the research
                      activities of the RA.
                    </li>
                    <li>
                      To provide an independent unbiased view on securities.
                    </li>
                    <li>
                      To offer unbiased recommendation, disclosing the financial
                      interests in recommended securities.
                    </li>
                    <li>
                      To provide research recommendation, based on analysis of
                      publicly available information and known observations.
                    </li>
                    <li>To conduct audit annually.</li>
                    <li>
                      To ensure that all advertisements are in adherence to the
                      provisions of the Advertisement Code for Research
                      Analysts.
                    </li>
                    <li>
                      To maintain records of interactions with all clients
                      including prospective clients (prior to onboarding), where
                      any conversation related to the research services has
                      taken place.
                    </li>
                  </ul>
                </li>
              </ol>

              <div className="mt-4">
                <strong className="text-base">
                  C. Details of services provided to investors (No Indicative
                  Timelines)
                </strong>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Onboarding of Clients</li>
                  <ul className="list-[square] ml-6 mt-1 space-y-1">
                    <li>
                      Sharing of terms and conditions of research services
                    </li>
                    <li>Completing KYC of fee paying clients</li>
                  </ul>
                  <li>
                    <strong>Disclosure to Clients:</strong>
                    <ul className="list-[square] ml-6 mt-1 space-y-1">
                      <li>
                        To disclose, information that is material for the client
                        to make an informed decision, including details of its
                        business activity, disciplinary history, the terms and
                        conditions of research services, details of associates,
                        risks and conflicts of interest, if any
                      </li>
                      <li>
                        To disclose the extent of use of Artificial Intelligence
                        tools in providing research services
                      </li>
                      <li>
                        To disclose, while distributing a third party research
                        report, any material conflict of interest of such third
                        party research provider or provide web address that
                        directs a recipient to the relevant disclosures
                      </li>
                      <li>
                        To disclose any conflict of interest of the activities
                        of providing research services with other activities of
                        the research analyst.
                      </li>
                      <li>
                        To distribute research reports and recommendations to
                        the clients without discrimination.
                      </li>
                    </ul>
                  </li>
                  <li>
                    To maintain confidentiality w.r.t publication of the
                    research report until made available in the public domain.
                  </li>
                  <li>
                    To respect data privacy rights of clients and take measures
                    to protect unauthorized use of their confidential
                    information
                  </li>
                  <li>
                    To disclose the timelines for the services provided by the
                    research analyst to clients and ensure adherence to the said
                    timelines
                  </li>
                  <li>
                    To provide clear guidance and adequate caution notice to
                    clients when providing recommendations for dealing in
                    complex and high-risk financial products/services
                  </li>
                  <li>To treat all clients with honesty and integrity</li>
                  <li>
                    To ensure confidentiality of information shared by clients
                    unless such information is required to be provided in
                    furtherance of discharging legal obligations or a client has
                    provided specific consent to share such information
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <strong className="text-base">
                  D. Details of grievance redressal mechanism and how to access
                  it
                </strong>
                <div className="ml-6 space-y-2">
                  <div className="p-2 bg-white">
                    <ol className="list-decimal mt-2 space-y-6">
                      <li>
                        <p className="text-md mb-2">
                          Investor can lodge complaint/grievance against
                          Research Analyst in the following ways:
                        </p>

                        <div className="ml-4">
                          <h2 className="font-medium text-gray-700 mb-1 underline">
                            Mode of filing the complaint with research analyst:
                          </h2>
                          <p className="mb-4 text-gray-600">
                            In case of any grievance/complaint, an investor may
                            approach the concerned Research Analyst who shall
                            strive to redress the grievance immediately, but not
                            later than 21 days of the receipt of the grievance.
                          </p>

                          <h2 className="font-medium text-gray-700 mb-1 underline">
                            Mode of filing the complaint on SCORES or with
                            Research Analyst Administration and Supervisory Body
                            (RAASB):
                          </h2>
                          <ul className="list-[lower-roman] ml-6 space-y-2 text-gray-600">
                            <li>
                              <strong>SCORES 2.0</strong> - a web based
                              centralized grievance redressal system of SEBI for
                              facilitating effective grievance redressal in
                              time-bound manner
                              <br />
                              <a
                                href="https://scores.sebi.gov.in"
                                className="text-blue-600 hover:underline"
                              >
                                https://scores.sebi.gov.in
                              </a>
                              <div className="mt-1 ml-4">
                                <p className="font-medium">
                                  Two level review for complaint/grievance
                                  against Research Analyst:
                                </p>
                                <ul className="list-disc ml-6 mt-1">
                                  <li>
                                    First review done by designated body (RAASB)
                                  </li>
                                  <li>Second review done by SEBI</li>
                                </ul>
                              </div>
                            </li>
                            <li>
                              <strong>Email</strong> to designated email ID of
                              RAASB
                            </li>
                          </ul>
                        </div>
                      </li>

                      <li>
                        <p className="text-gray-600">
                          If the Investor is not satisfied with the resolution
                          provided by the Market Participants, then the Investor
                          has the option to file the complaint/ grievance on{" "}
                          <strong>SMARTODR platform</strong> for its resolution
                          through online conciliation or arbitration.
                        </p>
                      </li>
                    </ol>
                  </div>

                  <p>
                    <h2>
                      With regard to physical complaints, investors may send
                      their complaints to:
                    </h2>
                    <strong>
                      {" "}
                      Office of Investor Assistance and Education, Securities
                      and Exchange Board of India, SEBI Bhavan, Plot No. C4-A,
                      ‘G’ Block, Bandra-Kurla Complex, Bandra (E), Mumbai - 400
                      051.
                    </strong>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <strong className="text-base">E. Rights of investors</strong>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Right to Privacy and Confidentiality.</li>
                  <li>Right to Transparent Practices.</li>
                  <li>Right to Fair and Equitable Treatment.</li>
                  <li>Right to Adequate Information.</li>
                  <li>Right to Initial and Continuing Disclosure </li>
                  <li>
                    Right to receive information about all the statutory and
                    regulatory disclosures
                  </li>
                  <li>Right to Fair & True Advertisement.</li>
                  <li>
                    Right to Awareness about Service Parameters and Turnaround
                    Times.
                  </li>
                  <li>
                    Right to be informed of the timelines for each service
                  </li>
                  <li>
                    Right to be Heard and Satisfactory Grievance Redressal
                  </li>
                  <li>Right to have timely redressal</li>
                  <li>
                    Right to Exit from Financial product or service in
                    accordance with the terms and conditions agreed with the
                    research analyst
                  </li>

                  <li>
                    Right to receive clear guidance and caution notice when
                    dealing in Complex and High-Risk Financial Products and
                    Services
                  </li>
                  <li>
                    Additional Rights to vulnerable consumers - Right to get
                    access to services in a suitable manner even if differently
                    abled
                  </li>
                  <li>
                    Right to provide feedback on the financial products and
                    services used
                  </li>
                  <li>
                    Right against coercive, unfair, and one-sided clauses in
                    financial agreements
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <strong>
                  F. Expectations from the investors (Responsibilities of
                  investors)
                </strong>
                <div className="mt-3">
                  <strong className="block mb-2">Do's</strong>
                  <ol className="list-[lower-roman] ml-6 mt-2 space-y-1">
                    <li>Always deal with SEBI registered Research Analyst.</li>
                    <li>
                      Ensure the Research Analyst has a valid registration
                      certificate.
                    </li>
                    <li>
                      Check for SEBI registration number. Refer to the list of
                      SEBI registered Research Analysts on SEBI’s website at{" "}
                      <a
                        href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14"
                        className="text-red-600 hover:underline"
                      >
                        this link
                      </a>
                      .
                    </li>
                    <li>
                      Always pay attention towards disclosures made in the
                      research reports before investing.
                    </li>
                    <li>
                      Pay your Research Analyst through banking channels only
                      and maintain duly signed receipts mentioning the details
                      of your payments. You may make payment of fees through
                      Centralized Fee Collection Mechanism (CeFCoM) of RAASB if
                      research analyst has opted for the mechanism. (Applicable
                      for fee paying clients only)
                    </li>
                    <li>
                      Before buying/ selling securities or applying in public
                      offer, check for the research recommendation provided by
                      your Research Analyst..
                    </li>
                    <li>
                      Ask all relevant questions and clear your doubts with your
                      Research Analyst before acting on recommendation.
                    </li>
                    <li>
                      Seek clarifications and guidance on research
                      recommendations from your Research Analyst, especially if
                      it involves complex and high risk financial products and
                      services.
                    </li>
                    <li>
                      Always be aware that you have the right to stop availing
                      the service of a Research Analyst as per the terms of
                      service agreed between you and your Research Analyst.
                    </li>
                    <li>
                      Always be aware that you have the right to provide
                      feedback to your Research Analyst in respect of the
                      services received
                    </li>
                    <li>
                      Always be aware that you will not be bound by any clause,
                      prescribed by the research analyst, which is contravening
                      any regulatory provisions.
                    </li>
                    <li>
                      Inform SEBI about Research Analyst offering assured or
                      guaranteed returns
                    </li>
                  </ol>
                </div>

                <div className="mt-3">
                  <strong className="block mb-2">Don'ts</strong>
                  <ol className="list-[lower-roman] ml-6 mt-2 space-y-1">
                    <li>
                      Do not provide funds for investment to the Research
                      Analyst.
                    </li>
                    <li>
                      Don’t fall prey to luring advertisements or market rumors.
                    </li>
                    <li>
                      Do not get attracted to limited period discount or other
                      incentive, gifts, etc. offered by Research Analyst.
                    </li>
                    <li>
                      Do not share login credential and password of your
                      trading, demat or bank accounts with the Research Analyst.
                    </li>
                  </ol>
                </div>
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

          <p className="text-lg font-semibold text-gray-800 mb-4">
            Data for the Month Ending <span><MonthEndingTitle format="MMM yyyy" />
            </span>
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
                {rows.map((row) => (
                  <tr key={row.num}>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {row.num}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {row.month}
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
                ))}

                {/* Grand Total Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    &nbsp;
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    Grand Total
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
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            *Inclusive of complaints of previous months resolved in the current
            month.
          </div>
          <div className="text-sm text-gray-600 mb-8">
            *Inclusive of complaints pending as on the last day of the month.
          </div>

          {/* Yearly Trend Table */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Trend of Yearly disposal of complaints
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
                {fyList.map((row) => (
                  <tr key={row.fy}>
                    <td className="border border-gray-300 px-4 py-3 text-center" >{row.srNo}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{row.fy}</td>

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
                ))}

                <tr className="bg-gray-50 font-semibold">
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    &nbsp;
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    Grand Total
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
              </tbody>
            </table>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            *Inclusive of complaints of previous years resolved in the current
            year.
          </div>
          <div className="text-sm text-gray-600 mb-8">
            *Inclusive of complaints pending as on the last day of the year.
          </div>

          {/* Grievance Redressal/Esclation Matrix - Added at the end */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Grievance Redressal/Esclation Matrix:
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 bg-white shadow-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      Details of designation
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold ">
                      Contact Person Name
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold ">
                      Address where the physical address location
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold ">
                      Contact No.
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold ">
                      Email-Id
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold ">
                      Working hours when complainant can call
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      Customer Care
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      -
                    </td>
                    <td
                      className="border border-gray-300 px-4 py-3 text-center "
                      rowSpan={5}
                    >
                      UG 11, VIP Plaza, VIP Road, Surat - 395007
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      NA
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      NA
                    </td>
                    <td
                      className="border border-gray-300 px-4 py-3 text-center "
                      rowSpan={5}
                    >
                      10.30 AM–7.30 PM
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      Head of Customer Care
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      Parth Agrawal
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      +91 8780507966
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      subscription@bastionresearch.in
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      Compliance Officer
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      Navid Virani
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      +91 7874205366
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      navid@bastionresearch.in
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      CEO
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      NA
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      NA
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center ">
                      Principal Officer
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      Parth Agrawal
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      +91 8866358747
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      subscription@bastionresearch.in
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/*-------------------- Compliance Audit Status -------------------*/}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Compliance Audit Status
            </h2>

            <p className="text-gray-700 mb-4">
              As communicated by BSE to all Research Analysts (RAs), compliance audit
              status is required to be displayed on the website. The same has been
              added below for disclosure.
            </p>

            <p className="text-gray-700 mb-6 italic">
              "Disclosure with respect to compliance with Annual compliance audit
              requirement under Regulation 25(3) of SEBI (Research Analyst)
              Regulations, 2014 for last financial years are as under:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 bg-white shadow-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      Sr. No
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      Financial Year
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      Compliance Audit Status
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                      Remarks, If any
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      1
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      FY 2023-24
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      Not Conducted
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      Audit was not applicable as LLP got registered as RA in FY 25-26
                    </td>
                  </tr>

                  <tr>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      2
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      FY 2024-25
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      Not Conducted
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      Audit was not applicable as LLP got registered as RA in FY 25-26
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
