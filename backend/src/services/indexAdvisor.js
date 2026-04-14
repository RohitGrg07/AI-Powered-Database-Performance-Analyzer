export const suggestIndex = (query) => {
  if (query.toLowerCase().includes("where")) {
    return "Consider adding an index on columns used in WHERE clause.";
  }
  return "No obvious index suggestion.";
};
