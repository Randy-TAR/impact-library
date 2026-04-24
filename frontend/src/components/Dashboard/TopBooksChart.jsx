import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from 'react-bootstrap';

const TopBooksChart = ({ data }) => {
  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="fw-semibold mb-4">Top 5 Most Downloaded Books</Card.Title>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="title" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} downloads`, 'Downloads']}
                cursor={{ fill: 'rgba(13, 110, 253, 0.1)' }}
              />
              <Bar 
                dataKey="download_count" 
                fill="#0d6efd"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopBooksChart;