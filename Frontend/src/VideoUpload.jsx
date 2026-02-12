import React, { useState, useEffect } from "react";
import Conf from "./Conf/Conf";

const LIBRARY_ID = Conf.libraryId;
const STORAGE_KEY = Conf.storageKey;
const STREAM_KEY = Conf.stream_key

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [selected, setSelected] = useState(null);


  const [activeView, setActiveView] = useState(null);
  // null | "images" | "videos"

  const deleteFiles = async (guid, title) => {
    try {
      let file = guid || title;
      const res = await fetch("http://localhost:8002/delete-file", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json", // important!
        },
        body: JSON.stringify({ guid, title }), // pass guid in body
      });

      const data = await res.json();
      if (data.success) {
        alert("File deleted");
        setUploads((prev) => prev.filter((v) => v.guid !== guid && v.title !== title)); // remove from state
        setSelected(null); // close modal
      } else {
        alert("Delete failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Delete request failed");
    }
  };


  // const deleteVideo = async (guid) => {
  //   try {
  //     const res = await fetch("http://localhost:8002/delete-file", {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json", // important!
  //       },
  //       body: JSON.stringify({ guid }), // pass guid in body
  //     });

  //     const data = await res.json();
  //     if (data.success) {
  //       alert("Video deleted");
  //       setUploads((prev) => prev.filter((v) => v.guid !== guid)); // remove from state
  //       setSelected(null); // close modal
  //     } else {
  //       alert("Delete failed: " + data.error);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Delete request failed");
  //   }
  // };

  // const deleteImg = async (title) => {
  //   try {
  //     const res = await fetch("http://localhost:8002/delete-file-image", {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json", // important!
  //       },
  //       body: JSON.stringify({ title }), // pass guid in body
  //     });

  //     const data = await res.json();
  //     if (data.success) {
  //       alert("Image deleted");
  //       setUploads((prev) => prev.filter((i) => i.title !== title)); // remove from state
  //       setSelected(null); // close modal
  //     } else {
  //       alert("Delete failed: " + data.error);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Delete request failed");
  //   }
  // };


  // useEffect(() => {
  //   async function fetchVideos() {
  //     try {
  //       const res = await fetch(
  //         `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
  //         {
  //           headers: {
  //             AccessKey: STREAM_KEY,
  //           },
  //         }
  //       );
  //       const data = await res.json();
  //       if (data.items) {
  //         const videos = data.items.map((vid) => ({
  //           type: "video",
  //           title: vid.title,
  //           guid: vid.guid,
  //           playbackUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${vid.guid}`,
  //         }));
  //         setUploads((prev) => [...videos, ...prev]);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching videos:", err);
  //     }
  //   }
  //   fetchVideos();
  // }, []);

  // file selection

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // upload file
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a file");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const res = await fetch("http://localhost:8002/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.type === "image") {
        setUploads((prev) => [
          { type: "image", title, url: data.url },
          ...prev,
        ]);
      } else if (data.type === "video") {
        // upload binary from frontend
        await fetch(
          `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${data.guid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/octet-stream" },
            body: file,
          }
        );
        const vidObj = {
          type: "video",
          title,
          guid: data.guid,
          playbackUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${data.guid}`,
        };
        setUploads((prev) => [vidObj, ...prev]);
      }

      setFile(null);
      setTitle("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchVideos() {
      const res = await fetch("http://localhost:8002/videos");
      const data = await res.json();

      setUploads((prev) => [
        ...prev.filter(u => u.type !== "video"),
        ...(Array.isArray(data) ? data.map(v => ({ ...v, type: "video" })) : [])
      ]);
    }

    fetchVideos();
  }, []);
  useEffect(() => {
    async function fetchImages() {
      const res = await fetch("http://localhost:8002/images");
      const data = await res.json();

      setUploads(Array.isArray(data) ? data : []);
    }

    fetchImages();
  }, []);

  const images = uploads.filter(u => u.type === "image");
  const videos = uploads.filter(u => u.type === "video");


  return (
    <>
      <div className="bg-gray-300 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-center text-yellow-900 underline mb-6">
          Lecture / Notes Portal
        </h1>

        {/* Upload Form */}
        <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border px-3 py-2 rounded"
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

        {/* FOLDER VIEW */}
        {activeView === null && (
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
            <div
              onClick={() => setActiveView("images")}
              className="bg-yellow-300 p-6 rounded-lg shadow cursor-pointer text-center hover:bg-yellow-200"
            >
              📁 Images
              <p className="text-sm mt-2">{images.length} files</p>
            </div>

            <div
              onClick={() => setActiveView("videos")}
              className="bg-blue-300 p-6 rounded-lg shadow cursor-pointer text-center hover:bg-blue-200"
            >
              📁 Videos
              <p className="text-sm mt-2">{videos.length} files</p>
            </div>
          </div>
        )}

        {/* IMAGES GRID */}
        {activeView === "images" && (
          <>
            <button
              onClick={() => setActiveView(null)}
              className="mb-4 text-blue-600 underline"
            >
              ← Back
            </button>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2">
              {images.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-yellow-300 p-4 rounded-lg shadow cursor-pointer hover:bg-yellow-200"
                  onClick={() => setSelected(item)}
                >
                  <p className="font-semibold truncate">{item.title}</p>
                  <img
                    src={item.url}
                    alt={item.title}
                    className="rounded w-full mt-2"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* VIDEOS GRID */}
        {activeView === "videos" && (
          <>
            <button
              onClick={() => setActiveView(null)}
              className="mb-4 text-blue-600 underline"
            >
              ← Back
            </button>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2">
              {videos.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-blue-300 p-4 rounded-lg shadow cursor-pointer hover:bg-blue-200"
                  onClick={() => setSelected(item)}
                >
                  <p className="font-semibold truncate">{item.title}</p>

                  {item.status === 2 ? (
                    <div className="h-32 bg-black text-white flex items-center justify-center rounded mt-2">
                      ▶ Play Video
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-sm mt-2">
                      Processing…
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* MODAL VIEW */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-blue-200 p-4 rounded-lg max-w-3xl w-full relative">
              <button
                className="absolute top-2 right-2 text-red-500 font-bold"
                onClick={() => setSelected(null)}
              >
                X
              </button>

              <h2 className="font-bold mb-4">{selected.title}</h2>

              {selected.type === "video" && (
                <>
                  <div className="relative pt-[56.25%] w-full bg-black rounded-lg overflow-hidden mt-4">
                    <iframe
                      src={`${selected.playbackUrl}?autoplay=true&muted=true`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <button
                    onClick={() => deleteFiles(selected.guid, null)}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete Video
                  </button>
                </>
              )}

              {selected.type === "image" && (
                <>
                  <img
                    src={selected.url}
                    alt={selected.title}
                    className="w-full rounded"
                  />
                  <button
                    onClick={() => deleteFiles(null, selected.title)}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete Image
                  </button>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </>
  );

}

export default VideoUpload;
