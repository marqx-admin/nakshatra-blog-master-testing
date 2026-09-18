import logging
from bp_observability.health import ReadinessLatch
from bp_observability.metrics import validate_metric_labels
from bp_observability.redaction import redact_mapping

def test_readiness_latch():
    x=ReadinessLatch(True)
    assert x.observe(False) is True
    assert x.observe(False) is True
    assert x.observe(False) is False
    assert x.observe(True) is False
    assert x.observe(True) is True

def test_redaction(): assert redact_mapping({"password":"x","nested":{"token":"y"}})=={"password":"[REDACTED]","nested":{"token":"[REDACTED]"}}
def test_metric_labels():
    try: validate_metric_labels({"post_id":"x"})
    except ValueError: pass
    else: raise AssertionError("expected ValueError")
