CREATE TABLE IF NOT EXISTS opponents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  country_name VARCHAR(80) NULL,
  competition_name VARCHAR(120) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_opponents PRIMARY KEY (id),
  KEY idx_opponents_name (name),
  KEY idx_opponents_competition_name (competition_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scouting_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  opponent_id BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  report_date DATE NULL,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_scouting_reports PRIMARY KEY (id),
  CONSTRAINT fk_scouting_reports_opponent
    FOREIGN KEY (opponent_id) REFERENCES opponents(id),
  CONSTRAINT uq_scouting_reports_opponent_version UNIQUE KEY (opponent_id, version_number),
  KEY idx_scouting_reports_status (status),
  KEY idx_scouting_reports_opponent_status (opponent_id, status),
  KEY idx_scouting_reports_report_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_catalog (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  system_code VARCHAR(20) NOT NULL,
  display_name VARCHAR(40) NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_system_catalog PRIMARY KEY (id),
  CONSTRAINT uq_system_catalog_system_code UNIQUE KEY (system_code),
  KEY idx_system_catalog_active_order (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS opponent_forms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scouting_report_id BIGINT UNSIGNED NOT NULL,
  recent_matches_played TINYINT UNSIGNED NULL,
  wins TINYINT UNSIGNED NULL,
  draws TINYINT UNSIGNED NULL,
  losses TINYINT UNSIGNED NULL,
  goals_for SMALLINT UNSIGNED NULL,
  goals_against SMALLINT UNSIGNED NULL,
  summary TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_opponent_forms PRIMARY KEY (id),
  CONSTRAINT fk_opponent_forms_scouting_report
    FOREIGN KEY (scouting_report_id) REFERENCES scouting_reports(id) ON DELETE CASCADE,
  CONSTRAINT uq_opponent_forms_report UNIQUE KEY (scouting_report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS opponent_system_usages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scouting_report_id BIGINT UNSIGNED NOT NULL,
  system_catalog_id BIGINT UNSIGNED NOT NULL,
  usage_role ENUM('primary', 'secondary', 'situational') NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_opponent_system_usages PRIMARY KEY (id),
  CONSTRAINT fk_opponent_system_usages_scouting_report
    FOREIGN KEY (scouting_report_id) REFERENCES scouting_reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_opponent_system_usages_system_catalog
    FOREIGN KEY (system_catalog_id) REFERENCES system_catalog(id),
  CONSTRAINT uq_opponent_system_usages_report_role_system
    UNIQUE KEY (scouting_report_id, usage_role, system_catalog_id),
  KEY idx_opponent_system_usages_report_order (scouting_report_id, display_order),
  KEY idx_opponent_system_usages_system_catalog (system_catalog_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS opponent_tactical_analyses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scouting_report_id BIGINT UNSIGNED NOT NULL,
  phase ENUM(
    'attack',
    'defense',
    'attacking_transition',
    'defensive_transition',
    'set_piece'
  ) NOT NULL,
  block_type ENUM('high_block', 'mid_block', 'low_block') NULL,
  analysis_text TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_opponent_tactical_analyses PRIMARY KEY (id),
  CONSTRAINT fk_opponent_tactical_analyses_scouting_report
    FOREIGN KEY (scouting_report_id) REFERENCES scouting_reports(id) ON DELETE CASCADE,
  KEY idx_opponent_tactical_analyses_report_phase (scouting_report_id, phase),
  KEY idx_opponent_tactical_analyses_block_type (block_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS opponent_swot_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scouting_report_id BIGINT UNSIGNED NOT NULL,
  item_type ENUM('strength', 'weakness', 'opportunity', 'threat') NOT NULL,
  item_text TEXT NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT pk_opponent_swot_items PRIMARY KEY (id),
  CONSTRAINT fk_opponent_swot_items_scouting_report
    FOREIGN KEY (scouting_report_id) REFERENCES scouting_reports(id) ON DELETE CASCADE,
  KEY idx_opponent_swot_items_report_type (scouting_report_id, item_type),
  KEY idx_opponent_swot_items_report_order (scouting_report_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
