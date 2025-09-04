from fastapi import APIRouter, HTTPException, Depends, status
from fastapi import Request
from typing import List
from datetime import datetime, timedelta
import uuid
from models import Email, SuggestedTask, EmailSyncResponse, User
from auth_utils import get_current_user_flexible

router = APIRouter(prefix="/api/emails", tags=["emails"])

# Mock email data - replace with actual email provider integration
def generate_mock_emails() -> List[Email]:
    """Generate mock emails for demonstration"""
    now = datetime.now()
    
    return [
        Email(
            id="email-1",
            subject="Your BA Flight BA143 – London→Dubai – 2 Sep 12:40",
            body="Flight confirmation for BA143 departing London Heathrow (LHR) to Dubai (DXB) on September 2nd at 12:40. Please check in online 24 hours before departure.",
            received_at=now - timedelta(hours=2),
            sender="British Airways <noreply@britishairways.com>",
            recipient="you@example.com"
        ),
        Email(
            id="email-2",
            subject="Project Kickoff – Tue 10:00",
            body="Hi team, we have our project kickoff meeting scheduled for Tuesday at 10:00 AM. Please come prepared with your initial thoughts and questions.",
            received_at=now - timedelta(hours=4),
            sender="Sarah Johnson <sarah@company.com>",
            recipient="you@example.com"
        ),
        Email(
            id="email-3",
            subject="Invoice due 31 Aug - Action Required",
            body="Dear customer, your invoice #INV-2024-08-001 for $2,450 is due on August 31st. Please make payment by 5 PM to avoid late fees.",
            received_at=now - timedelta(hours=6),
            sender="Billing <billing@service.com>",
            recipient="you@example.com"
        ),
        Email(
            id="email-4",
            subject="URGENT: Quarterly Review Deadline Tomorrow",
            body="The quarterly review documents are due tomorrow by end of day. Please ensure all sections are completed and submitted through the company portal.",
            received_at=now - timedelta(hours=1),
            sender="HR Department <hr@company.com>",
            recipient="you@example.com"
        )
    ]

def generate_task_suggestions(emails: List[Email]) -> List[SuggestedTask]:
    """Generate task suggestions from emails using simple keyword matching"""
    suggestions = []
    now = datetime.now()
    
    for email in emails:
        subject_lower = email.subject.lower()
        body_lower = email.body.lower()
        
        # Flight detection
        if 'flight' in subject_lower or 'ba' in subject_lower:
            check_in_time = now + timedelta(hours=18)  # Tomorrow morning
            suggestions.append(SuggestedTask(
                id=f"suggestion-{uuid.uuid4()}",
                title="Check in for flight BA143",
                dueAt=check_in_time,
                category="Travel",
                linkedEmailId=email.id,
                emailSubject=email.subject
            ))
        
        # Meeting detection
        if 'kickoff' in subject_lower or 'meeting' in subject_lower:
            meeting_date = now + timedelta(days=1, hours=-14)  # Tomorrow 9 AM
            suggestions.append(SuggestedTask(
                id=f"suggestion-{uuid.uuid4()}",
                title="Prepare for Project Kickoff meeting",
                dueAt=meeting_date,
                category="Work",
                linkedEmailId=email.id,
                emailSubject=email.subject
            ))
        
        # Invoice detection
        if 'invoice' in subject_lower or 'due' in subject_lower:
            # Set due date to August 31st at 5 PM
            bill_date = datetime(now.year, 8, 31, 17, 0, 0)
            suggestions.append(SuggestedTask(
                id=f"suggestion-{uuid.uuid4()}",
                title="Pay invoice #INV-2024-08-001",
                dueAt=bill_date,
                category="Finance",
                linkedEmailId=email.id,
                emailSubject=email.subject
            ))
        
        # Deadline detection
        if 'deadline' in subject_lower or 'urgent' in subject_lower:
            deadline_date = now + timedelta(hours=8)  # Tomorrow end of day
            suggestions.append(SuggestedTask(
                id=f"suggestion-{uuid.uuid4()}",
                title="Complete quarterly review documents",
                dueAt=deadline_date,
                category="Work",
                linkedEmailId=email.id,
                emailSubject=email.subject
            ))
    
    return suggestions

@router.get("/", response_model=List[Email])
async def get_emails(request: Request, current_user: User = Depends(get_current_user_flexible)):
    """Get user's emails"""
    try:
        # In a real implementation, this would fetch from email providers
        emails = generate_mock_emails()
        return emails
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch emails: {str(e)}"
        )

@router.post("/sync", response_model=EmailSyncResponse)
async def sync_emails(request: Request, current_user: User = Depends(get_current_user_flexible)):
    """Sync emails and generate task suggestions"""
    try:
        # Simulate email fetching delay
        import asyncio
        await asyncio.sleep(1)
        
        # Generate mock emails and suggestions
        emails = generate_mock_emails()
        suggestions = generate_task_suggestions(emails)
        
        return EmailSyncResponse(
            success=True,
            emails=emails,
            suggestions=suggestions,
            message=f"Synced {len(emails)} emails, found {len(suggestions)} suggestions"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync emails: {str(e)}"
        )

@router.get("/suggestions", response_model=List[SuggestedTask])
async def get_email_suggestions(request: Request, current_user: User = Depends(get_current_user_flexible)):
    """Get task suggestions from emails"""
    try:
        emails = generate_mock_emails()
        suggestions = generate_task_suggestions(emails)
        return suggestions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate suggestions: {str(e)}"
        )