import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";


export default function VideoPerformanceGraph() {
    const data = [
        { name: "Video 1", views: 12000 },
        { name: "Video 2", views: 18000 },
        { name: "Video 3", views: 9500 },
        { name: "Video 4", views: 22000 },
    ];

    return (
        <div style={{ width: "100%", height: 300, marginTop: "20px" }}>
            <h3>📊 Performance of Last 4 Videos</h3>
          
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#000"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}