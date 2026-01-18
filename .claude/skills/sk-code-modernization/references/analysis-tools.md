# Ferramentas de Análise por Stack

## JavaScript/TypeScript

### Análise de Complexidade

```bash
# Dependências circulares (madge)
npx madge --circular --extensions ts,tsx,js,jsx ./src

# Complexidade ciclomática (plato)
npx plato -r -d ./analysis ./src/**/*.ts

# Análise de código (ts-prune)
npx ts-prune
```

### Duplicação de Código

```bash
# jscpd (configurável)
npx jscpd ./src --min-lines 5 --min-tokens 50 --format json

# Alternativa: simian
java -jar simian.jar -threshold=6 src/**/*.ts
```

### Análise de Bundle

```bash
# Webpack Bundle Analyzer
npx webpack-bundle-analyzer stats.json

# Vite Bundle Analyzer
npm run build -- --analyze

# Nuxt analyze
npx nuxi analyze
```

### Dead Code Detection

```bash
# ts-unused-exports
npx ts-unused-exports tsconfig.json

# knip
npx knip

# depcheck (deps não usadas)
npx depcheck
```

### Métricas de Código

```bash
# cloc (lines of code)
cloc ./src --by-file --json

# Complexity report
npx complexity-report src/**/*.ts --format json
```

---

## Python

### Análise de Complexidade

```bash
# Radon (complexidade ciclomática)
radon cc ./src -a -s

# Xenon (complexity threshold)
xenon --max-absolute B --max-modules A --max-average A ./src

# Wily (histórico de métricas)
wily build src/
wily report src/
```

### Linting e Qualidade

```bash
# Pylint
pylint src/ --output-format=json

# Flake8
flake8 src/ --max-complexity=10 --format=json

# mypy (type checking)
mypy src/ --strict
```

### Duplicação

```bash
# pylint duplicates
pylint --disable=all --enable=duplicate-code src/

# CPD (PMD Copy/Paste Detector)
pmd cpd --files src/ --minimum-tokens 50 --language python
```

### Dead Code

```bash
# vulture
vulture src/ --min-confidence 80

# autoflake
autoflake --check --recursive src/
```

---

## C# / .NET

### Análise de Complexidade

```bash
# Roslyn analyzers
dotnet build /p:RunAnalyzers=true

# NDepend
NDepend.Console.exe /Solution MySolution.sln

# CodeMetrics
msbuild /t:Metrics /p:Configuration=Release
```

### Duplicação

```bash
# PMD CPD
pmd cpd --files ./src --minimum-tokens 50 --language cs --format xml

# Simian
simian-check src/**/*.cs
```

### Código Morto

```bash
# ReSharper CLI
inspectcode MySolution.sln --output=report.xml --profile=CodeInspection
```

---

## Java

### Análise de Complexidade

```bash
# CheckStyle
checkstyle -c /google_checks.xml src/

# PMD
pmd check -d src/ -f xml -R rulesets/java/quickstart.xml

# SonarQube Scanner
sonar-scanner
```

### Duplicação

```bash
# PMD CPD
pmd cpd --files src/ --minimum-tokens 100 --language java --format xml
```

### Dependências

```bash
# JDepend
jdepend src/

# Gradle dependency insight
./gradlew dependencyInsight --dependency <dependency-name>
```

---

## Go

### Análise de Complexidade

```bash
# gocyclo
gocyclo -over 10 .

# golines (long lines)
golines --max-len=120 --base-formatter=gofmt .

# staticcheck
staticcheck ./...
```

### Dead Code

```bash
# deadcode
deadcode ./...

# unused
unused ./...
```

### Linting

```bash
# golangci-lint (aggregator)
golangci-lint run --enable-all
```

---

## Rust

### Análise de Complexidade

```bash
# Clippy
cargo clippy -- -D warnings

# Cargo audit
cargo audit

# Cargo outdated
cargo outdated
```

### Métricas

```bash
# tokei (lines of code)
tokei ./src

# cargo-bloat (binary size)
cargo bloat --release
```

---

## Ruby

### Análise de Complexidade

```bash
# Flog (complexity)
flog lib/ app/

# Reek (code smells)
reek lib/ app/

# RuboCop
rubocop --format json
```

### Duplicação

```bash
# Flay
flay lib/ app/
```

---

## Ferramentas Multi-Linguagem

### SonarQube

```bash
# Scanner genérico
sonar-scanner \
  -Dsonar.projectKey=my-project \
  -Dsonar.sources=./src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<token>
```

### PMD CPD

Suporta: Java, JavaScript, C++, C#, PHP, Ruby, Objective-C, Scala, Swift

```bash
pmd cpd --files ./src --minimum-tokens 50 --language [lang] --format xml
```

### CodeClimate

```bash
# Análise local
codeclimate analyze
```

### Semgrep

```bash
# SAST multi-linguagem
semgrep --config=auto src/
```

---

## Análise de Dependências

### Dependências Desatualizadas

```bash
# JavaScript
npm outdated --json
pnpm outdated --json

# Python
pip list --outdated --format=json

# Ruby
bundle outdated

# Go
go list -u -m -json all

# Rust
cargo outdated --format json
```

### Vulnerabilidades

```bash
# JavaScript
npm audit --json
pnpm audit --json

# Python
pip-audit --format json
safety check --json

# Ruby
bundle audit

# Go
govulncheck ./...

# Rust
cargo audit
```

---

## Análise de Hotspots

### Churn + Complexity

```bash
# Git history + complexity
git log --format=format: --name-only | \
  sort | uniq -c | sort -r | head -20

# Combinar com radon/gocyclo para mapear hotspots
```

### Code Churn (arquivos mais modificados)

```bash
git log --all --numstat --date=short --pretty=format:'--%h--%ad--%aN' \
  --no-renames --after="2023-01-01" \
  | grep -v "^--" \
  | awk '{print $3}' \
  | sort | uniq -c | sort -rn | head -30
```

---

## Automação de Coleta

### Script Multi-Stack

```bash
#!/bin/bash

# Detectar stack
if [ -f "package.json" ]; then
  echo "JavaScript/TypeScript detected"
  npx madge --circular --json ./src > madge-report.json
  npx jscpd ./src --format json > jscpd-report.json
fi

if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  echo "Python detected"
  radon cc ./src -a -s --json > radon-report.json
  vulture src/ --min-confidence 80 > vulture-report.txt
fi

# ... adicionar outros casos
```

---

## Integração com CI/CD

### GitHub Actions Example

```yaml
- name: Run complexity analysis
  run: |
    npx madge --circular --json ./src > madge.json
    npx complexity-report src/**/*.ts --format json > complexity.json

- name: Upload reports
  uses: actions/upload-artifact@v3
  with:
    name: analysis-reports
    path: |
      madge.json
      complexity.json
```

### GitLab CI Example

```yaml
code_analysis:
  script:
    - npm install -g madge jscpd
    - madge --circular --json ./src > madge.json
    - jscpd ./src --format json > jscpd.json
  artifacts:
    paths:
      - madge.json
      - jscpd.json
```
