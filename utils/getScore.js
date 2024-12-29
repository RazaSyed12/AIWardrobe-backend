import scoringData from "./scoringData.json";

export function getScore(attributeType, attributeValue, category) {
  const categoryData = scoringData[`${attributeType} (${category})`];
  if (!categoryData) return 0;

  const score = categoryData[0][attributeValue];
  return score || 0;
}
