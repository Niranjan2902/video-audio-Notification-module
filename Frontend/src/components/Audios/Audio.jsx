import React, { useState, useEffect } from "react";

const AudioList = () => {
  const [uploads, setUploads] = useState([]);  // List of video directories
  const [loading, setLoading] = useState(true); // Loading state for fetching videos
  const [error, setError] = useState(null);     // For error handling

  // Fetching video data when component mounts
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("http://localhost:8080/listaudios"); // API endpoint
        if (!res.ok) throw new Error("Failed to fetch videos");
        
        const data = await res.json(); // Parse the response as JSON

        // Check if data is in the expected format
        console.log("Fetched Data:", data);

        setUploads(data);  // Store video directory names in state
      } catch (err) {
        setError(err.message); // Set error message if fetching fails
      } finally {
        setLoading(false); // Set loading to false when the fetch is done
      }
    }

    fetchVideos();
  }, []); // Empty dependency array means this will run once when the component mounts

  return (
    <div className="py-20 bg-white">
      <div className="container m-auto px-6 text-gray-600">
        {/* Loading state */}
        {loading && <div>Loading videos...</div>}

        {/* Error state */}
        {error && <div>Error: {error}</div>}

        {/* Video list */}
        {uploads.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {uploads.map((audioId, index) => (
              <div key={index} className="video-item">
                <h2>{audioId}</h2>
                {/* Assuming the video file structure is: /videos/{audioId}/master.m3u8 */}
                <audio controls width="640" height="360">
                  <source
                    src={`http://localhost:8080/videos/${audioId}/master.m3u8`}
                    type="application/x-mpegURL"
                  />
                  Your browser does not support the video tag.
                </audio>
              </div>
            ))}
          </div>
        ) : (
          <div>No videos available</div>
        )}
      </div>
    </div>
    
  );
};

export default AudioList;
