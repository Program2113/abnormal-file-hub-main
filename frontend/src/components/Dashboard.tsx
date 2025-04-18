import React, { useEffect, useState } from 'react';
import { getFileStats, getStorageSavings } from '../services/fileService';
import { logger } from '../utils/logger';

const Dashboard = () => {
  const [stats, setStats] = useState<{ total_files: number; total_size: number } | null>(null);
  const [savings, setSavings] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      console.log('Dashboard: Starting to fetch analytics data...');
      logger.info('Dashboard: Fetching analytics data...');
      try {
        const [statsData, savingsData] = await Promise.all([
          getFileStats(),
          getStorageSavings()
        ]);
        
        console.log('Dashboard: Raw stats data:', statsData);
        console.log('Dashboard: Raw savings data:', savingsData);
        
        logger.info('Dashboard: Analytics data received', {
          total_files: statsData.total_files,
          total_size: statsData.total_size,
          savings: savingsData
        });
        
        setStats(statsData);
        setSavings(savingsData);
      } catch (error) {
        console.error('Dashboard: Error fetching analytics data:', error);
        logger.error('Dashboard: Error fetching analytics data', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>Could not load stats.</p>;

  console.log('Dashboard: Current stats:', stats);
  console.log('Dashboard: Current savings:', savings);

  const readableSavings = savings !== null ? (savings / (1024 ** 2)).toFixed(2) : '0.00';
  const readableTotalSize = stats.total_size.toFixed(2);

  console.log('Dashboard: Display values - total_size:', readableTotalSize, 'savings:', readableSavings);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Analytics</h2>
      <div className="text-center">
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-blue-600">{stats.total_files}</span> files uploaded
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-green-600">{readableTotalSize}</span> MB total size
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-purple-600">{readableSavings}</span> MB saved due to deduplication
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
