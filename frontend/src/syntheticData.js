// my-custom-tracker/frontend/src/syntheticData.js
// Це масив об'єктів, кожен з яких імітує повний JSON-звіт бенчмарку

export const SYNTHETIC_EXPERIMENTS_DATA = [
  {
    "run_id": "bmark-run-v1.0-001",
    "agent_version": "research-agent-v1.0",
    "timestamp_utc": "2025-07-01T09:00:00Z",
    "benchmark_suite_name": "GitHub_Automation_Login_CreateMessage",
    "test_environment": "dev",
    "overall_summary_metrics": {
      "total_tests_executed": 3,
      "total_tests_passed": 3,
      "overall_success_rate": 1.0,
      "overall_accuracy_avg": 0.95,
      "avg_iterations_check": 3.0,
      "avg_iterations_act": 4.0,
      "avg_progress_rate": 0.98,
      "overall_checkpoints_passed_avg": 2.0,
      "max_tool_execution_time_ms_avg": 850.0,
      "total_estimated_cost_usd": 0.0150,
      "total_tokens_used": 1500
    },
    "test_results": [
      {
        "test_case_id": "tc-login-success-01",
        "test_case_name": "Login to GitHub (Success)",
        "test_case_status": "Passed",
        "metrics": {
          "accuracy": 0.98, "iterations_check": 2, "iterations_act": 3, "progress_rate": 1.0,
          "checkpoints_passed_count": 1, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 700.0, "estimated_cost_usd": 0.005, "total_tokens_used": 500
        }
      },
      {
        "test_case_id": "tc-create-message-02",
        "test_case_name": "Create GitHub Message (Success)",
        "test_case_status": "Passed",
        "metrics": {
          "accuracy": 0.97, "iterations_check": 1, "iterations_act": 2, "progress_rate": 1.0,
          "checkpoints_passed_count": 1, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 600.0, "estimated_cost_usd": 0.004, "total_tokens_used": 400
        }
      },
      {
        "test_case_id": "tc-close-issue-03",
        "test_case_name": "Close GitHub Issue (Success)",
        "test_case_status": "Passed",
        "metrics": {
          "accuracy": 0.96, "iterations_check": 2, "iterations_act": 3, "progress_rate": 1.0,
          "checkpoints_passed_count": 1, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 500.0, "estimated_cost_usd": 0.003, "total_tokens_used": 300
        }
      }
    ]
  },
  {
    "run_id": "bmark-run-v1.1-001",
    "agent_version": "research-agent-v1.1",
    "timestamp_utc": "2025-07-02T10:30:00Z",
    "benchmark_suite_name": "GitHub_Automation_Login_CreateMessage",
    "test_environment": "dev",
    "overall_summary_metrics": {
      "total_tests_executed": 3,
      "total_tests_passed": 2,
      "overall_success_rate": 0.66,
      "overall_accuracy_avg": 0.88,
      "avg_iterations_check": 2.5,
      "avg_iterations_act": 3.0,
      "avg_progress_rate": 0.8,
      "overall_checkpoints_passed_avg": 1.33,
      "max_tool_execution_time_ms_avg": 750.0,
      "total_estimated_cost_usd": 0.0120,
      "total_tokens_used": 1200
    },
    "test_results": [
      {
        "test_case_id": "tc-login-success-01",
        "test_case_name": "Login to GitHub (Success)",
        "test_case_status": "Passed",
        "metrics": {
          "accuracy": 0.90, "iterations_check": 2, "iterations_act": 2, "progress_rate": 1.0,
          "checkpoints_passed_count": 1, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 650.0, "estimated_cost_usd": 0.004, "total_tokens_used": 450
        }
      },
      {
        "test_case_id": "tc-create-message-02",
        "test_case_name": "Create GitHub Message (Failed)",
        "test_case_error_message": "GitHub API: Rate limit exceeded.",
        "test_case_status": "Failed",
        "metrics": {
          "accuracy": 0.50, "iterations_check": 3, "iterations_act": 4, "progress_rate": 0.5,
          "checkpoints_passed_count": 0, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 1200.0, "estimated_cost_usd": 0.005, "total_tokens_used": 500
        }
      },
      {
        "test_case_id": "tc-close-issue-03",
        "test_case_name": "Close GitHub Issue (Success)",
        "test_case_status": "Passed",
        "metrics": {
          "accuracy": 0.95, "iterations_check": 2, "iterations_act": 3, "progress_rate": 1.0,
          "checkpoints_passed_count": 1, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 700.0, "estimated_cost_usd": 0.003, "total_tokens_used": 250
        }
      }
    ]
  },
  {
    "run_id": "bmark-run-v1.2-001",
    "agent_version": "research-agent-v1.2-beta",
    "timestamp_utc": "2025-07-03T14:45:00Z",
    "benchmark_suite_name": "GitHub_Automation_Login_CreateMessage",
    "test_environment": "dev",
    "overall_summary_metrics": {
      "total_tests_executed": 3,
      "total_tests_passed": 3,
      "overall_success_rate": 1.0,
      "overall_accuracy_avg": 0.98,
      "avg_iterations_check": 2.0,
      "avg_iterations_act": 2.5,
      "avg_progress_rate": 0.99,
      "overall_checkpoints_passed_avg": 2.0,
      "max_tool_execution_time_ms_avg": 650.0,
      "total_estimated_cost_usd": 0.0100,
      "total_tokens_used": 1000
    },
    "test_results": [
      {
        "test_case_id": "tc-login-success-01",
        "test_case_name": "Login to GitHub (Success)",
        "test_case_status": "Passed",
        "metrics": {
          "accuracy": 0.99, "iterations_check": 1, "iterations_act": 2, "progress_rate": 1.0,
          "checkpoints_passed_count": 1, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 600.0, "estimated_cost_usd": 0.003, "total_tokens_used": 350
        }
      },
      {
        "test_case_id": "tc-create-message-02",
        "test_case_name": "Create GitHub Message (Success)",
        "test_case_status": "Passed",
        "metrics": {
          "accuracy": 0.98, "iterations_check": 2, "iterations_act": 3, "progress_rate": 1.0,
          "checkpoints_passed_count": 1, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 700.0, "estimated_cost_usd": 0.004, "total_tokens_used": 400
        }
      },
      {
        "test_case_id": "tc-close-issue-03",
        "test_case_name": "Close GitHub Issue (Success)",
        "test_case_status": "Passed",
        "metrics": {
          "accuracy": 0.97, "iterations_check": 1, "iterations_act": 2, "progress_rate": 1.0,
          "checkpoints_passed_count": 1, "total_checkpoints_for_test": 1,
          "max_tool_execution_time_ms": 650.0, "estimated_cost_usd": 0.003, "total_tokens_used": 250
        }
      }
    ]
  }
];