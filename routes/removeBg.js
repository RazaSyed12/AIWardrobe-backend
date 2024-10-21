import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

async function removeBg(imagePath, apiKey) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", fs.createReadStream(imagePath));

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } else {
      const errorText = await response.text();
      throw new Error(
        `${response.status}: ${response.statusText} - ${errorText}`
      );
    }
  } catch (error) {
    console.error("Error removing background:", error);
    throw error;
  }
}

export default removeBg;
