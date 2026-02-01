# LifeQuest

This project supports HTML validation locally using **Nu Html Checker** (`vnu.jar`), which is the same validator behind https://validator.w3.org.

## Procedure to test in local

### Prerequisites

- Java 11+ (recommended: Java 17)

0. Check your Java version:

```bash
java -version
```

1. `Download vnu.jar`

Run this at the project root:

```bash
curl -L -o vnu.jar https://github.com/validator/validator/releases/latest/download/vnu.jar
```

2. Validate HTML (project root)

Validate HTML files under the project root (including subdirectories):

```bash
java -jar vnu.jar --skip-non-html --errors-only --Werror .
```

#### Notes

- `--skip-non-html`: ignore non-HTML files (safe to run at the project root)

- `--errors-only`: show only errors

- `--Werror`: treat warnings as errors (CI-friendly)
