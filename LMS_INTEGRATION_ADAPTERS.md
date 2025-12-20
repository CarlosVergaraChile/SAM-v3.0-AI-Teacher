# LMS Integration Adapters - Phase 2 Technical Enablement

## Executive Summary

This document defines the integration architecture for connecting SAM v3.0 to major Learning Management Systems (LMS) platforms. The adapter framework supports Canvas, Blackboard, Moodle, Google Classroom, and proprietary institutional systems through a standardized API contract.

**Key Metrics:**
- Adapter development time: 5-7 days per platform
- Integration testing: 3-4 days per platform
- Data sync latency: <5 minutes (real-time roster, <1 hour for grades)
- Support coverage: 85% of global K-12 and higher education institutions
- Planned adapters: 5 platforms in Phase 2 (Canvas, Blackboard, Moodle, Google Classroom, D2L)

## Architecture Overview

### 1. Adapter Framework Design

**Core Components:**
- Authentication module (OAuth 2.0, LTI 1.3, API key)
- Data synchronization engine (event-driven, batch processes)
- Roster management (student enrollment, section mapping)
- Grade/assessment recording interface
- Real-time notification pipeline

**Adapter Pattern:**
```
LMS Platform
     ↓
[OAuth/LTI Auth Handler]
     ↓
[Data Mapper]
     ↓
[SAM Core API]
     ↓
[Response Formatter]
     ↓
LMS Platform Response
```

### 2. Platform-Specific Implementation Details

#### Canvas Adapter

**API Version:** Canvas REST API v1
**Authentication Method:** OAuth 2.0 with refresh token
**Data Endpoints:**
- Courses: `GET /api/v1/courses`
- Enrollments: `GET /api/v1/courses/{id}/enrollments`
- Users: `GET /api/v1/users/{id}`
- Submissions: `GET /api/v1/courses/{id}/assignments/{id}/submissions`
- Grades: `PUT /api/v1/courses/{id}/assignments/{id}/submissions/{id}/grade`

**SAM Integration Points:**
- Student roster sync: Every 4 hours (batch)
- Assignment requests: Real-time webhook
- Grade submission: Real-time via API
- Notification: Canvas notification system

**Example Workflow:**
```json
{
  "event": "assignment.created",
  "canvas_assignment_id": "12345",
  "course_id": "67890",
  "student_ids": ["111", "222", "333"],
  "mapping": {
    "title": "assignment_name",
    "prompt": "assignment_description",
    "due_date": "assignment_due_at"
  }
}
```

**Development Timeline:**
- Days 1-2: OAuth setup & authentication testing
- Days 3-4: Roster sync & enrollment mapping
- Days 5-6: Assignment & grade integration
- Day 7: UAT & production deployment

#### Blackboard Adapter

**API Version:** Blackboard Learn REST API v3
**Authentication Method:** OAuth 2.0 with JWT bearer token
**Data Endpoints:**
- Terms: `GET /learn/api/public/v3/terms`
- Courses: `GET /learn/api/public/v3/courses`
- Users: `GET /learn/api/public/v3/users`
- Enrollments: `GET /learn/api/public/v3/enrollments`
- Content: `GET /learn/api/public/v3/courses/{id}/contents`
- Gradebook: `GET /learn/api/public/v3/courses/{id}/grades`

**Unique Considerations:**
- Blackboard uses term-based course structures (requires term mapping)
- Content objects require specific object handlers
- Gradebook has different column structure than Canvas
- More restrictive rate limiting (60 requests/minute)

**Development Timeline:**
- Days 1-2: OAuth 2.0 JWT setup
- Days 3-4: Term & course mapping
- Days 5-6: Gradebook integration
- Day 7: UAT & production deployment

#### Moodle Adapter

**API Version:** Moodle REST API (Web Services)
**Authentication Method:** API token (XML-RPC, JSON-RPC)
**Data Endpoints:**
- Courses: `core_course_get_courses`
- Enrollments: `core_enrol_get_enrolled_users`
- Users: `core_user_get_users`
- Grades: `core_grades_get_grades`
- Forum posts: `mod_forum_get_forum_discussions`

**Unique Considerations:**
- Moodle's plugin architecture (custom fields, plugins)
- Self-hosted deployments vary significantly
- Different grade calculation methods
- Requires per-instance configuration

**Development Timeline:**
- Days 1-2: Token setup & capability verification
- Days 3-4: Course & enrollment mapping
- Days 5-6: Grade & custom field handling
- Day 7: Multi-instance testing & UAT

#### Google Classroom Adapter

**API Version:** Google Classroom API v1
**Authentication Method:** OAuth 2.0 with Google identity
**Data Endpoints:**
- Courses: `courses.list`
- Enrollments: `courses.students.list`, `courses.teachers.list`
- Coursework: `courses.courseWork.list`
- Submissions: `courses.courseWork.studentSubmissions.list`
- Grades: `courses.courseWork.studentSubmissions.patch`

**SAM Integration Points:**
- Real-time class roster sync (event-driven)
- Assignment forwarding (webhooks)
- Automatic feedback publishing
- Student notification via Google Classroom

**Development Timeline:**
- Days 1-2: Google OAuth setup & scopes
- Days 3-4: Course & student listing
- Days 5-6: Coursework & submission handling
- Day 7: Notification & UAT

