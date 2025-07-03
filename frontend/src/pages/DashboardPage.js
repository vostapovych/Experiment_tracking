import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SYNTHETIC_EXPERIMENTS_DATA } from '../syntheticData';

// Функція для визначення класу кольору - БЕЗ ЗМІН
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

// Допоміжна функція для визначення полярності метрики - БЕЗ ЗМІН
const isMetricHigherBetter = (metricName) => {
  return metricName.includes('accuracy') ||
         metricName.includes('progress_rate') ||
         metricName.includes('success_rate') ||
         metricName.includes('passed_count');
};

function DashboardPage() {
  const [experiments, setExperiments] = useState([]);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const navigate = useNavigate();

  const minMaxRanges = useMemo(() => {
    if (experiments.length === 0) return {};

    const ranges = {};
    const metricKeys = [
      'overall_success_rate',
      'overall_accuracy_avg',
      'avg_iterations_check',
      'avg_iterations_act',
      'avg_progress_rate',
      'max_tool_execution_time_ms_avg',
      'total_estimated_cost_usd',
      'total_tokens_used'
    ];

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
        // Дефолтно обираємо всі експерименти для порівняння, або нічого, щоб користувач сам обрав
        setSelectedForComparison([]); // Починаємо без обраних, щоб користувач сам обрав
    }
  }, []);

  const handleCheckboxChange = (runId) => {
    setSelectedForComparison(prevSelected => {
      if (prevSelected.includes(runId)) {
        return prevSelected.filter(id => id !== runId);
      } else {
        return [...prevSelected, runId]; // ДОЗВОЛЯЄМО ОБРАТИ БІЛЬШЕ, НІЖ 2
      }
    });
  };

  const handleCompareClick = () => {
    if (selectedForComparison.length === 0) { // Перевірка, щоб було хоча б 1 обрано
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

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [experiments, sortColumn, sortDirection]);


  const renderSortableHeader = (columnKey, headerText) => (
    <th onClick={() => handleSort(columnKey)} style={{ cursor: 'pointer' }}>
      {headerText}
      {sortColumn === columnKey && (
        <span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
      )}
    </th>
  );


  return (
    <div>
      <h2>All Experiments (Benchmark Level)</h2>

      <div className="controls">
        <label>
          Columns:
          <select disabled>
            <option>accuracy</option>
            <option>iterations check</option>
            <option>iterations act</option>
            <option>progress rate</option>
          </select>
        </label>
        <button onClick={handleCompareClick} disabled={selectedForComparison.length === 0}>
          Compare Selected ({selectedForComparison.length}) {/* Оновили текст кнопки */}
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
              {renderSortableHeader('overall_success_rate', 'Overall Success')}
              {renderSortableHeader('overall_accuracy_avg', 'Accuracy')}
              {renderSortableHeader('avg_iterations_check', 'Iterations Check')}
              {renderSortableHeader('avg_iterations_act', 'Iterations Act')}
              {renderSortableHeader('avg_progress_rate', 'Progress Rate')}
              {renderSortableHeader('max_tool_execution_time_ms_avg', 'Max Tool Latency Avg (ms)')}
              {renderSortableHeader('total_estimated_cost_usd', 'Estimated Cost Total (USD)')}
              {renderSortableHeader('total_tokens_used', 'Total Tokens')}
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
                <td><span className={getRangeColorClassCallback('overall_success_rate', exp.overall_summary_metrics.overall_success_rate)}>{String((exp.overall_summary_metrics.overall_success_rate * 100).toFixed(0))}%</span></td>
                <td><span className={getRangeColorClassCallback('overall_accuracy_avg', exp.overall_summary_metrics.overall_accuracy_avg)}>{exp.overall_summary_metrics.overall_accuracy_avg?.toFixed(2)}</span></td>
                <td><span className={getRangeColorClassCallback('avg_iterations_check', exp.overall_summary_metrics.avg_iterations_check)}>{exp.overall_summary_metrics.avg_iterations_check?.toFixed(0)}</span></td>
                <td><span className={getRangeColorClassCallback('avg_iterations_act', exp.overall_summary_metrics.avg_iterations_act)}>{exp.overall_summary_metrics.avg_iterations_act?.toFixed(0)}</span></td>
                <td><span className={getRangeColorClassCallback('avg_progress_rate', exp.overall_summary_metrics.avg_progress_rate)}>{exp.overall_summary_metrics.avg_progress_rate?.toFixed(2)}</span></td>
                <td><span className={getRangeColorClassCallback('max_tool_execution_time_ms_avg', exp.overall_summary_metrics.max_tool_execution_time_ms_avg)}>{exp.overall_summary_metrics.max_tool_execution_time_ms_avg?.toFixed(0)}</span></td>
                <td><span className={getRangeColorClassCallback('total_estimated_cost_usd', exp.overall_summary_metrics.total_estimated_cost_usd)}>{exp.overall_summary_metrics.total_estimated_cost_usd?.toFixed(4)}</span></td>
                <td><span className={getRangeColorClassCallback('total_tokens_used', exp.overall_summary_metrics.total_tokens_used)}>{exp.overall_summary_metrics.total_tokens_used}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardPage;