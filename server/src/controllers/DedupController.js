import { CosineSimilarity } from "../dedup/CosineSimilarity.js";

export const CosineSimilarityController = async (req, res) => {
  try {
    const { text1, text2 } = req.body ?? {};

    // Validate the input
    if (
      typeof text1 !== "string" ||
      typeof text2 !== "string" ||
      !text1.trim() ||
      !text2.trim()
    ) {
      return res.status(400).json({
        error: "Both text1 and text2 must be non-empty strings",
      });
    }

    // Calculate cosine similarity
    const result = await CosineSimilarity(text1, text2);

    if (result === null) {
      return res.status(500).json({
        error: "Failed to calculate cosine similarity",
      });
    }

    // Return the similarity score
    return res.status(200).json({
      similarity: result,
      percentage: Number((result * 100).toFixed(2)),
    });
  } catch (err) {
    console.error("Error calculating cosine similarity:", err);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
