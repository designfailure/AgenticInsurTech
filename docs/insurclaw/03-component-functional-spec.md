# InsurClaw Component Functional Specification

## 1) Core orchestration components

## 1.1 Agent Router

**Purpose**: Maps incoming objectives to domain agent graphs.

**Inputs**
- Objective payload
- Tenant context
- Trigger metadata

**Functions**
- Intent classification
- Domain routing (literacy, prevention, underwriting, claims)
- Fallback path selection

**Outputs**
- Route decision
- Candidate agent plan skeleton

---

## 1.2 Task Planner

**Purpose**: Produces executable, policy-aware step plans.

**Inputs**
- Routed objective
- Historical memory context
- Domain constraints

**Functions**
- Decompose objective into tasks
- Rank tools and agents
- Attach confidence and uncertainty scores

**Outputs**
- Ordered step plan
- Confidence map

---

## 1.3 Tool Broker

**Purpose**: Executes plan steps with tools/services and normalizes responses.

**Inputs**
- Step instruction
- Tool contract

**Functions**
- Tool invocation
- Timeout/retry orchestration
- Response normalization

**Outputs**
- Structured result bundle
- Error metadata

---

## 1.4 Guardrail Engine

**Purpose**: Enforces policy/compliance/fairness constraints.

**Inputs**
- Proposed actions
- Evidence set
- Jurisdiction policy pack

**Functions**
- Rule evaluation
- Sensitive-action gating
- Bias/fairness checks

**Outputs**
- Allow / block / escalate decision
- Rationale code list

---

## 1.5 Memory Fabric

**Purpose**: Stores long-term and episodic context for agent decisions.

**Inputs**
- New decision artifacts
- Historical retrieval queries

**Functions**
- Context retrieval by domain/time/entity
- Embedding + structured index management
- Snapshot versioning

**Outputs**
- Context bundle
- Versioned memory snapshot ID

---

## 1.6 Decision Logger

**Purpose**: Maintains immutable traceability for every action.

**Inputs**
- Agent action
- Guardrail outcomes
- Final response artifacts

**Functions**
- Append-only logging
- Hash chaining / integrity markers
- Audit export formatting

**Outputs**
- Audit trail reference
- Compliance report payload

---

## 2) Domain components

## 2.1 Financial Literacy Agent

**Purpose**: Improve customer financial and insurance literacy.

**Functions**
- Gap detection in understanding of policy and risk.
- Personalized learning path generation.
- Lifecycle nudges (renewal, seasonal risk, claim-prevention reminders).

**KPIs**
- Literacy module completion rate.
- Reduction in avoidable coverage misunderstandings.

---

## 2.2 Prevention Agent

### 2.2.1 Event Intelligence Service

**Functions**
- Detect event-related exposure changes.
- Predict risk spikes due to operations/crowd/logistics patterns.
- Trigger preventive instructions.

### 2.2.2 Extreme Weather Intelligence Service

**Functions**
- Fuse weather forecasts and geospatial risk layers.
- Compute asset-level hazard severity.
- Trigger mitigation actions and proactive alerts.

**KPIs**
- Prevention alert precision.
- Reduction in weather/event claim incidence.

---

## 2.3 Underwriting Agent

### 2.3.1 Risk Engine Service

**Functions**
- Build risk feature vectors from internal/external data.
- Score probability and severity of loss.
- Recommend terms: premium, deductible, limit, exclusions.

**Controls**
- Confidence thresholding.
- Fairness and protected-attribute masking.

**KPIs**
- Quote turnaround time.
- Calibration and drift metrics.

---

## 2.4 Claim Assessment Agent

### 2.4.1 Loss Adjuster Service
- Establishes cause-of-loss chain and policy applicability.
- Flags suspicious causality patterns.

### 2.4.2 Appraisal Service
- Estimates repair/replacement values.
- Benchmarks against regional and category pricing.

### 2.4.3 Assessor Service
- Validates evidence quality and consistency.
- Detects missing documents and contradictory statements.

### 2.4.4 Evaluation (Estimation) Service
- Produces indemnity estimate range.
- Generates settlement options and uncertainty commentary.

**KPIs**
- Claim cycle time.
- Leakage reduction.
- Escalation precision.

---

## 3) Inter-component API contract (logical)

- `ObjectiveEnvelope`
- `PlanStep`
- `ToolExecutionResult`
- `GuardrailDecision`
- `DecisionArtifact`
- `AuditReference`

Each contract must include:
- `correlation_id`
- `tenant_id`
- `timestamp`
- `confidence`
- `explainability_notes`

---

## 4) Human oversight checkpoints

- Underwriting recommendation confidence < threshold.
- Claim estimation variance > threshold.
- Compliance/fairness guardrail violations.
- High-severity prevention advisories with legal implications.

