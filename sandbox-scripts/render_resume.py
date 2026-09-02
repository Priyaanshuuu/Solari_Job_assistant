"""
Render Resume Python Script
Runs in Solari sandbox to render tailored resume from JSON to DOCX

Input:
  - resume_json: Structured resume data
  - template_base64: Base template DOCX as base64
  - job_description: JD to score against

Output:
  - rendered_file_base64: Generated DOCX as base64
  - ats_score: Percentage keyword match (0-100)
  - matched_keywords: List of matched keywords
"""

import json
import sys
import base64
from typing import Dict, List, Any
from datetime import datetime
import re

# Note: In production, use python-docx library
# For MVP, this is a simplified implementation

def main(
    resume_json: Dict,
    template_base64: str,
    job_description: str
) -> Dict[str, Any]:
    """
    Render tailored resume and compute ATS scoring
    """
    try:
        # Decode template
        template_bytes = base64.b64decode(template_base64)
        
        # Extract keywords from job description
        jd_keywords = extract_keywords(job_description)
        
        # Score resume against JD
        resume_text = json.dumps(resume_json, indent=2)
        ats_score, matched_keywords = score_ats_match(resume_text, jd_keywords)
        
        # In production: use python-docx to modify template
        # For MVP: return base64-encoded template + metadata
        
        return {
            'rendered_file_base64': template_base64,  # Placeholder: would be modified template
            'ats_score': ats_score,
            'matched_keywords': matched_keywords,
        }
        
    except Exception as e:
        print(f"Error in render_resume: {e}", file=sys.stderr)
        raise


def extract_keywords(text: str, max_keywords: int = 50) -> List[str]:
    """
    Extract important keywords from job description
    Focuses on: tech stack, frameworks, methodologies, etc.
    """
    text_lower = text.lower()
    
    # Common tech/skill keywords to look for
    tech_keywords = [
        # Languages
        'python', 'javascript', 'typescript', 'java', 'c++', 'rust', 'go', 'ruby', 'php',
        # Frontend
        'react', 'vue', 'angular', 'svelte', 'next.js', 'html', 'css', 'tailwind',
        # Backend
        'node.js', 'express', 'fastify', 'django', 'flask', 'spring', 'fastapi',
        # Databases
        'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
        # Cloud
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
        # Other
        'git', 'ci/cd', 'agile', 'scrum', 'rest', 'graphql', 'microservices',
        'testing', 'jest', 'vitest', 'pytest', 'linux', 'unix',
    ]
    
    matched = [kw for kw in tech_keywords if kw in text_lower]
    return list(set(matched))[:max_keywords]


def score_ats_match(resume_text: str, jd_keywords: List[str]) -> tuple[float, List[str]]:
    """
    Score resume against JD keywords
    Returns: (score_percentage, matched_keywords_list)
    """
    if not jd_keywords:
        return 0.0, []
    
    resume_lower = resume_text.lower()
    
    matched = [kw for kw in jd_keywords if kw.lower() in resume_lower]
    
    score = (len(matched) / len(jd_keywords)) * 100
    
    return min(score, 100.0), matched


if __name__ == "__main__":
    # Read input from stdin (Solari sandbox passes JSON)
    input_data = json.loads(sys.stdin.read())
    
    result = main(
        input_data['resume_json'],
        input_data['template_base64'],
        input_data['job_description']
    )
    
    # Output result as JSON
    print(json.dumps(result))
