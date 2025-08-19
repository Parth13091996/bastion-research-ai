
const podcasts = [
  {
    id: 9,
    title:
      "CCL Products Ltd. | Made In India | Episode #9 | Ft. Nitya Shah, Co-Founder KamayaKya Wealth Management",
    date: "June 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-red-700",
  },
  {
    id: 8,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
  },
  {
    id: 7,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
  },
  {
    id: 6,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
  },
  {
    id: 5,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
  },
  {
    id: 4,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
  },
  {
    id: 3,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
  },
  {
    id: 2,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
  },
  {
    id: 1,
    title:
      "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description:
      "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "../src/files/episode-9.webp",
    buttonColor: "bg-black",
  },
];

const PodcastsGrid = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {podcasts.map(
            ({ id, title, date, description, imageUrl, buttonColor }) => (
              <div
                key={id}
                className="flex flex-col md:flex-row bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="md:w-1/3 w-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-64 md:h-full object-contain object-center"
                  />
                </div>
                <div className="md:w-2/3 w-full p-6 lg:p-8 flex flex-col justify-center">
                  <h3 className="text-xl lg:text-2xl font-bold mb-3 text-gray-800 leading-tight">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">📅 {date}</p>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {description}
                  </p>
                  <button
                    className="bg-white border-2 border-gray-800 text-gray-800 px-6 py-2 rounded-full w-max transform transition-all duration-300 ease-in-out shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 hover:scale-110 hover:shadow-md active:scale-95"
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#dc2626";
                      e.target.style.color = "white";
                      e.target.style.borderColor = "#dc2626";
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "white";
                      e.target.style.color = "#1f2937";
                      e.target.style.borderColor = "#1f2937";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    Play Now &raquo;
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastsGrid;
