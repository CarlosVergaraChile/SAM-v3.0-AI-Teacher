# TECHNICAL ARCHITECTURE - SAM v3.0 MULTI-TENANT B2B2C

## Executive Summary

This document defines the complete technical architecture for SAM v3.0 operating as a multi-tenant platform enabling B2B2C distribution through partners (Aptus, Quantic, Universities, Municipalities). The architecture ensures tenant isolation, scalability, and cost optimization.

---

## 1. ARCHITECTURE OVERVIEW

```
Partner Ecosystem (Chile)
[Aptus] [Quantic] [PUC] [USACH] [Municipalities]
    |        |        |      |          |
    +--------+--------+------+----------+
            |
    API GATEWAY (Multi-tenant)
    - Tenant Isolation
    - Rate Limiting
    - Authentication/AuthZ
            |
    MICROSERVICES LAYER
    - LLM Orchestration
    - Evaluation Engine
    - Analytics
    - User Management
            |
    DATA LAYER
    - PostgreSQL (Schema per Partner)
    - Redis Cluster
    - Elasticsearch
    - S3 Storage
```

---

## 2. DATABASE DESIGN - MULTI-TENANT STRATEGY

### Option: Schema per Partner (Recommended)

**Advantages:**
- Complete logical isolation between partners
- Easy to backup/restore individual partners
- Simple compliance segregation
- Performance isolation

**Schema Structure:**
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    partner_id VARCHAR(100) UNIQUE,
    partner_name VARCHAR(255),
    tier VARCHAR(50),
    subscription_status VARCHAR(50),
    created_at TIMESTAMPTZ,
    monthly_cost DECIMAL(10,2),
    api_quota_daily INT
);

CREATE SCHEMA partner_aptus;
CREATE SCHEMA partner_quantic;
CREATE SCHEMA partner_puc;

CREATE TABLE partner_aptus.clients (
    id UUID PRIMARY KEY,
    client_id VARCHAR(100),
    client_name VARCHAR(255),
    institution_type VARCHAR(50),
    students_count INT,
    teachers_count INT,
    created_at TIMESTAMPTZ
);

CREATE TABLE partner_aptus.evaluations (
    id UUID PRIMARY KEY,
    client_id VARCHAR(100),
    teacher_id VARCHAR(100),
    student_id VARCHAR(100),
    assignment_id VARCHAR(100),
    submission_text TEXT,
    ai_feedback JSONB,
    score DECIMAL(3,2),
    llm_model_used VARCHAR(50),
    created_at TIMESTAMPTZ,
    INDEX idx_client_teacher (client_id, teacher_id),
    INDEX idx_student (student_id)
);
```

---

## 3. AUTHENTICATION & AUTHORIZATION

### JWT Token Structure (Multi-tenant Context)

```json
{
  "sub": "prof_123",
  "email": "profesor@colegio.cl",
  "iss": "sam.v3.0",
  "exp": 1703078800,
  "tenant_hierarchy": {
    "level": "client_admin",
    "partner_id": "aptus",
    "partner_name": "Aptus Education",
    "client_id": "colegio_san_jose",
    "client_name": "Colegio San Jose",
    "institution_type": "k12"
  },
  "permissions": {
    "evaluate": true,
    "view_analytics": true,
    "manage_users": true
  },
  "rate_limit": {
    "tier": "premium",
    "requests_per_day": 10000
  }
}
```

### Role-Based Access Control (RBAC)

```python
ROLE_PERMISSIONS = {
    "super_admin": ["create_partner", "view_all", "manage_billing"],
    "partner_admin": ["create_client", "view_own_clients", "view_billing"],
    "client_admin": ["manage_teachers", "view_institution", "generate_reports"],
    "teacher": ["create_evaluation", "view_own_evaluations"],
    "student": ["view_feedback", "upload_submission"]
}
```

---

## 4. API GATEWAY CONFIGURATION

### Kong/NGINX Setup

```yaml
upstream sam_core:
  server core-service:3000;
  keepalive 32;

