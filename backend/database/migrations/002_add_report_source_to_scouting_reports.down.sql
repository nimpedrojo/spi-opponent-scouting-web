DROP INDEX idx_scouting_reports_report_source
ON scouting_reports;

ALTER TABLE scouting_reports
DROP COLUMN report_source;
