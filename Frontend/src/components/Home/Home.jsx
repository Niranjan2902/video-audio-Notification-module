import React, { useState } from "react";
import Conf from "../Conf/Conf";
import { Link } from "react-router-dom";

const LIBRARY_ID = Conf.libraryId;
const STORAGE_KEY = Conf.storageKey;
const STREAM_KEY = Conf.stream_key;

export default function Home() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState([]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return alert("Please select a file!");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);  // Use 'video' as the field name to match backend
    formData.append("title", title); // Optional title for the video

    try {
      // Send the POST request with FormData to your backend
      const res = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json(); // Parse the response as JSON
      console.log("Response Data:", data);  // Debugging line to see what the server sends back

      // Optionally update uploads if you want to display a list of uploaded files
      setUploads((prev) => [...prev, data]);

      setFile(null); // Reset file input
      setTitle(""); // Reset title input
    } catch (err) {
      console.error("Error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full mx-2 max-w-7xl">
      <h1 className="text-2xl font-bold text-center text-yellow-900 underline mb-6">
        Lecture / Notes Portal
      </h1>

      {/* Upload Form */}
      <div className="max-w-4xl mx-auto bg-gray-600 p-6 rounded-lg shadow mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            id="file"
            name="file"
            accept="video/*"
            onChange={handleFileChange}
            className="border px-3 py-2 rounded bg-gray-200"
          />
          <input
            type="text"
            placeholder="Add title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-3 py-2 rounded bg-gray-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      <div className="text-center text-2xl sm:text-5xl py-10 font-medium">
        <h2 className="text-4xl mb-4 sm:text-2xl">
          Click on the button below to stream your video collection
        </h2>
        <Link
          className="inline-flex text-white items-center px-6 py-3 font-medium bg-orange-700 rounded-lg hover:opacity-75"
          to="/about"
        >
          <svg
            fill="white"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
          >
            <path d="M1.571 23.664l10.531-10.501 3.712 3.701-12.519 6.941c-.476.264-1.059.26-1.532-.011l-.192-.13zm9.469-11.56l-10.04 10.011v-20.022l10.04 10.011zm6.274-4.137l4.905 2.719c.482.268.781.77.781 1.314s-.299 1.046-.781 1.314l-5.039 2.793-4.015-4.003 4.149-4.137zm-15.854-7.534c.09-.087.191-.163.303-.227.473-.271 1.056-.275 1.532-.011l12.653 7.015-3.846 3.835-10.642-10.612z" />
          </svg>
          &nbsp; Watch Now
        </Link>
      </div>
    </div>
  );
}
