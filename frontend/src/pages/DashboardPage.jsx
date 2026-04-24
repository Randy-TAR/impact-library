import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import StatsCard from '../components/Dashboard/StatsCard';
import TopBooksChart from '../components/Dashboard/TopBooksChart';
import CategoryChart from '../components/Dashboard/CategoryChart';
import RecentUploads from '../components/Dashboard/RecentUploads';
import Loader from '../components/Common/Loader';
import { useNotification } from '../hooks/useNotification';
import { Container, Row, Col, Card } from 'react-bootstrap';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStatistics();
      setStats(data);
    } catch (error) {
      showError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="py-4">
      <Container fluid>
        {/* Header */}
        <div className="mb-4">
          <h1 className="display-6 fw-bold text-dark mb-2">Dashboard</h1>
          <p className="text-muted">Library Overview and Statistics</p>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4 g-3">
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Books"
              value={stats?.total_books || 0}
              icon="books"
              color="primary"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Downloads"
              value={stats?.total_downloads || 0}
              icon="downloads"
              color="success"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Total Users"
              value={stats?.users?.reduce((sum, u) => sum + parseInt(u.count), 0) || 0}
              icon="users"
              color="info"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatsCard
              title="Categories"
              value={stats?.books_by_category?.length || 0}
              icon="trending"
              color="warning"
            />
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4 g-3">
          <Col lg={6}>
            <TopBooksChart data={stats?.top_books || []} />
          </Col>
          <Col lg={6}>
            <CategoryChart data={stats?.books_by_category || []} />
          </Col>
        </Row>

        {/* Recent Uploads */}
        <Row className="mb-4">
          <Col>
            <RecentUploads uploads={stats?.recent_uploads || []} />
          </Col>
        </Row>

        {/* Users Breakdown */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-semibold text-dark mb-4">Users Breakdown</h5>
                <Row className="g-3">
                  {stats?.users?.map((user) => (
                    <Col md={4} key={user.role}>
                      <div className="bg-light rounded-3 p-4 text-center">
                        <p className="text-muted small mb-1">Role</p>
                        <p className="h5 fw-semibold text-dark mb-2 text-capitalize">{user.role}</p>
                        <p className="display-6 fw-bold text-primary mb-0">{user.count}</p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage;