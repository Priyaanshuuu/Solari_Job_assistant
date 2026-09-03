"""
Filter and Score Jobs Python Script
Runs in Solari sandbox to filter raw job listings and compute relevance scores

Input:
  - raw_listings: List of RawJobListing objects
  - profile: YAML profile for the user

Output:
  - List of ProcessedJobListing objects with:
    - job_id (stable hash)
    - relevance_score
    - ats_keyword_match
    - status (new/seen/applied)
"""

import json
import sys
import hashlib
import yaml
from datetime import datetime, timezone
from typing import List, Dict, Any

# This will be called by Solari sandbox
def main(raw_listings: List[Dict], profile: str) -> List[Dict]:
    """
    Process raw job listings and compute metadata
    """
    try:
        # Parse profile YAML
        profile_data = yaml.safe_load(profile) or {}
        
        processed = []
        
        for listing in raw_listings:
            # Generate stable job_id from URL hash
            job_id = generate_job_id(listing.get('url', ''))
            job_description = listing.get('job_description', '')
            title = listing.get('title', '')
            location = listing.get('location', '')
            
            # Compute relevance score based on profile
            relevance_score = compute_relevance(listing, profile_data)
            
            # Compute ATS keyword match
            ats_match = compute_ats_keywords(
                job_description,
                profile_data.get('preferred_tech_stack', []),
                profile_data.get('priority_keywords', [])
            )
            
            # Check DB status (TODO: query actual DB)
            # For now, mark all as 'new'
            status = 'new'
            
            timestamp = datetime.now(timezone.utc).isoformat()
            processed_item = {
                'job_id': job_id,
                'url': listing['url'],
                'board': listing.get('board', 'unknown'),
                'title': title,
                'company': listing.get('company', 'Unknown company'),
                'location': location or 'Location not specified',
                'posted_date': listing.get('posted_date'),
                'job_description': job_description,
                'relevance_score': relevance_score,
                'ats_keyword_match': ats_match,
                'status': status,
                'created_at': timestamp,
                'updated_at': timestamp,
            }
            
            processed.append(processed_item)
        
        # Sort by relevance score (descending)
        processed.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return processed
        
    except Exception as e:
        print(f"Error in filter_and_score: {e}", file=sys.stderr)
        raise


def generate_job_id(url: str) -> str:
    """Generate stable job ID from URL hash"""
    return hashlib.sha256(url.encode()).hexdigest()[:12]


def compute_relevance(listing: Dict, profile: Dict) -> float:
    """
    Compute relevance score (0-100) based on:
    - Role match
    - Location match
    - Salary match
    - Keyword match
    """
    score = 50  # Base score
    
    # Role match
    desired_roles = profile.get('desired_roles', [])
    if any(role.lower() in listing.get('title', '').lower() for role in desired_roles):
        score += 20
    
    # Location match
    desired_locations = profile.get('desired_locations', [])
    if any(loc.lower() in listing.get('location', '').lower() for loc in desired_locations):
        score += 15
    
    # Remote bonus
    if 'remote' in listing.get('location', '').lower():
        if profile.get('willing_to_relocate'):
            score += 10
    
    # Keyword match
    priority_keywords = profile.get('priority_keywords', [])
    jd = listing.get('job_description', '').lower()
    keyword_hits = sum(1 for kw in priority_keywords if kw.lower() in jd)
    score += min(keyword_hits * 5, 15)
    
    # Exclude keywords penalty
    exclude_keywords = profile.get('exclude_keywords', [])
    if any(kw.lower() in jd for kw in exclude_keywords):
        score -= 30
    
    return min(max(score, 0), 100)


def compute_ats_keywords(
    job_description: str,
    tech_stack: List[str],
    priority_keywords: List[str]
) -> float:
    """
    Compute ATS keyword match percentage
    Based on overlap between JD and user's tech stack + keywords
    """
    jd_lower = job_description.lower()
    
    all_keywords = set(tech_stack + priority_keywords)
    if not all_keywords:
        return 0.0
    
    matched = sum(
        1 for kw in all_keywords
        if kw.lower() in jd_lower
    )
    
    return (matched / len(all_keywords)) * 100


if __name__ == "__main__":
    # Read input from stdin (Solari sandbox passes JSON)
    input_data = json.loads(sys.stdin.read())
    
    result = main(input_data['raw_listings'], input_data['profile'])
    
    # Output result as JSON
    print(json.dumps(result))
