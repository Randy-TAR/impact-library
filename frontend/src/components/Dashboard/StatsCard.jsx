import React from 'react';
import { TrendingUp, Users, BookOpen, Download } from 'lucide-react';
import { Card } from 'react-bootstrap';

const iconMap = {
  books: BookOpen,
  downloads: Download,
  users: Users,
  trending: TrendingUp,
};

const iconColors = {
  books: 'primary',
  downloads: 'success',
  users: 'info',
  trending: 'warning',
};

const StatsCard = ({ title, value, icon, color, trend }) => {
  const Icon = iconMap[icon] || TrendingUp;
  const iconColor = iconColors[icon] || 'primary';

  return (
    <Card className="shadow-sm h-100 border-0 hover-shadow transition-all">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted small fw-semibold mb-1">{title}</p>
            <h2 className="display-5 fw-bold mb-2">{value}</h2>
            {trend && (
              <p className="text-success small mb-0">
                ↑ {trend} from last month
              </p>
            )}
          </div>
          <div className={`bg-${iconColor} bg-opacity-10 rounded-circle p-3`}>
            <Icon className={`text-${iconColor}`} size={24} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;