INSERT INTO system_catalog (
  system_code,
  display_name,
  display_order,
  is_active
)
VALUES
  ('1-4-3-3', '1-4-3-3', 1, 1),
  ('1-4-4-2', '1-4-4-2', 2, 1),
  ('1-4-2-3-1', '1-4-2-3-1', 3, 1),
  ('1-3-4-3', '1-3-4-3', 4, 1),
  ('1-3-5-2', '1-3-5-2', 5, 1),
  ('1-5-3-2', '1-5-3-2', 6, 1),
  ('1-4-1-4-1', '1-4-1-4-1', 7, 1),
  ('1-4-5-1', '1-4-5-1', 8, 1)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active);
