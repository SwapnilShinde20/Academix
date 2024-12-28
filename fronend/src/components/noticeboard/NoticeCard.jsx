import React, { useState } from "react";
import filelogo from "./filelogo.png";

function NoticeCard({ fileUrls = [], desc, from, to, date }) {
  const [colors] = useState(["#E8F4FF", "#FCEFEF", "#FFF7DB", "#E9FCE9", "#E9F9FC"]);
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const randomColor = getRandomColor();
  const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp)$/i.test(url);

  return (
    <div
      className="m-4 p-6 rounded-xl shadow-lg bg-white transition transform hover:-translate-y-1 hover:shadow-2xl"
      style={{ borderLeft: `6px solid ${randomColor}` }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg text-gray-700 font-semibold">
          <i className="bx bx-calendar text-blue-500"></i> {new Date(date).toLocaleDateString()}
        </h2>
        <div className="text-right">
          <p className="text-md text-gray-500">
            <i className="bx bx-user text-green-500"></i> From: <span className="font-medium">{from}</span>
          </p>
          <p className="text-md text-gray-500">
            <i className="bx bx-building text-purple-500"></i> To: <span className="font-medium">{to}</span>
          </p>
        </div>
      </div>
      <p className="text-gray-600 mb-4">{desc}</p>
      <div className="flex flex-wrap gap-4">
        {fileUrls.length > 0 ? (
          fileUrls.map((url, index) => (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              className="text-sm flex items-center gap-2 p-2 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <img
                src={isImage(url) ? url : filelogo}
                alt={`Attachment ${index + 1}`}
                className="w-12 h-12 object-cover rounded"
              />
              <span className="text-gray-600">File {index + 1}</span>
            </a>
          ))
        ) : (
          <p className="text-gray-500 italic">No attachments available</p>
        )}
      </div>
    </div>
  );
}

export default NoticeCard;
