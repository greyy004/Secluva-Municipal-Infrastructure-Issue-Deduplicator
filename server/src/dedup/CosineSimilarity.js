import { TFIDF } from "../utils/TF-IDF.js";

export const CosineSimilarity = async (text1, text2) => {
  try {
    // Calculate TF-IDF vectors
    const tfidfResult = await TFIDF(text1, text2);

    if (tfidfResult === null) {
      return null;
    }

    const { tfidf1, tfidf2 } = tfidfResult;

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    // Calculate dot product and magnitude of vector 1
    for (const word of Object.keys(tfidf1)) {
      const weight1 = tfidf1[word];
      const weight2 = tfidf2[word] ?? 0;

      dotProduct += weight1 * weight2;
      magnitude1 += weight1 ** 2;
    }

    // Calculate magnitude of vector 2
    for (const weight of Object.values(tfidf2)) {
      magnitude2 += weight ** 2;
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    const similarity = dotProduct / (magnitude1 * magnitude2);

    console.log("Cosine similarity:", similarity);

    return similarity;
  } catch (error) {
    console.error("Error calculating cosine similarity:", error);
    return null;
  }
};
