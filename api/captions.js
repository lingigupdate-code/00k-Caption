export default async function handler(req, res) {

  const url = "https://script.google.com/macros/s/AKfycbxdRedfKAe5sqd8KD23B8zYNKORwdI2LIEVcGj5oGOXX3NNhmHf4Vp0X0bl5VOUcnhDoQ/exec";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    // 🔥 debug ดู raw ก่อน
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from Google Script",
        raw: text
      });
    }

    // 🔥 กัน undefined
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      captions: data.captions || [],
      hashtags: data.hashtags || []
    });

  } catch (err) {
    res.status(500).json({
      error: "fetch failed",
      detail: err.message
    });
  }
}