server {
    listen 8000;
    
    location ~ /api/(?<partner>\w+)(?<path>.*) {
        # Validate API Key
        if ($http_x_api_key = "") {
            return 401;
        }
        
        # Inject partner context
        proxy_set_header X-Partner-ID $partner;
        proxy_set_header X-Tenant-Path "partner_$partner";
        
        # Rate limiting
        limit_req zone=partner_limit burst=50;
        limit_req zone=api_limit burst=10;
        
        # Proxy
        proxy_pass http://sam_core/api$path;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

---

## 5. LLM ORCHESTRATION (Multi-Model Router)

### Smart Routing Strategy

```python
class MultiTenantLLMRouter:
    STRATEGIES = {
        "cost_optimized": {
            "primary": "llama_self_hosted",
            "fallback": "deepseek",
            "tertiary": "claude"
        },
        "performance": {
            "primary": "deepseek",
            "fallback": "llama_self_hosted",
            "tertiary": "claude"
        },
        "redundancy": {
            "primary": "deepseek",
            "fallback": "claude",
            "tertiary": "llama_self_hosted"
        }
    }
    
    async def route_request(self, tenant_config, prompt, context):
        strategy = tenant_config.get("llm_strategy", "cost_optimized")
        config = self.STRATEGIES[strategy]
        
        try:
            # Try primary model with timeout
            response = await asyncio.wait_for(
                self.models[config["primary"]].generate(prompt, context),
                timeout=tenant_config.get("timeout", 30)
            )
            return response, config["primary"]
        except Exception as e:
            # Fallback to secondary
            return await self.models[config["fallback"]].generate(prompt, context), config["fallback"]
```

---

## 6. CACHING STRATEGY (Multi-Tenant)

### Stratified Caching

```python
class MultiTenantCache:
    def __init__(self):
        self.redis = RedisCluster()
        self.namespace_format = "{partner}:{client}:{key}"
    
    async def get_cached_response(self, tenant_info, prompt):
        cache_key = f"{tenant_info['partner']}:{tenant_info['client']}:llm:{hash(prompt)}"
        
        # L1: Tenant-specific cache (hot)
        cached = await self.redis.get(cache_key)
        if cached:
            return cached
        
        # L2: Global prompt cache (warm)
        global_key = f"global:llm:{hash(prompt)}"
        cached = await self.redis.get(global_key)
        if cached:
            return cached
        
        return None
```

---

## 7. MONITORING & ANALYTICS (Per-Tenant)

### Prometheus Metrics

```prometheus
sam_api_requests_total{partner="aptus",client="colegio1",status="200"} 1542
sam_llm_latency_seconds{partner="aptus",model="deepseek",percentile="95"} 1.2
sam_concurrent_users{partner="aptus",client="colegio1"} 45
sam_usage_tokens{partner="aptus",client="colegio1",period="daily"} 125000
```

### Grafana Dashboards (Hierarchical)

**Level 1 - Super Admin:**
- Total requests per partner
- Revenue projections
- System health global

**Level 2 - Partner Admin:**
- Usage per client
- Billing summary
- Performance comparisons

**Level 3 - Client Admin:**
- Usage by department
- ROI metrics
- Student analytics

---

## 8. DEPLOYMENT & SCALING

### Kubernetes Multi-Tenant Setup

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: partner-aptus
  labels:
    tenant: aptus
    tier: premium

---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: aptus-quota
  namespace: partner-aptus
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 16Gi
    limits.cpu: "8"
    limits.memory: 32Gi

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sam-api-aptus
  namespace: partner-aptus
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sam-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling Phases

**Phase 1 (0-5 partners):**
- Single PostgreSQL cluster
- Schema separation
- Connection pooling

**Phase 2 (5-20 partners):**
- Read replicas per region
- Global connection pooling
- Partitioning by partner

**Phase 3 (20+ partners):**
- Database per tier
- Premium: Dedicated cluster
- Standard: Shared with isolation
- Basic: Multi-tenant shared

---

## 9. INFRASTRUCTURE COSTS (Estimated)

### Phase 1 (0-3 months, 1-3 partners)
- AWS/GCP: $2,500-3,500/month
- DeepSeek API: $1,000-2,000/month
- Llama Self-hosted: $1,500/month
- **TOTAL: $5,000-7,000/month**

### Phase 2 (3-9 months, 3-10 partners)
- Cloud: $4,000-6,000/month
- AI Models: $3,000-5,000/month
- Monitoring: $1,000/month
- **TOTAL: $10,000-14,000/month**

### Phase 3 (9+ months, 10+ partners)
- Cloud: $8,000-15,000/month
- AI Models: $7,000-12,000/month
- DevOps: $5,000/month
- **TOTAL: $20,000-32,000/month**

---

## 10. IMPLEMENTATION ROADMAP

**Weeks 1-2: Foundation**
- Authentication/Authorization layer
- Basic tenant isolation
- Partner API gateway
- Monitoring setup

**Weeks 3-4: Partner Features**
- Partner dashboard MVP
- Billing integration
- Usage tracking
- White-labeling

**Weeks 5-6: Scalability**
- Auto-scaling config
- Advanced caching
- Data pipelines
- Disaster recovery

**Weeks 7-8: Enterprise**
- SSO integration
- Compliance tools
- Advanced analytics
- Rate limiting

---

## 11. TECHNOLOGY STACK

- **Backend:** Python/FastAPI (async)
- **Database:** PostgreSQL + Citus
- **Cache:** Redis Cluster
- **Queue:** RabbitMQ/Celery
- **API Gateway:** Kong/Tyk
- **Monitoring:** Prometheus + Grafana + Loki
- **Infrastructure:** Kubernetes (EKS/GKE) + Terraform
- **LLM:** DeepSeek + Llama 3.1 + Claude (backup)

---

## 12. CRITICAL IMPLEMENTATION PATTERNS

- Circuit breaker for LLM calls
- Bulkhead isolation per partner
- Retry with exponential backoff
- Dead letter queues for failures
- Health checks per tenant
- Graceful degradation

---

## 13. SECURITY CONSIDERATIONS

- Data encryption per client (Vault)
- Tenant isolation enforcement
- Rate limiting per partner
- GDPR/LOPD compliance
- SOC 2 Type II certification
- Regular security audits

---

## References

- See PHASE3_PILOT_PROGRAM_PLAYBOOK.md for pilot execution
- See PHASE4_SCALING_GROWTH_STRATEGY.md for GTM strategy
- See SLA_SUPPORT_ARCHITECTURE.md for SLA terms
- See LMS_INTEGRATION_ADAPTERS.md for LMS connectors
