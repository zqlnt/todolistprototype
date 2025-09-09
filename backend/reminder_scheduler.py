"""
Reminder scheduler for task due date notifications
"""
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any
import logging
from database import fallback_db, is_using_fallback, supabase_client

logger = logging.getLogger(__name__)

class ReminderScheduler:
    def __init__(self):
        self.scheduled_reminders: Dict[str, asyncio.Task] = {}
    
    async def schedule_reminder(self, task_id: str, user_id: str, task_title: str, due_at: datetime, user_email: str = None):
        """Schedule a reminder 5 minutes before task is due"""
        if not due_at:
            return
        
        # Calculate reminder time (5 minutes before due)
        reminder_time = due_at - timedelta(minutes=5)
        now = datetime.now()
        
        # If reminder time is in the past, don't schedule
        if reminder_time <= now:
            logger.info(f"Task {task_id} due time is too soon, skipping reminder")
            return
        
        # Calculate delay in seconds
        delay = (reminder_time - now).total_seconds()
        
        logger.info(f"Scheduling reminder for task '{task_title}' in {delay/60:.1f} minutes")
        
        # Cancel existing reminder if any
        if task_id in self.scheduled_reminders:
            self.scheduled_reminders[task_id].cancel()
        
        # Schedule new reminder
        task = asyncio.create_task(self._send_reminder_after_delay(
            task_id, user_id, task_title, user_email, delay
        ))
        self.scheduled_reminders[task_id] = task
    
    async def _send_reminder_after_delay(self, task_id: str, user_id: str, task_title: str, user_email: str, delay: float):
        """Wait for the specified delay then send reminder"""
        try:
            await asyncio.sleep(delay)
            await self._send_reminder(task_id, user_id, task_title, user_email)
        except asyncio.CancelledError:
            logger.info(f"Reminder for task {task_id} was cancelled")
        except Exception as e:
            logger.error(f"Error sending reminder for task {task_id}: {e}")
        finally:
            # Clean up
            if task_id in self.scheduled_reminders:
                del self.scheduled_reminders[task_id]
    
    async def _send_reminder(self, task_id: str, user_id: str, task_title: str, user_email: str):
        """Send the actual reminder"""
        try:
            # Get user email if not provided
            if not user_email:
                if is_using_fallback():
                    user = fallback_db.get_user_by_id(user_id)
                    user_email = user['email'] if user else None
                else:
                    # For Supabase, you'd need to get user email from auth
                    user_email = None
            
            if not user_email:
                logger.warning(f"No email found for user {user_id}, cannot send reminder")
                return
            
            # For now, just log the reminder
            # In a real app, you'd send email, push notification, etc.
            logger.info(f"🔔 REMINDER: Task '{task_title}' is due in 5 minutes! (User: {user_email})")
            
            # TODO: Implement actual notification sending:
            # - Email notification
            # - Push notification
            # - In-app notification
            # - SMS (if configured)
            
        except Exception as e:
            logger.error(f"Error in reminder notification: {e}")
    
    def cancel_reminder(self, task_id: str):
        """Cancel a scheduled reminder"""
        if task_id in self.scheduled_reminders:
            self.scheduled_reminders[task_id].cancel()
            del self.scheduled_reminders[task_id]
            logger.info(f"Cancelled reminder for task {task_id}")
    
    def cancel_all_reminders(self):
        """Cancel all scheduled reminders"""
        for task_id, task in self.scheduled_reminders.items():
            task.cancel()
        self.scheduled_reminders.clear()
        logger.info("Cancelled all scheduled reminders")

# Global reminder scheduler instance
reminder_scheduler = ReminderScheduler()
