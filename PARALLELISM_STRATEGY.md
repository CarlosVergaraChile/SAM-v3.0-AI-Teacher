# SAM-v3.0 Parallelism & Workstream Strategy

**Status**: Active Execution Phase  
**Last Updated**: 2025-12-17 01:00 UTC  
**Coordinator**: Comet (Multi-AI Agent Framework)

---

## 🎯 Strategic Overview

This document defines the high-parallelism, low-friction execution model for SAM-v3.0 ecosystem improvement. The goal is to maximize throughput across **3 major workstreams** while maintaining clarity, traceability, and human autonomy.

### Key Principles

✅ **High parallelism** = Multiple workstreams active simultaneously  
✅ **Low friction** = Minimal context-switching, no artificial delays  
✅ **AI + Human synergy** = AI handles decomposition, execution, tracking; humans decide priorities  
✅ **GitHub as source of truth** = All decisions, issues, and progress tracked here  

---

## 📊 Three Workstreams (Active)

### Workstream 1: OSINT Tools Integration
**Owner**: Comet  
**Status**: 🟢 IN PROGRESS  
**WIP Limit**: 2 tasks max  

| Issue | Title | Status | ETA |
|-------|-------|--------|-----|
| #1 | feat(osint): Director Search (Caso #1) | In Progress | Wk1 (23 Dec) |
| #2 | feat(osint): Document Summary (Caso #2) | Pending | Wk2 (30 Dec) |
| - | feat(osint): Expertise Validation (Caso #3) | Backlog | Wk3+ |

**Deliverables**:
- ✅ `osint/README_osint.md` - Strategy & tool candidates
- ✅ `osint/requirements-osint.txt` - Dependencies
- 🔄 `osint/director_search.py` - Script for #1
- ⏳ `osint/document_summary.py` - Script for #2
- 📚 Tests & integration PRs

**Key APIs**: PhantomBuster, Perplexity, Google Custom Search

---

### Workstream 2: Director CRM Integration
**Owner**: Comet  
**Status**: 🟢 IN PROGRESS  
**WIP Limit**: 2 tasks max  

| Issue | Title | Status | ETA |
|-------|-------|--------|-----|
| #3 | feat(directory): CRM Database Integration | In Progress | Wk1-2 (30 Dec) |
| - | feat(directory): API Endpoints | Pending | Wk2-3 |

**Deliverables**:
- 🔄 `directory/schema.sql` - DB structure (10+ directors)
- ⏳ `directory/crud.py` - Read/Write operations
- ⏳ `api/director_endpoints.py` - REST API
- 📚 Integration with OSINT director_search

**Data Fields**: name, institution, specialty, email, phone, LinkedIn, region

---

### Workstream 3: NotebookLM + jeldres
**Owner**: Comet  
**Status**: 🟡 PREPARED (Not Blocking)  
**WIP Limit**: 1 task (decision gate)  

| Issue | Title | Status | ETA |
|-------|-------|--------|-----|
| #4 | feat(notebooklm): Educational Content Pipeline | Prepared | Wk2+ (after material confirmation) |

**Deliverables**:
- ⏳ Material selection (provisional: Diplomado Salud)
- ⏳ `notebooklm/auto_upload.py` - Automation script
- ⏳ Integration with OSINT document_summary

**Blocker**: Awaiting confirmation of final material source (jeldres syllabus or alternative)

---

## 🔄 Parallelism Rules (Execution Pattern)

### Active Workstreams
- **Max 2 workstreams** actively executing (OSINT + Directory)
- **Max 2 tasks** per workstream in progress simultaneously
- **Decision gates** before activating prepared workstreams

### Workflow for Each Task

```
1. PLAN (GitHub Issue)
   ├─ Objective, deliverables, acceptance criteria
   ├─ Dependencies (which issues block this?)
   └─ Assign to workstream

2. IMPLEMENT (PR + Code)
   ├─ Code changes linked to issue
   ├─ Tests included
   └─ Description references issue #N

3. REVIEW (GitHub)
   ├─ At least 1 review cycle
   ├─ CI/CD checks (if configured)
   └─ Merge to main

4. TRACK (GitHub Issues)
   └─ Mark issue "closed" with PR reference
```

---

## 🚦 Current Bottlenecks & Unblocking

| Workstream | Blocker | Unblocking Action |
|------------|---------|-------------------|
| OSINT #1 | API keys not configured | User provides PhantomBuster/Perplexity keys |
| OSINT #2 | Depends on #1 partial completion | #1 60% done, #2 can start with mock data |
| Directory | Schema needs approval | User confirms field structure |
| NotebookLM | Material source unclear | User confirms Diplomado APS or alternative |

---

## 📈 Success Metrics (MVP, 3 weeks)

✅ OSINT Module
- [ ] director_search.py finds 3/3 test directors < 5 sec
- [ ] document_summary.py summarizes 1 URL/PDF correctly
- [ ] 5+ test cases passing

✅ Director CRM
- [ ] Database stores 10+ verified directors
- [ ] CRUD operations work without errors
- [ ] API returns valid JSON for searches

✅ NotebookLM (if material confirmed)
- [ ] 1 Notebook generated with syllabus + cases
- [ ] PDF export working
- [ ] Ready for integration

---

## 🔗 Links

- **Repository**: https://github.com/CarlosVergaraChile/SAM-v3.0-AI-Teacher
- **Issues**: /issues
- **Docs**: /osint/README_osint.md
- **Milestones**: (to be configured)

---

**Next Sync**: User decision on which 2 workstreams to activate immediately
