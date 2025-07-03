import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SYNTHETIC_EXPERIMENTS_DATA } from '../syntheticData';

// --- Функції визначення кольору та полярності (без змін) ---
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
// --- Кінець функцій визначення кольору ---


const DASHBOARD_METRIC_CONFIG = [
  { key: 'overall_success_rate', header: 'Overall Success' },
  { key: 'overall_accuracy_avg', header: 'Accuracy' },
  { key: 'avg_iterations_check', header: 'Iterations Check' },
  { key: 'avg_iterations_act', header: 'Iterations Act' },
  { key: 'avg_progress_rate', header: 'Progress Rate' },
  { key: 'max_tool_execution_time_ms_avg', header: 'Max Tool Latency Avg (ms)' },
  { key: 'total_estimated_cost_usd', header: 'Estimated Cost Total (USD)' },
  { key: 'total_tokens_used', header: 'Total Tokens' }
];


function DashboardPage() {
  const [experiments, setExperiments] = useState([]);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // --- ВИПРАВЛЕНО: СТАН ВИДИМИХ КОЛОНОК ІНІЦІАЛІЗУЄТЬСЯ ПРАВИЛЬНО ---
  // Ініціалізуємо тут, щоб усі були видимі за замовчуванням
  const [visibleColumns, setVisibleColumns] = useState(DASHBOARD_METRIC_CONFIG.map(m => m.key));

  const navigate = useNavigate();

  const minMaxRanges = useMemo(() => {
    if (experiments.length === 0) return {};

    const ranges = {};
    const metricKeys = DASHBOARD_METRIC_CONFIG.map(m => m.key);

    metricKeys.forEach(key => {
      const values = experiments
        .map(exp => exp.overall_summary_metrics[key])
        .filter(value => typeof value === 'number' && !isNaN(value) && value !== null);

      if (values.length > 0) {
        ranges[key] = {
          min: Math.min(...values),
          max: Math.max(...values),
        };
      }
    });
    return ranges;
  }, [experiments]);

  const getRangeColorClassCallback = useCallback((metricName, value) => {
    return getRangeColorClass(metricName, value, minMaxRanges[metricName]?.min, minMaxRanges[metricName]?.max, isMetricHigherBetter(metricName));
  }, [minMaxRanges]);


  useEffect(() => {
    setExperiments(SYNTHETIC_EXPERIMENTS_DATA);

    if (SYNTHETIC_EXPERIMENTS_DATA.length > 0) {
        setSelectedForComparison([]);
    }
  }, []);

  const handleColumnSelectionChange = (event) => {
    const { options } = event.target;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setVisibleColumns(selectedValues);
  };


  const handleCheckboxChange = (runId) => {
    setSelectedForComparison(prevSelected => {
      if (prevSelected.includes(runId)) {
        return prevSelected.filter(id => id !== runId);
      } else {
        return [...prevSelected, runId];
      }
    });
  };

  const handleCompareClick = () => {
    if (selectedForComparison.length === 0) {
      alert("Будь ласка, оберіть хоча б один експеримент для порівняння.");
      return;
    }
    navigate('/compare', { state: { selectedRunIds: selectedForComparison } });
  };

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedExperiments = useMemo(() => {
    if (!sortColumn) {
      return experiments;
    }

    return [...experiments].sort((a, b) => {
      const aValue = a.overall_summary_metrics[sortColumn];
      const bValue = b.overall_summary_metrics[sortColumn];

      if (sortColumn === 'timestamp_utc') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        if (sortDirection === 'asc') return dateA.getTime() - dateB.getTime();
        return dateB.getTime() - dateA.getTime();
      }

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
  }, [experiments, sortColumn, sortDirection]);

  const renderSortableHeader = (columnKey, headerText) => {
    if (!visibleColumns.includes(columnKey)) return null;
    return (
      <th onClick={() => handleSort(columnKey)} style={{ cursor: 'pointer' }}>
        {headerText}
        {sortColumn === columnKey && (
          <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
        )}
      </th>
    );
  };


  return (
    <div>
      <h2>All Experiments (Benchmark Level)</h2>

      <div className="controls">
        {/* ВИПРАВЛЕНО: ТЕПЕР SELECT В ОДНОМУ LABEL */}
        <label>
          Columns:
          <select multiple value={visibleColumns} onChange={handleColumnSelectionChange} style={{ minHeight: '100px' }}>
            {DASHBOARD_METRIC_CONFIG.map(metric => (
              <option key={metric.key} value={metric.key}>
                {metric.header}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleCompareClick} disabled={selectedForComparison.length === 0}>
          Compare Selected ({selectedForComparison.length})
        </button>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Run ID</th>
              <th>Agent Version</th>
              {renderSortableHeader('timestamp_utc', 'Timestamp (UTC)')}
              <th>Benchmark Suite</th>
              {DASHBOARD_METRIC_CONFIG.map(metric => (
                visibleColumns.includes(metric.key) && renderSortableHeader(metric.key, metric.header)
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedExperiments.map(exp => (
              <tr key={exp.run_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(exp.run_id)}
                    onChange={() => handleCheckboxChange(exp.run_id)}
                  />
                </td>
                <td>{exp.run_id}</td>
                <td>{exp.agent_version}</td>
                <td>{new Date(exp.timestamp_utc).toLocaleString()}</td>
                <td>{exp.benchmark_suite_name}</td>
                {DASHBOARD_METRIC_CONFIG.map(metric => (
                  visibleColumns.includes(metric.key) && (
                    <td key={exp.run_id + '-' + metric.key}>
                      <span className={getRangeColorClassCallback(metric.key, exp.overall_summary_metrics[metric.key])}>
                        {typeof exp.overall_summary_metrics[metric.key] === 'number' ? exp.overall_summary_metrics[metric.key]?.toFixed(metric.key.includes('rate') || metric.key.includes('accuracy') ? 2 : 0) : exp.overall_summary_metrics[metric.key] ?? 'N/A'}
                      </span>
                    </td>
                  )
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardPage;