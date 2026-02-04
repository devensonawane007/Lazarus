export function generateAIInsight(videos) {
  if (!videos || videos.length < 2) {
    return "Insufficient data to generate performance insights.";
  }

  const views = videos.map(v => v.views);

  const first = views[0];
  const last = views[views.length - 1];
  const max = Math.max(...views);
  const min = Math.min(...views);

  const growthPercent = ((last - first) / first) * 100;

  let trend = "stable";
  if (growthPercent > 20) trend = "strong upward";
  else if (growthPercent > 5) trend = "moderate upward";
  else if (growthPercent < -10) trend = "declining";

  let performanceTone = "consistent";
  if (max > first * 1.5) performanceTone = "breakout-performing";
  if (min < first * 0.7) performanceTone = "volatile";

  // LLM-style paragraph construction
  let insight = `AI Performance Summary:\n\n`;

  insight += `Your recent content demonstrates a ${trend} performance trend. `;
  insight += `The latest upload recorded ${last.toLocaleString()} views, `;

  if (growthPercent > 0) {
    insight += `representing a ${growthPercent.toFixed(1)}% increase compared to earlier content. `;
  } else {
    insight += `indicating a ${Math.abs(growthPercent).toFixed(1)}% drop from previous performance. `;
  }

  insight += `Overall engagement appears ${performanceTone}, `;
  insight += `suggesting ${performanceTone === "breakout-performing"
    ? "strong audience resonance and high monetization potential."
    : "steady audience interest with scope for optimization."}`;

  insight += `\n\nAgentic AI Recommendation:\n`;

  if (trend.includes("upward")) {
    insight += `• Prioritize scaling content output\n`;
    insight += `• Suitable for investor-backed growth initiatives\n`;
  } else if (trend === "declining") {
    insight += `• Content strategy refinement recommended\n`;
    insight += `• A/B testing thumbnails and formats\n`;
  } else {
    insight += `• Maintain current cadence\n`;
    insight += `• Experiment with engagement-driven formats\n`;
  }

  return insight;
}
