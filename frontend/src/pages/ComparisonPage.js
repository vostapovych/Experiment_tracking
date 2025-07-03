import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SYNTHETIC_EXPERIMENTS_DATA } from '../syntheticData';

// --- Функції визначення кольору та полярності (без змін, вони правильні) ---
const getRangeColorClass = (metricName, value, min, max, isHigherBetter) => {
  if (typeof value !== 'number' || isNaN(value) || min === undefined || max === undefined || min === null || max === null) {
    return '';
  }

  if (min === max) {
    return 'metric-value-box diff-neutral';
  }

  const normalizedValue = (value - min) / (max - min);
  const redThreshold = 0.3;
  const greenThreshold = 0.7;

  if (isHigherBetter) {
    if (normalizedValue >= greenThreshold) return 'metric-value-box diff-positive';
    if (normalizedValue <= redThreshold) return 'metric-value-box diff-negative';
    return 'metric-value-box diff-neutral';
  } else {
    if (normalizedValue <= redThreshold) return 'metric-value-box diff-positive';
    if (normalizedValue >= greenThreshold) return 'metric-value-box diff-negative';
    return 'metric-value-box diff-neutral';
  }
};

const isMetricHigherBetter = (metricName) => {
  return metricName.includes('accuracy') ||
         metricName.includes('progress_rate') ||
         metricName.includes('success_rate') ||
         metricName.includes('passed_count');
};

const getRelativeColorClass = (metricName, currentValue, baseValue) => {
  const currentNum = typeof currentValue === 'number' ? currentValue : null;
  const baseNum = typeof baseValue === 'number' ? baseValue : null;

  if (currentNum === null || baseNum === null || (baseNum === 0 && currentNum === 0)) {
    return 'metric-value-box diff-neutral';
  }

  if (baseNum === 0 && currentNum !== 0) {
    return isMetricHigherBetter(metricName) ? 'metric-value-box diff-positive' : 'metric-value-box diff-negative';
  }

  const diff = currentNum - baseNum;
  const isHigherBetterMetric = isMetricHigherBetter(metricName);

  if (isHigherBetterMetric) {
    if (diff > 0) return 'metric-value-box diff-positive';
    if (diff < 0) return 'metric-value-box diff-negative';
  } else {
    if (diff < 0) return 'metric-value-box diff-positive';
    if (diff > 0) return 'metric-value-box diff-negative';
  }
  return 'metric-value-box diff-neutral';
};
// --- Кінець функцій ---


