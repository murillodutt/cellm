# M1 fixtures

Imported verbatim from the upstream compress-llm test corpus:

`tmp/compress-llm-main/tests/compress-llm-compress/`

Each pair `<stem>.original.md` + `<stem>.md` is an original/compressed sample produced by the Python pipeline. Used to verify TS port parity of:

- `detect.detectFileType` classification
- `validate.validate` errors + warnings

Do not edit — regenerate by copying the upstream tree if the upstream fixtures change.
