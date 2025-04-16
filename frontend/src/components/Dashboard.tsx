import React, { useEffect, useState } from 'react';
import { getFileStats, getStorageSavings } from '../services/fileService';

const Dashboard = () => {
  const [stats, setStats] = useState<{ total_files: number; total_size: number } | null>(null);
  const [savings, setSavings] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      console.log('Dashboard: Fetching stats...');
      try {
        const [statsData, savingsData] = await Promise.all([
          getFileStats(),
          getStorageSavings()
        ]);
        
        console.log('=== Dashboard Stats ===');
        console.log('Total Files:', statsData.total_files);
        console.log('Total Size:', (statsData.total_size / (1024 ** 2)).toFixed(2), 'MB');
        console.log('Storage Savings:', (savingsData / (1024 ** 2)).toFixed(2), 'MB');
        console.log('=====================');
        
        setStats(statsData);
        setSavings(savingsData);
      } catch (error) {
        console.error('Dashboard: Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>Could not load stats.</p>;

  const readableSavings = savings !== null ? (savings / (1024 ** 2)).toFixed(2) : '0.00';
  const readableTotalSize = (stats.total_size / (1024 ** 2)).toFixed(2);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Analytics</h2>
      <div className="text-center">
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-blue-600">{stats.total_files}</span> files uploaded
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-green-600">{readableTotalSize} MB</span> total size
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-purple-600">{readableSavings} MB</span> saved due to deduplication
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
