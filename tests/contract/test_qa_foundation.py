from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "packages/python/bp-test-support/src"))

from bp_test_support.fixtures import directed_site_pairs, validate_collision_fixture  # noqa: E402
from bp_test_support.hashing import sha256_file  # noqa: E402
from bp_test_support.registry import EXPECTED_FAMILY_COUNTS, validate_qa21_registry  # noqa: E402
from bp_test_support.results import materialize_qa21_statuses, validate_result_record  # noqa: E402


class QAFoundationTests(unittest.TestCase):
    def test_qa21_registry_is_exactly_180(self) -> None:
        result = validate_qa21_registry(ROOT / "tests/qa/qa21-registry.json")
        self.assertTrue(result["ok"], result["errors"])
        self.assertEqual(result["qa21_count"], 180)
        self.assertEqual(result["family_counts"], EXPECTED_FAMILY_COUNTS)

    def test_collision_fixture_is_14_sites_and_182_directed_pairs(self) -> None:
        path = ROOT / "tests/fixtures/tenant-collision-v1.json"
        result = validate_collision_fixture(path)
        self.assertTrue(result["ok"], result["errors"])
        self.assertEqual(result["site_count"], 14)
        self.assertEqual(result["directed_pair_count"], 182)
        data = json.loads(path.read_text(encoding="utf-8"))
        keys = [row["site_key"] for row in data["sites"]]
        self.assertEqual(len(directed_site_pairs(keys)), 182)

    def test_visual_acceptance_counts_are_frozen(self) -> None:
        visual = json.loads((ROOT / "tests/qa/visual-acceptance-registry.json").read_text(encoding="utf-8"))
        self.assertEqual(visual["doc25"]["assertion_count"], 89)
        self.assertEqual(len(visual["doc25"]["ids"]), 89)
        self.assertEqual(visual["doc26"]["assertion_count"], 112)
        self.assertEqual(len(visual["doc26"]["global_ids"]), 42)
        self.assertEqual(len(visual["doc26"]["site_ids"]), 70)
        self.assertEqual(visual["doc27"]["assertion_count"], 2281)
        self.assertEqual(sum(visual["doc27"]["families"].values()), 2281)
        self.assertEqual(visual["doc27"]["geometry_tolerance_css_px"], 2)
        self.assertEqual(visual["doc27"]["pixel_channel_tolerance_0_255"], 16)
        self.assertEqual(visual["doc27"]["max_changed_pixels_percent"], 0.5)

    def test_initial_release_rows_are_not_executed(self) -> None:
        result = materialize_qa21_statuses(ROOT / "tests/qa/qa21-registry.json", [])
        self.assertEqual(result["qa21_total"], 180)
        self.assertEqual(result["status_counts"], {"NOT_EXECUTED": 180})
        self.assertTrue(all(row["status"] == "NOT_EXECUTED" for row in result["results"]))

    def test_evidence_rules_reject_unproven_pass_and_unlinked_fail(self) -> None:
        registry = json.loads((ROOT / "tests/qa/qa21-registry.json").read_text(encoding="utf-8"))
        pass_errors = validate_result_record({
            "test_id": "QA21-API-001",
            "candidate_id": "candidate-x",
            "environment_class": "ENV21-UNIT",
            "status": "PASS",
            "evidence": [],
        }, registry)
        self.assertIn("PASS requires at least one evidence artifact", pass_errors)
        fail_errors = validate_result_record({
            "test_id": "QA21-API-001",
            "candidate_id": "candidate-x",
            "environment_class": "ENV21-UNIT",
            "status": "FAIL",
            "evidence": [{"evidence_class": "EV21-DEFECT", "path": "x"}],
        }, registry)
        self.assertIn("FAIL requires defect_id", fail_errors)

    def test_candidate_binds_owner_approved_openapi(self) -> None:
        candidate = json.loads((ROOT / "tests/evidence/candidate/candidate.json").read_text(encoding="utf-8"))
        expected = candidate["canonical_openapi"]["sha256"]
        actual = sha256_file(ROOT / candidate["canonical_openapi"]["path"])
        self.assertEqual(actual, expected)
        self.assertFalse(candidate["c00_feature_complete_signal_received"])


if __name__ == "__main__":
    unittest.main()