#### D2L Brightspace Adapter

**API Version:** Brightspace Content API & Data Hub API
**Authentication Method:** OAuth 2.0 with SAML support
**Data Endpoints:**
- Organizational Units: `/d2l/api/lp/v16/lti/org_unit`
- Enrollments: `/d2l/api/enrollment/org/{id}/users`
- Grades: `/d2l/api/le/{version}/grades/`

**Development Timeline:**
- Days 1-2: OAuth & SAML federation
- Days 3-4: Organizational structure mapping
- Days 5-6: Grade sync
- Day 7: Testing & UAT

### 3. Shared Data Synchronization Engine

**Event-Driven Sync (Real-time):**
- Assignment creation → SAM intake (webhook)
- Grade submission → LMS update (API call)
- Student enrollment change → Roster refresh (event listener)

**Batch Sync (Periodic):**
- Full roster sync: Every 4 hours
- Grade reconciliation: Daily (end-of-day)
- Course metadata: Every 24 hours

**Sync Data Structure:**
```python
class LMSSyncEvent:
    platform: str  # 'canvas', 'blackboard', 'moodle', etc.
    event_type: str  # 'assignment.created', 'enrollment.added'
    institution_id: str  # Unique institution identifier
    timestamp: datetime
    payload: dict  # Platform-specific data
    idempotency_key: str  # Prevents duplicate processing
```

### 4. Data Mapping & Transformation

**Standard SAM Data Model:**
```python
class Assignment:
    id: str  # SAM internal ID
    lms_assignment_id: str  # Canvas/Blackboard/etc. ID
    course_id: str
    title: str
    prompt: str
    due_date: datetime
    rubric: dict
    metadata: dict

class StudentSubmission:
    student_id: str
    assignment_id: str
    content: str
    submitted_at: datetime
    lms_submission_id: str
    sam_analysis: dict  # SAM analysis results
    grade: float  # Back to LMS
    feedback: str  # Back to LMS
```

**Mapping Rules:**
- Canvas `assignment_id` → SAM `lms_assignment_id`
- Canvas `user_id` → SAM normalized `student_id` (institutional SIS ID preferred)
- Canvas points possible → SAM rubric max score
- SAM computed grade → Canvas submission grade

### 5. Security & Authentication

**OAuth 2.0 Implementation:**
- Scope: Minimal necessary permissions per platform
- Token refresh: Automatic background refresh 10 minutes before expiry
- Scope per platform:
  - Canvas: `courses:read`, `assignments:read`, `submissions:read`, `submissions:write`, `users:read`
  - Blackboard: `read:course:*`, `read:user:*`, `read:grade:*`, `write:grade:*`
  - Moodle: `mod/assign:grade`, `grade/grader:view`, `moodle/course:view`

**API Key Security:**
- Stored encrypted in AWS Secrets Manager
- Rotated every 90 days
- Audit logging for all API calls
- Rate limiting per institution

**Webhook Security:**
- HMAC-SHA256 signature verification
- IP whitelist per LMS platform
- TLS 1.3 encryption for all data in transit

### 6. Error Handling & Retry Logic

**Transient Error Handling:**
```
HTTP 429 (Rate Limit) → Exponential backoff (2s, 4s, 8s, 16s max)
HTTP 503 (Service Unavailable) → Retry with 30s intervals (max 5 attempts)
HTTP 500 (Server Error) → Retry with 60s intervals (max 3 attempts)
Network timeout → Retry with 5s initial backoff (max 5 attempts)
```

**Dead Letter Queue:**
- Failed events stored in DLQ after max retries
- Manual intervention required
- Alert escalated to ops team after 1 hour

### 7. Monitoring & Observability

**Key Metrics:**
- Adapter sync latency (p50, p95, p99)
- API error rates per platform
- Webhook delivery success rate
- Data consistency checks (SAM vs. LMS)
- Authentication token refresh failures

**Dashboards:**
- Real-time adapter health status
- Data sync latency trends
- Error rate by platform
- Request volume by institution

## Week 3-4 Implementation Plan

### Week 3: Canvas & Blackboard
- Canvas adapter development & testing (5 days)
- Blackboard adapter development & testing (5 days parallel)

### Week 4: Moodle, Google Classroom, & D2L
- Moodle adapter development & testing (5 days)
- Google Classroom adapter development & testing (5 days parallel)
- D2L Brightspace adapter development & testing (5 days parallel)

### Testing & Validation
- Each adapter tested against live sandbox instance
- 100+ test cases per adapter
- Data consistency validation
- Performance benchmarking
- Security audit (penetration testing)

## Deployment Checklist

- [ ] All adapters pass UAT in production-like environment
- [ ] Documentation complete for each platform
- [ ] Admin panel for institution-specific configuration
- [ ] Monitoring & alerting configured
- [ ] Runbooks for common issues documented
- [ ] Support team trained on adapter troubleshooting
- [ ] Pilot institutions identified & onboarded

## Owner & Accountability

- **Technical Lead:** Integration Engineering team
- **Timeline:** Weeks 3-4 of Phase 2
- **Success Criteria:** 5 adapters live, <5 minute sync latency
- **Escalation Contact:** VP Engineering
