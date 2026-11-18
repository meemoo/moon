import { getMoonImageURLs } from "../../moon.js";

export const config = { path: "/moon.jpg" };

export default async function (req) {
  const url = new URL(req.url);

  try {
    // Parse optional date parameter
    let date = new Date(); // Default to current date
    const dateParam = url.searchParams.get("date");

    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date parameter. Use ISO format");
      }
      date = parsedDate;
    }

    // Get the moon image URLs for the specified/current date. Can throw if out of range.
    const moonUrls = getMoonImageURLs(date);

    // Fetch the JPG image from NASA. Use http: svs.gsfc.nasa.gov serves an
    // incomplete TLS chain (no intermediate cert), which Node's fetch rejects.
    const response = await fetch(moonUrls.jpg.replace(/^https:/, "http:"));

    if (!response.ok) {
      throw new Error(`Failed to fetch moon image: ${response.status}`);
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "X-Moon-Date": date.toISOString(), // Include the date used
      },
    });
  } catch (error) {
    console.error("Error fetching moon image:", error);
    return new Response(`Failed to fetch moon image: ${error.message}`, {
      status: 500,
    });
  }
}
