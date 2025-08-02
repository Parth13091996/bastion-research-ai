import React from "react";

const podcasts = [
  {
    id: 9,
    title: "CCL Products Ltd. | Made In India | Episode #9 | Ft. Nitya Shah, Co-Founder KamayaKya Wealth Management",
    date: "June 7, 2025",
    description: "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "https://bastionresearch.in/wp-content/uploads/2023/03/peter-lynch.png",
    buttonColor: "bg-red-700",
  },
  {
    id: 8,
    title: "IIRM Holdings India Ltd. | Made In India | Episode #8 | Ft. Mr. V Ramakrishna, Founder IIRM Holdings",
    date: "April 7, 2025",
    description: "Made in India a journey to uncover the stories behind some of the most remarkable",
    imageUrl: "https://bastionresearch.in/wp-content/uploads/2023/03/peter-lynch.png",
    buttonColor: "bg-black",
  },
];

const PodcastsGrid = () => {
  return (
    <div className="space-y-8">
      {podcasts.map(({ id, title, date, description, imageUrl, buttonColor }) => (
        <div key={id} className="flex flex-col md:flex-row bg-white shadow-md rounded-md overflow-hidden">
          <div className="md:w-1/3">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-2/3 p-6 flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-500 text-sm mb-2">{date}</p>
            <p className="text-gray-700 mb-4">{description}</p>
            <button
              className={`${buttonColor} text-white px-6 py-2 rounded-full w-max hover:brightness-110 transition`}
            >
              Play Now &raquo;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PodcastsGrid;
