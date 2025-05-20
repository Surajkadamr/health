'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar'; // Updated path alias
import Footer from '@/components/Footer'; // Updated path alias
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'; // ShadCN Card
import styles from './DashboardPage.module.css'; // Import CSS module

// Helper function to format keys (e.g., camelCase to Title Case)
const formatDetailKey = (key) => {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function DashboardPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('healthData');
    if (data) {
      try {
        setHealthData(JSON.parse(data));
      } catch (error) {
        console.error("Failed to parse health data:", error);
        router.push('/');
      }
    } else {
      console.warn("No health data found in sessionStorage.");
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      // className="flex justify-center items-center min-h-screen"
      <div className={styles.loadingContainer}>
        {/* className="text-lg text-muted-foreground" */}
        <p className={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  if (!healthData) {
    return (
      <>
        <Navbar />
        {/* className="container mx-auto max-w-5xl py-8 px-4 text-center" */}
        <main className={styles.noDataMain}>
          {/* <Card> */}
          <div className={styles.noDataCard}>
            {/* <CardHeader> */}
            <div className={styles.noDataCardHeader}>
              {/* <CardTitle> */}
              <h2 className={styles.noDataCardTitle}>No Data Available</h2>
            </div>
            {/* </CardHeader> */}
            {/* <CardContent> */}
            <div className={styles.noDataCardContent}>
              {/* className="text-muted-foreground" */}
              <p>
                No health data found. Please{' '}
                {/* className="text-primary hover:underline" */}
                <Link href="/" className={styles.uploadLink}>
                  upload a PDF document
                </Link>{' '}
                to view the dashboard.
              </p>
            </div>
            {/* </CardContent> */}
          </div>
          {/* </Card> */}
        </main>
        <Footer />
      </>
    );
  }

  const { patientInfo, timeline, overallSummary } = healthData;

  const getFlagClass = (flag) => {
    if (!flag) return styles.flagMuted;
    switch (flag.toLowerCase()) {
      case 'high': return styles.flagHigh;
      case 'low': return styles.flagLow;
      case 'normal': return styles.flagNormal;
      default: return styles.flagMuted;
    }
  };

  return (
    <>
      <Navbar />
      {/* className="bg-slate-50 dark:bg-slate-950 py-8" */}
      <main className={styles.dashboardMain}>
        {/* className="container mx-auto max-w-6xl px-4" */}
        <div className={styles.dashboardContainer}>
          {/* className="text-3xl sm:text-4xl font-bold text-center mb-8 text-foreground" */}
          <h1 className={styles.dashboardTitle}>
            Health Dashboard
          </h1>

          {patientInfo && (
            // <Card className="mb-8 shadow-lg">
            <div className={`${styles.card} ${styles.patientInfoCard}`}>
              {/* <CardHeader> */}
              <div className={styles.cardHeader}>
                {/* <CardTitle className="text-2xl"> */}
                <h2 className={styles.cardTitle}>Patient Information</h2>
              </div>
              {/* </CardHeader> */}
              {/* <CardContent> */}
              <div className={styles.cardContent}>
                {/* className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm" */}
                <div className={styles.patientInfoGrid}>
                  {Object.entries(patientInfo).map(([key, value]) => (
                    // className={key === 'address' || key === 'allergy' ? 'md:col-span-2' : ''}
                    <div key={key} className={`${styles.patientInfoItem} ${key === 'address' || key === 'allergy' ? styles.patientInfoItemFullWidth : ''}`}>
                      {/* className="font-semibold text-foreground" */}
                      <span className={styles.patientInfoKey}>{formatDetailKey(key)}:</span>
                      {/* className="ml-2 text-muted-foreground" */}
                      <span className={styles.patientInfoValue}>{String(value) || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* </CardContent> */}
            </div>
            // </Card>
          )}

          {overallSummary && (
            // <Card className="mb-8 shadow-lg">
            <div className={`${styles.card} ${styles.summaryCard}`}>
              {/* <CardHeader> */}
              <div className={styles.cardHeader}>
                {/* <CardTitle className="text-2xl"> */}
                <h2 className={styles.cardTitle}>Overall Summary</h2>
              </div>
              {/* </CardHeader> */}
              {/* <CardContent> */}
              <div className={styles.cardContent}>
                {/* className="text-muted-foreground whitespace-pre-wrap" */}
                <p className={styles.summaryText}>{overallSummary}</p>
              </div>
              {/* </CardContent> */}
            </div>
            // </Card>
          )}

          {timeline && timeline.length > 0 && (
            // <Card className="shadow-lg">
            <div className={`${styles.card} ${styles.timelineCard}`}>
              {/* <CardHeader> */}
              <div className={styles.cardHeader}>
                {/* <CardTitle className="text-2xl"> */}
                <h2 className={styles.cardTitle}>Timeline</h2>
              </div>
              {/* </CardHeader> */}
              {/* <CardContent className="space-y-6"> */}
              <div className={`${styles.cardContent} ${styles.timelineContent}`}>
                {timeline.map((event) => (
                  // <Card key={event.id} className="border-l-4 border-primary">
                  <div key={event.id} className={`${styles.timelineEventCard}`}>
                    {/* <CardHeader> */}
                    <div className={styles.cardHeader}>
                      {/* <CardTitle className="text-xl"> */}
                      <h3 className={styles.timelineEventTitle}>{formatDetailKey(event.eventType)}</h3>
                      {/* <CardDescription> */}
                      <p className={styles.timelineEventDescription}>
                        {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString()}
                        {event.facilityName && ` - ${event.facilityName}`}
                      </p>
                      {/* </CardDescription> */}
                    </div>
                    {/* </CardHeader> */}
                    {/* <CardContent> */}
                    <div className={styles.cardContent}>
                      {/* className="text-sm text-muted-foreground mb-3 italic" */}
                      <p className={styles.timelineEventSummary}>{event.summary}</p>
                      {event.details && (
                        // className="mt-4 space-y-3 text-sm"
                        <div className={styles.timelineEventDetailsContainer}>
                          {/* className="font-semibold text-md text-foreground mb-2" */}
                          <h4 className={styles.timelineDetailsTitle}>Details:</h4>
                          {Object.entries(event.details).map(([key, value]) => {
                            if (key === 'panels' && Array.isArray(value)) {
                              return (
                                // className="space-y-4"
                                <div key={key} className={styles.panelsContainer}>
                                  {value.map((panel, panelIndex) => (
                                    // className="p-3 border rounded-md bg-slate-50 dark:bg-slate-800/30"
                                    <div key={panelIndex} className={styles.panel}>
                                      {/* className="font-semibold text-foreground mb-2" */}
                                      <h5 className={styles.panelName}>{panel.panelName}</h5>
                                      {/* className="overflow-x-auto" */}
                                      <div className={styles.tableContainer}>
                                        {/* className="w-full text-left text-xs" */}
                                        <table className={styles.resultsTable}>
                                          {/* className="bg-slate-100 dark:bg-slate-700/50" */}
                                          <thead className={styles.tableHead}>
                                            <tr>
                                              {/* className="p-2" */}
                                              <th>Test Name</th>
                                              <th>Value</th>
                                              <th>Unit</th>
                                              <th>Reference Range</th>
                                              <th>Flag</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {panel.results.map((result, resultIndex) => (
                                              // className={`border-t border-border ${result.flag === 'High' || result.flag === 'Low' ? 'bg-destructive/10' : ''}`}
                                              <tr key={resultIndex} className={`${styles.tableRow} ${result.flag === 'High' || result.flag === 'Low' ? styles.tableRowFlagged : ''}`}>
                                                {/* className="p-2 text-foreground" */}
                                                <td>{result.testName}</td>
                                                <td>{result.value}</td>
                                                {/* className="p-2 text-muted-foreground" */}
                                                <td>{result.unit || 'N/A'}</td>
                                                <td>{result.referenceRange || 'N/A'}</td>
                                                {/* className={`p-2 ${getFlagClass(result.flag)}`} */}
                                                <td className={getFlagClass(result.flag)}>{result.flag || 'N/A'}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            if (typeof value === 'object' && value !== null) {
                              return (
                                // className="p-3 border rounded-md bg-slate-50 dark:bg-slate-800/30"
                                <div key={key} className={styles.detailObject}>
                                  {/* className="font-semibold text-foreground mb-1" */}
                                  <h5 className={styles.detailObjectTitle}>{formatDetailKey(key)}:</h5>
                                  {/* className="pl-2 space-y-0.5" */}
                                  <div className={styles.detailObjectContent}>
                                    {Object.entries(value).map(([itemKey, itemValue]) => (
                                      <p key={itemKey}>
                                        {/* className="font-medium text-foreground/80" */}
                                        <span className={styles.detailItemKey}>{formatDetailKey(itemKey)}:</span>
                                        {/* className="ml-1.5 text-muted-foreground" */}
                                        <span className={styles.detailItemValue}>{String(itemValue)}</span>
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              // className="py-1"
                              <div key={key} className={styles.detailSimple}>
                                {/* className="font-semibold text-foreground" */}
                                <span className={styles.detailSimpleKey}>{formatDetailKey(key)}:</span>
                                {/* className="ml-2 text-muted-foreground" */}
                                <span className={styles.detailSimpleValue}>{String(value)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* </CardContent> */}
                  </div>
                  // </Card>
                ))}
              </div>
              {/* </CardContent> */}
            </div>
            // </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
