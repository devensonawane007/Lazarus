import { useEffect, useState } from "react";

export default function BrandDashboard() {
  const [analytics, setAnalytics] = useState([]);

  // Simulated analytics feed (later replace with real APIs)
  useEffect(() => {
    setAnalytics([
      {
        platform: "Instagram",
        creator: "creator_raj",
        followers: "120K",
        engagement: "6.2%",
        reach: "85K",
        lastPost: "Reel • 2 days ago"
      },
      {
        platform: "YouTube",
        creator: "TechWithAman",
        subscribers: "340K",
        views: "210K",
        avgWatchTime: "6:45",
        lastVideo: "3 days ago"
      },
      {
        platform: "Instagram",
        creator: "fashion_by_isha",
        followers: "78K",
        engagement: "8.1%",
        reach: "64K",
        lastPost: "Carousel • 1 day ago"
      }
    ]);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Brand Dashboard</h2>
      <p>Post ad campaigns and collaborate with creators.</p>

      <h3>📊 Creator Analytics Feed</h3>

      {analytics.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
            background: "#fafafa"
          }}
        >
          <h4>{item.platform} • @{item.creator}</h4>

          {item.platform === "Instagram" && (
            <>
              <p>Followers: {item.followers}</p>
              <p>Engagement Rate: {item.engagement}</p>
              <p>Reach: {item.reach}</p>
              <p>Last Post: {item.lastPost}</p>
            </>
          )}

          {item.platform === "YouTube" && (
            <>
              <p>Subscribers: {item.subscribers}</p>
              <p>Views (Last Video): {item.views}</p>
              <p>Avg Watch Time: {item.avgWatchTime}</p>
              <p>Last Upload: {item.lastVideo}</p>
            </>
          )}

          <button style={{ marginTop: "10px" }}>
            View Collaboration Options
          </button>
        </div>
      ))}
    </div>
  );
}