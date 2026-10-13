import React from 'react';
import { useNavigate } from 'react-router-dom';
import BugReportModal from '../components/BugReportModal';
export default function BugReportPage() {
  const navigate = useNavigate();
  return <main className="page-container"><h1>Help request</h1><BugReportModal onClose={() => navigate('/')} /></main>;
}
