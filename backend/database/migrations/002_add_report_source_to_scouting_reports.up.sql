ALTER TABLE scouting_reports
ADD COLUMN report_source ENUM('video_analysis', 'scouting', 'references')
NOT NULL DEFAULT 'scouting'
AFTER version_number;

CREATE INDEX idx_scouting_reports_report_source
ON scouting_reports (report_source);
