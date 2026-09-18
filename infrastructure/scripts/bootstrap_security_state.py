#!/usr/bin/env python3
"""Create and verify the Dynamo-compatible security-state table."""

from __future__ import annotations

import os
import time
from typing import Any

import boto3


def definition(table_name: str) -> dict[str, Any]:
    return {
        "TableName": table_name,
        "KeySchema": [
            {"AttributeName": "pk", "KeyType": "HASH"},
            {"AttributeName": "sk", "KeyType": "RANGE"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "pk", "AttributeType": "S"},
            {"AttributeName": "sk", "AttributeType": "S"},
            {"AttributeName": "gsi_admin_pk", "AttributeType": "S"},
            {"AttributeName": "gsi_admin_sk", "AttributeType": "S"},
        ],
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "gsi_admin",
                "KeySchema": [
                    {"AttributeName": "gsi_admin_pk", "KeyType": "HASH"},
                    {"AttributeName": "gsi_admin_sk", "KeyType": "RANGE"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            }
        ],
    }


def main() -> int:
    endpoint = os.environ["BP_SECURITY_STATE_ENDPOINT"]
    table = os.environ["BP_SECURITY_STATE_TABLE"]
    client = boto3.client(
        "dynamodb",
        endpoint_url=endpoint,
        region_name=os.getenv("BP_SELF_HOSTED_REGION", "us-east-1"),
        aws_access_key_id=os.environ["BP_SECURITY_STATE_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["BP_SECURITY_STATE_SECRET_ACCESS_KEY"],
    )
    for attempt in range(60):
        try:
            names = client.list_tables().get("TableNames", [])
            break
        except Exception:
            if attempt == 59:
                raise
            time.sleep(2)
    if table not in names:
        client.create_table(**definition(table), BillingMode="PAY_PER_REQUEST")
        client.get_waiter("table_exists").wait(TableName=table)
        client.update_time_to_live(
            TableName=table,
            TimeToLiveSpecification={"AttributeName": "ttl_epoch", "Enabled": True},
        )
    described = client.describe_table(TableName=table)["Table"]
    if len(described.get("KeySchema", [])) != 2:
        raise RuntimeError("security-state table has an incompatible key schema")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
