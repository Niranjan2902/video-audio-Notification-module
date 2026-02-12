import React, { useState, useEffect } from "react";
import Conf from "../Conf/Conf";

const LIBRARY_ID = Conf.libraryId;
const STORAGE_KEY = Conf.storageKey;
const STREAM_KEY = Conf.stream_key

import { Link } from "react-router-dom";

export default function About() {
 const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeView, setActiveView] = useState("videos"); // Default to videos view

  // Mock data for testing (using YouTube thumbnails and playback URLs)
const mockVideos = [
   {
      guid: '1',
      type: 'video',
      title: 'Chai aur react',
      thumbnailUrl: 'https://img.youtube.com/vi/vz1RlUyrc3w/0.jpg',
      playbackUrl: 'https://www.youtube.com/embed/vz1RlUyrc3w',
    },
    {
      guid: '2',
      type: 'video',
    title: 'Time Dilation - Einstein\'s Relativity Explained',
    thumbnailUrl: 'https://img.youtube.com/vi/yuD34tEpRFw/0.jpg',
    playbackUrl: 'https://www.youtube.com/embed/yuD34tEpRFw', 
    },
  {
    guid: '3',
    type: 'video',
    title: 'Black Holes Explained – From Birth to Death',
    thumbnailUrl: 'https://img.youtube.com/vi/e-P5IFTqB98/0.jpg',
    playbackUrl: 'https://www.youtube.com/embed/e-P5IFTqB98',  // Fixed playback URL
  },
  {
    guid: '4',
    type: 'video',
    title: 'General Relativity Explained Simply & Visually',
    thumbnailUrl: 'https://img.youtube.com/vi/tzQC3uYL67U/0.jpg',
    playbackUrl: 'https://www.youtube.com/embed/tzQC3uYL67U',  // Fixed playback URL
  },
  {
    guid: '5',
    type: 'video',
    title: 'Stephen Hawking: A Brief History of Mine',
    thumbnailUrl: 'https://img.youtube.com/vi/SkILGdPZZ_k/0.jpg',
    playbackUrl: 'https://www.youtube.com/embed/SkILGdPZZ_k',  // Fixed playback URL
  },
  {
    guid: '6',
    type: 'video',
    title: 'JavaScript Full Course for Free',
    thumbnailUrl: 'https://img.youtube.com/vi/lfmg-EJ8gm4/0.jpg',
    playbackUrl: 'https://www.youtube.com/embed/lfmg-EJ8gm4',  // Fixed playback URL
  },
  {
    guid: '7',
    type: 'video',
    title: 'CSS Tutorial – Full Course for Beginners',
    thumbnailUrl: 'https://img.youtube.com/vi/OXGznpKZ_sA/0.jpg',
    playbackUrl: 'https://www.youtube.com/embed/OXGznpKZ_sA',  // Fixed playback URL
  },
  {
    guid: '8',
    type: 'video',
    title: 'Black Holes 101 - National Geographic',
    thumbnailUrl: 'https://img.youtube.com/vi/kOEDG3j1bjs/0.jpg',
    playbackUrl: 'https://www.youtube.com/embed/kOEDG3j1bjs',  // Fixed playback URL
  },
  {
    guid: '9',
    type: 'video',
    title: 'Starship Mission to Mars - SpaceX Animation',
    thumbnailUrl: 'https://img.youtube.com/vi/921VbEMAwwY/0.jpg',
    playbackUrl: 'https://www.youtube.com/embed/921VbEMAwwY',  // Fixed playback URL
  },

];

  useEffect(() => {
    // Combine videos into uploads
    setUploads([...mockVideos]);
  }, []);

  const deleteFiles = (guid) => {
    // Simulate file deletion
    setUploads((prev) => prev.filter((item) => item.guid !== guid));
    setSelected(null); // Close modal after deletion
  };
return (
    <div className="py-20 bg-white">
      <div className="container m-auto px-6 text-gray-600 md:px-12 xl:px-6">
        {/* Video Grid Layout */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {uploads.map((item, idx) => (
            <div
              key={idx}
              className="relative bg-black text-white rounded-lg overflow-hidden cursor-pointer hover:opacity-75"
              onClick={() => setSelected(item)}
            >
              {/* Thumbnail */}
              <div className="h-[300px] bg-cover bg-center" style={{ backgroundImage: `url(${item.thumbnailUrl})` }}>
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 text-7xl">
                  ‣
                </div>
              </div>

              <p className="font-semibold text-center mt-2">{item.title}</p>
            </div>
          ))}
        </div>

        {/* Modal for Full-Screen Playback */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-blue-200 p-4 rounded-lg max-w-3xl w-full relative">
              <button
                className="absolute top-2 right-2 text-red-500 font-bold"
                onClick={() => setSelected(null)} // Close modal
              >
                X
              </button>

              <h2 className="font-bold mb-4">{selected.title}</h2>

              {/* Video Playback */}
              <div className="relative pt-[56.25%] w-full bg-black rounded-lg overflow-hidden mt-4">
                <iframe
                  src={selected.playbackUrl}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <button
                onClick={() => deleteFiles(selected.guid)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete Video
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
