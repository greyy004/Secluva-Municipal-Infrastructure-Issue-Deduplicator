import { tokenizeText } from "./Cleanup.js";

export const TFIDF = async (text1, text2) => {
  try {
    /* Implementation for calculating TF-IDF
        clean the data (tokenize and normalize the text)
        */
    const cleanedText1 = tokenizeText(text1);
    const cleanedText2 = tokenizeText(text2);

    //create a vocabulary set from both texts
    const vocabulary = new Set([...cleanedText1, ...cleanedText2]);

    //calculate term frequency for both texts
    const termFrequency1 = calculateTermFrequency(cleanedText1);
    const termFrequency2 = calculateTermFrequency(cleanedText2);

    //calculate inverse document frequency for the vocabulary
    const inverseDocumentFrequency = calculateInverseDocumentFrequency([
      cleanedText1,
      cleanedText2,
    ]);

    const tfidf1 = new Map();
    const tfidf2 = new Map();

    // Calculate TF-IDF for each word in the vocabulary
    for (const word of vocabulary) {
      const tf1 = termFrequency1.get(word) || 0;
      const tf2 = termFrequency2.get(word) || 0;
      const idf = inverseDocumentFrequency.get(word);

      tfidf1.set(word, tf1 * idf);
      tfidf2.set(word, tf2 * idf);
    }

    // Convert Maps to plain objects so the vectors are visible in JSON responses.
    return {
      tfidf1: Object.fromEntries(tfidf1),
      tfidf2: Object.fromEntries(tfidf2),
    };
  } catch (err) {
    console.error("Error calculating TF-IDF:", err);
    return null;
  }
};

const calculateTermFrequency = (words) => {
  const frequency = createFrequencyMap(words);

  //calculate the term frequency by dividing the count of each word by the total number of words
  for (const [word, count] of frequency) {
    frequency.set(word, count / words.length);
  }
  return frequency;
};

const calculateInverseDocumentFrequency = (documents) => {
  const documentFrequency = new Map();
  const totalDocuments = documents.length;

  // Count how many documents contain each word
  for (const words of documents) {
    const uniqueWords = new Set(words);

    for (const word of uniqueWords) {
      documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
    }
  }

  // Convert document frequency into IDF
  for (const [word, count] of documentFrequency) {
    documentFrequency.set(
      word,
      Math.log((totalDocuments + 1) / (count + 1)) + 1,
    );
  }

  return documentFrequency;
};

const createFrequencyMap = (words) => {
  const frequency = new Map();

  //create a frequency map for the words
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }
  return frequency;
};
