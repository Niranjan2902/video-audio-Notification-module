const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();
const crypto=require("crypto")

const app = express();
app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({extended:true}))
const zone = process.env.zone
const storage_password = process.env.storage_key

//MULTER
const upload = multer({
  dest: "uploads3/",
  limits: { fileSize: 300 * 1024 * 1024 },
});




app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const title = req.body.title || file?.originalname;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    //IMAGE 
    if (file.mimetype.startsWith("image/")) {
      const filename = Date.now() + "-" + file.originalname;
      const stat = fs.statSync(file.path);

      await axios.put(
        `https://storage.bunnycdn.com/${process.env.zone}/${filename}`,
        fs.createReadStream(file.path),
        {
          headers: {
            AccessKey: process.env.storage_key,
            "Content-Length": stat.size,
          },
          maxBodyLength: Infinity,
        }
      );

      fs.unlinkSync(file.path);

      return res.json({
        type: "image",
        url: `https://${process.env.zone}.b-cdn.net/${filename}`,
      });
    }

    //VIDEO
    if (file.mimetype.startsWith("video/")) {
      // 1️⃣ Create video
      const createVideo = await axios.post(
        `https://video.bunnycdn.com/library/${process.env.libraryId}/videos`,
        { title },
        {
          headers: {
            AccessKey: process.env.stream_api_key,
            "Content-Type": "application/json",
          },
        }
      );
      const guid = createVideo.data.guid;

      // 2️⃣ Upload video (by backend)
      await axios.put(
        `https://video.bunnycdn.com/library/${process.env.libraryId}/videos/${guid}`,
        fs.createReadStream(file.path),
        {
          headers: {
            AccessKey: process.env.stream_api_key,
            "Content-Type": "application/octet-stream",
          },
          maxBodyLength: Infinity,
        }
      );

      fs.unlinkSync(file.path);

      return res.json({
        type: "video",
        guid,
        playbackUrl: `https://iframe.mediadelivery.net/embed/${process.env.libraryId}/${guid}`,
      });
    }

    res.status(400).json({ error: "Unsupported file type" });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// app.delete("/delete-file", async (req, res) => {
//   const { guid } = req.body;
//   await axios.delete(
//     `https://video.bunnycdn.com/library/${process.env.libraryId}/videos/${guid}`,

//     {
//       headers: {
//         AccessKey: process.env.stream_api_key,
//         Accept: 'application/json',
//       },
//     })
//   res.json({ success: true, message: "Video deleted successfully!" });
// });

// app.delete("/delete-file-image", async (req, res) => {
//   const { title } = req.body;
//   await axios.delete(
//     `https://storage.bunnycdn.com/${zone}/${title}`,
//     {
//       headers: {
//         AccessKey: process.env.storage_key,
//         Accept: 'application/json',
//       },
//     })
//   res.json({ success: true, message: "Doc deleted successfully!" });
// });

app.delete("/delete-file", async (req, res) => {
  const { guid, title } = req.body;
  if(guid){
   await axios.delete(
    `https://video.bunnycdn.com/library/${process.env.libraryId}/videos/${guid}`,
    {
      headers: {
        AccessKey: process.env.stream_api_key,
        Accept: 'application/json',
      },
    });
       return res.json({
        success: true,
        message: "Video deleted successfully!",
      });
  }else if(title){
    await axios.delete(
    `https://storage.bunnycdn.com/${zone}/${title}`,
    {
      headers: {
        AccessKey: process.env.storage_key,
        Accept: 'application/json',
      },
    })
        return res.json({
        success: true,
        message: "Image deleted successfully!",
      });
  }
  
});

//SECURITY
// function generateSecureUrl(guid,ip){
//   const expires=Math.floor(Date.now()/1000)+300;
//   const path=`/embed/${process.env.libraryId}/${guid}`;
//   const security_key=process.env.TOKEN_AUTHENTICATION;

// let hashBase = security_key + path + expires;

// if (ip) {
//   hashBase += ip;
// };
//   const token = crypto
//     .createHash("md5")
//     .update(hashBase)
//     .digest("base64")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=/g, "");
   
//     return 'https://iframe.mediadelivery.net' + path + '?token=' + token + '&expires=' + expires;   
// }

app.get('/videos', async (req, res) => {
  try {
    const url = `https://video.bunnycdn.com/library/${process.env.libraryId}/videos`;
    const response = await axios.get(url, {
      headers: { AccessKey: process.env.stream_api_key }
    });

    const videos = Array.isArray(response.data) ? response.data : (response.data.items || []);

    const formattedVideos = videos.map(v => ({
      title: v.title || v.objectName,
      guid: v.guid,
      ip:req.ip,
      //playbackUrl:generateSecureUrl(v.guid,req.ip)
      playbackUrl: `https://iframe.mediadelivery.net/embed/${process.env.libraryId}/${v.guid}`
    }));
    res.json(formattedVideos);
    // end JSON instead of HTML
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching videos" });
  }
});


app.get('/images', async (req, res) => {
  try {
    const url = `https://storage.bunnycdn.com/${zone}/`;
    const response = await fetch(url, {
      headers:
        { AccessKey: storage_password, accept: '*/*', },
    });
    const data = await response.json();
    const images = data.map(img => ({
      type: "image",
      title: img.ObjectName,
      url: `https://${zone}.b-cdn.net/${img.ObjectName}`,
    }));
    res.json(images);

  } catch (err) {
    console.error(err);
  }
});

app.listen(8002, () => console.log("Backend running on port 8002"));
//GENERATED LINK LOOK LIKE:
//https://iframe.mediadelivery.net/embed/572975/24959564-25fe-4a8e-b699-6f5c8486490b?token=5OKFFFSSSevRbhtM6ed5GQbZw&expires=1768372314&autoplay=true&muted=true