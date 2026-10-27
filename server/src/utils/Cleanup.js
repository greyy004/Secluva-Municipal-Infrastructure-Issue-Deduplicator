export const tokenizeText = (text) => {
    // Implementation for tokenizing text
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
}