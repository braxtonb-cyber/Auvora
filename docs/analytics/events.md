# AUVORA Analytics Events

## Naming Convention
- Format: `domain_object_action`
- Use present-tense verbs.
- Keep names stable; evolve payloads, not event names.

## Global Payload (Attach To Every Event)
- `session_id`
- `user_id` (or anonymous id)
- `platform` (ios_safari, android_chrome, desktop)
- `app_version`
- `timestamp_iso`
- `entry_surface` (aura, scent, style, sound, profile)

## Aura Funnel Events
| Event | Trigger Moment | Suggested Payload |
|---|---|---|
| `aura_input_started` | User focuses aura input for first keystroke | `source`, `has_profile_context` |
| `aura_input_submitted` | User taps generate | `input_length`, `quick_prompt_used`, `profile_mode` |
| `aura_generation_started` | Request sent | `request_id`, `model`, `temperature_profile` |
| `aura_generation_completed` | Valid response received | `latency_ms`, `token_in`, `token_out`, `repair_pass_used` |
| `aura_generation_failed` | Request fails | `error_type`, `error_code`, `latency_ms` |
| `aura_step3_reveal_viewed` | Step 3 reveal fully enters viewport | `reveal_variant`, `motion_mode`, `time_to_reveal_ms` |
| `aura_step3_primary_cta_tapped` | Primary action on reveal tapped | `cta_id`, `position_zone` |
| `aura_result_saved` | Save/history action succeeds | `result_id`, `save_target` |
| `aura_result_shared` | Share action succeeds | `channel`, `result_id` |

## Scent Events (Mini Scentory)
| Event | Trigger Moment | Suggested Payload |
|---|---|---|
| `scent_tab_opened` | User opens scent tab | `has_scent_profile`, `wardrobe_count` |
| `scent_routine_started` | User starts first scent routine flow | `entry_point` |
| `scent_routine_completed` | Routine completed | `duration_ms`, `seed_items_count` |
| `scent_profile_updated` | Preferences/profile update saved | `fields_changed`, `wardrobe_count` |
| `scent_wardrobe_import_submitted` | Import text submitted | `input_lines`, `char_count` |
| `scent_wardrobe_import_parsed` | Parser returns structured items | `parsed_count`, `fallback_used` |
| `scent_product_detail_opened` | Detail sheet opened | `product_id`, `is_favorite`, `wear_count` |
| `scent_wear_logged` | Wear log saved | `product_id`, `occasion`, `weather` |
| `scent_daily_reach_viewed` | Daily Reach card visible | `primary_item_id`, `alternate_count` |
| `scent_situation_submitted` | Situation request submitted | `input_length`, `wardrobe_count` |
| `scent_situation_resolved` | Situation response valid | `mode`, `primary_item_id`, `secondary_item_id`, `latency_ms` |

## Quality/Safety Events
| Event | Trigger Moment | Suggested Payload |
|---|---|---|
| `validation_repair_applied` | Repair pass used | `surface`, `schema`, `repair_count` |
| `validation_hard_fail` | Output rejected | `surface`, `schema`, `failure_reason` |
| `copy_guardrail_triggered` | Banned/cheesy phrase blocked | `surface`, `rule_id` |

## Event Hygiene Rules
- Never send raw free-text user input without explicit consent policy.
- Prefer enums and ids over verbose strings.
- Keep payloads under practical mobile limits.
- Track failures as first-class events, not just logs.
- Version payload contracts: add `schema_version` when structure changes.
