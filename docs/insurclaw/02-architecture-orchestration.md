# InsurClaw Architecture & Orchestration Specification

## 1) Architectural style

InsurClaw uses a **multi-agent, event-driven orchestration architecture** inspired by OpenClaw's autonomous control loop:

- Goal intake
- Planning
- Tool invocation
- Memory update
- Policy validation
- Action/response

The clone-mimic runtime is called **ClawCore Orchestrator** and is composed of:

- Agent Router
- Task Planner
- Tool Broker
- State & Memory Fabric
- Guardrail Engine
- Decision Logger

---

## 2) Layered architecture

```mermaid
flowchart TB
  U[User / Enterprise Systems] --> API[API Gateway]
  API --> ORCH[ClawCore Orchestrator]

  subgraph ORCH_STACK[Orchestration Stack]
    AR[Agent Router]
    TP[Task Planner]
    TB[Tool Broker]
    GE[Guardrail Engine]
    DL[Decision Logger]
    MF[Memory Fabric]
  end

  ORCH --> AR --> TP --> TB
  TP --> MF
  TB --> GE
  GE --> DL
  DL --> MF

  TB --> FLA[Financial Literacy Agent]
  TB --> PAA[Prevention Agent]
  TB --> UWA[Underwriting Agent]
  TB --> CAA[Claims Assessment Agent]

  PAA --> EVT[Event Intelligence Service]
  PAA --> WTH[Extreme Weather Intelligence Service]
  UWA --> RSK[Risk Engine Service]
  CAA --> LADJ[Loss Adjuster Service]
  CAA --> APR[Appraisal Service]
  CAA --> ASR[Assessor Service]
  CAA --> EST[Evaluation Estimation Service]

  EVT --> DATA[(External/Internal Data Sources)]
  WTH --> DATA
  RSK --> DATA
  LADJ --> DATA
  APR --> DATA
  ASR --> DATA
  EST --> DATA
```

---

## 3) Orchestration runtime flow

```mermaid
sequenceDiagram
  autonumber
  participant C as Client/System
  participant G as API Gateway
  participant O as ClawCore Orchestrator
  participant P as Task Planner
  participant B as Tool Broker
  participant A as Domain Agent
  participant R as Guardrail Engine
  participant M as Memory Fabric
  participant L as Decision Logger

  C->>G: Request/Trigger (risk, prevention, underwriting, claim)
  G->>O: Authenticated objective payload
  O->>P: Build plan from objective + context
  P->>M: Read historical memory and features
  M-->>P: Context pack
  P-->>O: Ordered plan + confidence

  loop Per plan step
    O->>B: Execute step via selected tool/agent
    B->>A: Invoke domain action
    A-->>B: Result + evidence
    B->>R: Validate policy/compliance/fairness
    R-->>B: Allow / Block / Escalate
    B->>L: Persist action + rationale
    L->>M: Update memory snapshot
  end

  O-->>G: Final decision/recommendation packet
  G-->>C: Explainable response + audit reference
```

---

## 4) Domain orchestration topologies

## 4.1 Financial literacy topology

- Trigger: onboarding, renewal, risk change.
- Pipeline: profile segmentation -> knowledge-gap inference -> personalized module generation -> behavioral nudges.
- Feedback loop: behavior signals update user literacy model.

## 4.2 Prevention-as-a-Service topology

- Trigger: event feed, weather alert, geospatial anomaly.
- Pipeline: exposure match -> risk amplification scoring -> prevention playbook selection -> customer notifications and underwriter alerts.
- Escalation: severe risk amplification triggers underwriting re-evaluation.

## 4.3 Underwriting topology

- Trigger: new quote, renewal, endorsement.
- Pipeline: feature extraction -> risk scoring -> terms optimization -> confidence and bias checks -> recommendation.
- Escalation: low confidence / fairness warning -> manual underwriting queue.

## 4.4 Claim assessment topology

- Trigger: FNOL (first notice of loss) or claim update.
- Pipeline: evidence ingestion -> coverage validation -> causality assessment -> appraisal/estimation -> settlement options.
- Escalation: anomaly/fraud indicators -> SIU/legal/manual review.

---

## 5) State model

```mermaid
stateDiagram-v2
  [*] --> Ingested
  Ingested --> Planned: Objective Parsed
  Planned --> Executing: Step Dispatch
  Executing --> GuardrailCheck: Result Returned
  GuardrailCheck --> Executing: Next Step Allowed
  GuardrailCheck --> Escalated: Block or Manual Review
  Executing --> Completed: Plan Finished
  Escalated --> Completed: Human Resolution
  Completed --> [*]
```

---

## 6) Reliability and control patterns

- Idempotency keys per orchestration run.
- Retry policy with exponential backoff for transient tool failures.
- Dead-letter queue for irrecoverable step failures.
- Circuit breakers for unstable upstream data providers.
- Policy kill-switch for unsafe autonomous actions.
- Deterministic replay mode for audits.

---

## 7) Security and governance model

- Service-to-service mTLS and short-lived tokens.
- Tool capability scoping (least privilege per agent).
- PII minimization and field-level encryption.
- Explainability ledger retained as tamper-evident log.
- Region-aware policy packs for regulatory adaptation.

