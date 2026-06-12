#!/usr/bin/env python
"""Run fixture/result ingestion and optional prediction generation."""
from __future__ import annotations

import argparse
import asyncio

from app.jobs.generate_predictions import _generate
from app.jobs.ingest_fixtures import _ingest as ingest_fixtures
from app.jobs.ingest_results import _ingest as ingest_results


async def run(days_ahead: int, results_days_back: int, predictions: bool) -> None:
    fixture_stats = await ingest_fixtures(days_ahead)
    print(f"Fixtures ingested: {fixture_stats}")

    result_stats = await ingest_results(results_days_back)
    print(f"Results updated: {result_stats}")

    if predictions:
        prediction_stats = await _generate(days_ahead)
        print(f"Predictions generated: {prediction_stats}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest live sports data")
    parser.add_argument("--days-ahead", type=int, default=7, help="Fixture horizon")
    parser.add_argument(
        "--results-days-back", type=int, default=3, help="Days of results to pull"
    )
    parser.add_argument(
        "--predictions", action="store_true", help="Generate predictions after ingest"
    )
    args = parser.parse_args()
    asyncio.run(run(args.days_ahead, args.results_days_back, args.predictions))


if __name__ == "__main__":
    main()
