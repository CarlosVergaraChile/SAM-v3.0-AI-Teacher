tests/test_director_search.py#!/usr/bin/env python3
"""
Test Suite: OSINT Director Search Module - Issue #1
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "osint"))

from director_search import DirectorSearchEngine, DirectorProfile

class TestDirectorSearch:
    def setup_method(self):
        self.engine = DirectorSearchEngine()
        self.test_cases = [
            {"nombre": "Carlos Vergara", "institucion": "Instituto TI"},
            {"nombre": "Gastón Martinez", "institucion": "Instituto TI"},
            {"nombre": "Jeanette Figueroa", "institucion": "Diplomado Salud"},
        ]

    def test_single_director(self):
        profile = self.engine.search("Carlos Vergara", "Instituto TI")
        assert isinstance(profile, DirectorProfile)
        assert profile.nombre == "Carlos Vergara"
        assert profile.email is not None
        assert profile.confianza >= 0 and profile.confianza <= 100
        print("✓ Test 1: Single search passed")

    def test_batch_search(self):
        results = self.engine.batch_search(self.test_cases)
        assert len(results) == 3
        assert all(isinstance(r, DirectorProfile) for r in results)
        print("✓ Test 2: Batch search passed")

    def test_caching(self):
        p1 = self.engine.search("Carlos Vergara", "Instituto TI")
        p2 = self.engine.search("Carlos Vergara", "Instituto TI")
        assert id(p1) == id(p2)
        print("✓ Test 3: Caching passed")

    def test_serialization(self):
        import json
        profile = self.engine.search("Gastón Martinez", "Instituto TI")
        data = json.loads(profile.to_json())
        assert data["nombre"] == "Gastón Martinez"
        assert "timestamp" in data
        print("✓ Test 4: Serialization passed")

    def test_invalid_director(self):
        profile = self.engine.search("Unknown", "Unknown")
        assert isinstance(profile, DirectorProfile)
        assert profile.confianza < 50
        print("✓ Test 5: Invalid director handling passed")

if __name__ == "__main__":
    print("\n=== OSINT Director Search Test Suite ===")
    tester = TestDirectorSearch()
    tests = [
        tester.test_single_director,
        tester.test_batch_search,
        tester.test_caching,
        tester.test_serialization,
        tester.test_invalid_director,
    ]
    for test in tests:
        try:
            tester.setup_method()
            test()
        except AssertionError as e:
            print(f"✗ Test failed: {e}")
    print("\n=== All tests completed ===")