function ComparisonPage() {
  const location = useLocation();
  const [selectedRunsData, setSelectedRunsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const [baseRunId, setBaseRunId] = useState(null);

  const selectedRunIds = location.state?.selectedRunIds || [];

  // --- ВИПРАВЛЕНО: ТЕПЕР ТІЛЬКИ ОДИН useMemo ДЛЯ transformedData ---
  const transformedData = useMemo(() => {
    const testsMap = new Map();

    const allUniqueTestCaseIds = new Set();
    selectedRunsData.forEach(exp => {
        exp.test_results.forEach(testCase => {
            allUniqueTestCaseIds.add(testCase.test_case_id);
        });
    });

    allUniqueTestCaseIds.forEach(tcId => {
      const runsForThisTestCase = [];
      selectedRunsData.forEach(exp => {
        const testCaseResult = exp.test_results.find(tr => tr.test_case_id === tcId);
        runsForThisTestCase.push({
          run_id: exp.run_id,
          agent_version: exp.agent_version,
          status: testCaseResult?.test_case_status || 'N/A',
          metrics: testCaseResult?.metrics || {},
          testCaseName: testCaseResult?.test_case_name || tcId,
          s3_test_case_log_url: testCaseResult?.s3_test_case_log_url
        });
      });
      testsMap.set(tcId, {
        testCaseId: tcId, // ТЕПЕР testCaseId ЯВНО ДОДАНО ДО ОБ'ЄКТА ГРУПИ ТЕСТ-КЕЙСІВ
        testCaseName: testsMap.get(tcId)?.testCaseName || runsForThisTestCase[0]?.testCaseName || tcId,
        runs: runsForThisTestCase
      });
    });

    return Array.from(testsMap.values());
  }, [selectedRunsData]);


  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortRunsInTestCase = useCallback((runs) => {
    const baseRun = runs.find(r => r.run_id === baseRunId);
    const otherRuns = runs.filter(r => r.run_id !== baseRunId);

    if (!sortColumn || !baseRun) {
      return baseRun ? [baseRun, ...otherRuns] : runs;
    }

    const sortedOtherRuns = [...otherRuns].sort((a, b) => {
      const aValue = a.metrics[sortColumn];
      const bValue = b.metrics[sortColumn];

      if (typeof aValue !== 'number' || isNaN(aValue) || aValue === null) return sortDirection === 'asc' ? 1 : -1;
      if (typeof bValue !== 'number' || isNaN(bValue) || bValue === null) return sortDirection === 'asc' ? -1 : 1;

      const isHigherBetterCol = isMetricHigherBetter(sortColumn);

      let comparison = aValue - bValue;
      if (!isHigherBetterCol) {
        comparison = bValue - aValue;
      }

      if (sortDirection === 'asc') {
        return comparison;
      } else {
        return -comparison;
      }
    });

    return [baseRun, ...sortedOtherRuns];
  }, [baseRunId, sortColumn, sortDirection]);

  const allMetricNames = useMemo(() => {
    const metricNamesSet = new Set();
    selectedRunsData.forEach(exp => {
      exp.test_results.forEach(tc => {
        if (tc.metrics) {
          Object.keys(tc.metrics).forEach(metric => metricNamesSet.add(metric));
        }
      });
    });
    return Array.from(metricNamesSet);
  }, [selectedRunsData]);


  useEffect(() => {
    const fetchAndFilterData = () => {
      const filteredData = SYNTHETIC_EXPERIMENTS_DATA.filter(exp =>
        selectedRunIds.includes(exp.run_id)
      );
      if (filteredData.length === 0 && selectedRunIds.length > 0) {
        setError("No data found for selected experiments.");
      }
      setSelectedRunsData(filteredData);
      setLoading(false);

      if (filteredData.length > 0 && !baseRunId) {
          setBaseRunId(filteredData[0].run_id);
      }
    };
    fetchAndFilterData();
  }, [selectedRunIds, baseRunId]);


  // --- Рендеринг ---
  if (loading) return <p>Loading comparison data...</p>;
  if (error) return <p style={{ color: 'red' }}>Error loading comparison: {error}</p>;
  if (selectedRunIds.length === 0) return <p>No experiments selected for comparison. Please go back to the <a href="/">Dashboard</a>.</p>;
  if (selectedRunsData.length === 0) return <p>Loading selected experiments...</p>;

  const baseRun = selectedRunsData.find(exp => exp.run_id === baseRunId);
  if (!baseRun) return <p>Selected base run not found. Please re-select experiments from Dashboard or ensure data is loaded.</p>;

  return (
    <div>
      <h2>Detailed Comparison by Test Case</h2>
      <p>Selected Experiments: <strong>{selectedRunIds.join(', ')}</strong></p>

      {/* Випадаючий список для вибору базового запуску */}
      <div className="controls" style={{ marginBottom: '20px' }}>
        <label>
          Base Experiment:
          <select value={baseRunId} onChange={(e) => setBaseRunId(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }}>
            {selectedRunsData.map(exp => (
              <option key={exp.run_id} value={exp.run_id}>
                {exp.run_id} ({exp.agent_version})
              </option>
            ))}
          </select>
        </label>
      </div>

      {transformedData.map(testCaseGroup => {
        const runsInThisTestCase = testCaseGroup.runs;
        const sortedRunsForDisplay = sortRunsInTestCase(runsInThisTestCase);

        // --- ВИПРАВЛЕНО: Правильний пошук результату тест-кейсу для базового рану ---
        // Використовуємо testCaseGroup.testCaseId для пошуку, оскільки ми додали його у transformedData
        const baseRunTestCaseResultForThisTC = baseRun.test_results.find(tc => tc.test_case_id === testCaseGroup.testCaseId);
        const baseMetricsForThisTC = baseRunTestCaseResultForThisTC?.metrics || {};

        return (
          <div key={testCaseGroup.testCaseId} className="test-case-group" style={{ marginBottom: '40px', border: '1px solid #eee', padding: '20px', borderRadius: '8px' }}>
            <h3>Test Case: {testCaseGroup.testCaseName}</h3>

            <div className="controls" style={{ marginBottom: '15px' }}>
              <label>
                Columns:
                <select disabled>
                  {allMetricNames.map(name => <option key={name}>{name.replace(/_/g, ' ').trim()}</option>)}
                </select>
              </label>
            </div>

            <div className="table-responsive">
              <table style={{ width: 'auto', minWidth: '100%', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>Run / Agent</th>
                    <th style={{ width: '80px' }}>Status</th>
                    {allMetricNames.map(metricName => (
                      <th key={metricName} style={{ width: '100px' }}>
                        {metricName.replace(/_/g, ' ').replace('avg', 'Avg').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRunsForDisplay.map(run => (
                    <tr key={run.run_id}>
                      <td>{run.run_id} ({run.agent_version})</td>
                      <td>{run.status}</td>
                      {allMetricNames.map(metricName => (
                        <td key={`${run.run_id}-${metricName}`}>
                          {run.run_id === baseRunId ? (
                            <span className="metric-value-box metric-value-box-base">
                                {typeof run.metrics[metricName] === 'number' ? run.metrics[metricName]?.toFixed(2) : run.metrics[metricName] ?? 'N/A'}
                            </span>
                          ) : (
                            <span className={getRelativeColorClass(metricName, run.metrics[metricName], baseMetricsForThisTC[metricName])}>
                                {typeof run.metrics[metricName] === 'number' ? run.metrics[metricName]?.toFixed(2) : run.metrics[metricName] ?? 'N/A'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ComparisonPage;