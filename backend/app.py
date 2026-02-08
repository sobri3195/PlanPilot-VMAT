from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@dataclass
class PlanningCase:
    site: str
    ai_ci: float
    manual_ci: float
    ai_hi: float
    manual_hi: float
    ai_oar_score: float
    manual_oar_score: float
    ai_minutes: float
    manual_minutes: float
    ai_revisions: int
    manual_revisions: int


def is_non_inferior(ai: float, manual: float, margin: float, higher_is_better: bool = True) -> bool:
    if higher_is_better:
        return ai >= (manual - margin)
    return ai <= (manual + margin)


def summarize_case(case: PlanningCase) -> Dict[str, object]:
    ci_non_inferior = is_non_inferior(case.ai_ci, case.manual_ci, margin=0.05, higher_is_better=True)
    hi_non_inferior = is_non_inferior(case.ai_hi, case.manual_hi, margin=0.05, higher_is_better=False)
    oar_non_inferior = is_non_inferior(case.ai_oar_score, case.manual_oar_score, margin=3, higher_is_better=False)

    time_delta = case.manual_minutes - case.ai_minutes
    revision_delta = case.manual_revisions - case.ai_revisions

    return {
        "site": case.site,
        "metrics": {
            "ci": {"ai": case.ai_ci, "manual": case.manual_ci, "nonInferior": ci_non_inferior},
            "hi": {"ai": case.ai_hi, "manual": case.manual_hi, "nonInferior": hi_non_inferior},
            "oarScore": {
                "ai": case.ai_oar_score,
                "manual": case.manual_oar_score,
                "nonInferior": oar_non_inferior,
            },
            "planningTimeMinutes": {
                "ai": case.ai_minutes,
                "manual": case.manual_minutes,
                "savedByAI": round(time_delta, 2),
            },
            "revisions": {
                "ai": case.ai_revisions,
                "manual": case.manual_revisions,
                "reducedByAI": revision_delta,
            },
        },
        "overallNonInferior": ci_non_inferior and hi_non_inferior and oar_non_inferior,
    }


@app.get("/api/health")
def health() -> tuple:
    return jsonify({"status": "ok", "project": "PlanPilot-VMAT"}), 200


@app.post("/api/analyze")
def analyze() -> tuple:
    payload = request.get_json(force=True)
    case = PlanningCase(**payload)
    return jsonify(summarize_case(case)), 200


@app.get("/api/sample-cases")
def sample_cases() -> tuple:
    samples: List[PlanningCase] = [
        PlanningCase("Head & Neck", 0.92, 0.91, 1.07, 1.05, 23, 24, 45, 95, 1, 3),
        PlanningCase("Prostat", 0.94, 0.93, 1.04, 1.03, 18, 18, 35, 70, 1, 2),
        PlanningCase("Pelvis", 0.9, 0.9, 1.08, 1.08, 26, 25, 50, 80, 2, 3),
        PlanningCase("Toraks", 0.88, 0.9, 1.1, 1.06, 28, 27, 55, 90, 2, 4),
    ]

    return jsonify([summarize_case(case) for case in samples]), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
