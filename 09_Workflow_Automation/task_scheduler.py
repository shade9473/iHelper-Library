import json
import datetime
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import sqlite3
from enum import Enum
import schedule
import time
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('task_scheduler.log'),
        logging.StreamHandler()
    ]
)

class Priority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"
    CANCELLED = "cancelled"

@dataclass
class Task:
    title: str
    description: str
    due_date: str
    priority: Priority
    status: TaskStatus
    category: str
    estimated_duration: int  # in minutes
    recurring: bool = False
    recurrence_pattern: Optional[str] = None
    dependencies: List[str] = None
    tags: List[str] = None
    completion_date: Optional[str] = None
    notes: Optional[str] = None

    def to_dict(self) -> Dict:
        return {k: str(v) if isinstance(v, (Priority, TaskStatus)) else v 
                for k, v in asdict(self).items()}

class TaskScheduler:
    def __init__(self, db_path: str = "tasks.db"):
        self.db_path = db_path
        self.setup_database()
        
    def setup_database(self):
        """Initialize SQLite database with required tables."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    due_date TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    status TEXT NOT NULL,
                    category TEXT NOT NULL,
                    estimated_duration INTEGER,
                    recurring BOOLEAN,
                    recurrence_pattern TEXT,
                    dependencies TEXT,
                    tags TEXT,
                    completion_date TEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    color TEXT,
                    description TEXT
                )
            """)

    def add_task(self, task: Task) -> int:
        """Add a new task to the database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            task_dict = task.to_dict()
            
            # Convert lists to JSON strings
            if task_dict['dependencies']:
                task_dict['dependencies'] = json.dumps(task_dict['dependencies'])
            if task_dict['tags']:
                task_dict['tags'] = json.dumps(task_dict['tags'])
            
            columns = ', '.join(task_dict.keys())
            placeholders = ', '.join(['?' for _ in task_dict])
            query = f"INSERT INTO tasks ({columns}) VALUES ({placeholders})"
            
            cursor.execute(query, list(task_dict.values()))
            return cursor.lastrowid

    def get_task(self, task_id: int) -> Optional[Task]:
        """Retrieve a task by its ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            task_data = cursor.fetchone()
            
            if task_data:
                task_dict = dict(zip([col[0] for col in cursor.description], task_data))
                # Convert JSON strings back to lists
                if task_dict['dependencies']:
                    task_dict['dependencies'] = json.loads(task_dict['dependencies'])
                if task_dict['tags']:
                    task_dict['tags'] = json.loads(task_dict['tags'])
                
                # Convert string representations back to enums
                task_dict['priority'] = Priority[task_dict['priority']]
                task_dict['status'] = TaskStatus[task_dict['status']]
                
                return Task(**{k: v for k, v in task_dict.items() 
                             if k in Task.__annotations__})
        return None

    def update_task(self, task_id: int, updates: Dict) -> bool:
        """Update a task with new values."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
            query = f"UPDATE tasks SET {set_clause} WHERE id = ?"
            values = list(updates.values()) + [task_id]
            cursor.execute(query, values)
            return cursor.rowcount > 0

    def delete_task(self, task_id: int) -> bool:
        """Delete a task by its ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            return cursor.rowcount > 0

    def get_tasks_by_status(self, status: TaskStatus) -> List[Task]:
        """Retrieve all tasks with a specific status."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE status = ?", (status.value,))
            return [self.get_task(row[0]) for row in cursor.fetchall()]

    def get_tasks_by_date(self, date: str) -> List[Task]:
        """Retrieve all tasks due on a specific date."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE due_date = ?", (date,))
            return [self.get_task(row[0]) for row in cursor.fetchall()]

    def get_overdue_tasks(self) -> List[Task]:
        """Retrieve all overdue tasks."""
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM tasks 
                WHERE due_date < ? 
                AND status NOT IN (?, ?)
            """, (today, TaskStatus.COMPLETED.value, TaskStatus.CANCELLED.value))
            return [self.get_task(row[0]) for row in cursor.fetchall()]

    def schedule_recurring_tasks(self):
        """Schedule recurring tasks based on their patterns."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE recurring = 1")
            recurring_tasks = [self.get_task(row[0]) for row in cursor.fetchall()]
            
            for task in recurring_tasks:
                if task.recurrence_pattern == 'daily':
                    schedule.every().day.do(self._create_recurring_task, task)
                elif task.recurrence_pattern == 'weekly':
                    schedule.every().week.do(self._create_recurring_task, task)
                elif task.recurrence_pattern == 'monthly':
                    schedule.every().month.do(self._create_recurring_task, task)

    def _create_recurring_task(self, template_task: Task):
        """Create a new instance of a recurring task."""
        new_task = Task(
            title=template_task.title,
            description=template_task.description,
            due_date=(datetime.datetime.now() + 
                     self._get_recurrence_delta(template_task.recurrence_pattern)
                    ).strftime('%Y-%m-%d'),
            priority=template_task.priority,
            status=TaskStatus.PENDING,
            category=template_task.category,
            estimated_duration=template_task.estimated_duration,
            recurring=True,
            recurrence_pattern=template_task.recurrence_pattern,
            tags=template_task.tags
        )
        self.add_task(new_task)

    def _get_recurrence_delta(self, pattern: str) -> datetime.timedelta:
        """Calculate the time delta for recurring tasks."""
        if pattern == 'daily':
            return datetime.timedelta(days=1)
        elif pattern == 'weekly':
            return datetime.timedelta(weeks=1)
        elif pattern == 'monthly':
            return datetime.timedelta(days=30)
        return datetime.timedelta(days=1)

    def generate_daily_schedule(self) -> Dict:
        """Generate a schedule for today's tasks."""
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        tasks = self.get_tasks_by_date(today)
        
        schedule = {
            'date': today,
            'tasks': [],
            'total_duration': 0,
            'priority_breakdown': {
                'urgent': 0,
                'high': 0,
                'medium': 0,
                'low': 0
            }
        }
        
        for task in sorted(tasks, key=lambda x: (x.priority.value, x.estimated_duration), reverse=True):
            schedule['tasks'].append(task.to_dict())
            schedule['total_duration'] += task.estimated_duration
            priority_level = task.priority.name.lower()
            schedule['priority_breakdown'][priority_level] += 1
        
        return schedule

    def export_schedule(self, format: str = 'json') -> str:
        """Export the daily schedule in various formats."""
        schedule_data = self.generate_daily_schedule()
        
        if format.lower() == 'json':
            return json.dumps(schedule_data, indent=2)
        elif format.lower() == 'text':
            return self._format_schedule_as_text(schedule_data)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _format_schedule_as_text(self, schedule_data: Dict) -> str:
        """Format schedule data as human-readable text."""
        output = [
            f"Daily Schedule for {schedule_data['date']}",
            f"Total Duration: {schedule_data['total_duration']} minutes\n",
            "Priority Breakdown:",
            f"  Urgent: {schedule_data['priority_breakdown']['urgent']}",
            f"  High: {schedule_data['priority_breakdown']['high']}",
            f"  Medium: {schedule_data['priority_breakdown']['medium']}",
            f"  Low: {schedule_data['priority_breakdown']['low']}\n",
            "Tasks:"
        ]
        
        for task in schedule_data['tasks']:
            output.append(
                f"- [{task['status']}] {task['title']} "
                f"(Priority: {task['priority']}, Duration: {task['estimated_duration']}min)"
            )
        
        return '\n'.join(output)

def main():
    """Example usage of the TaskScheduler."""
    scheduler = TaskScheduler()
    
    # Example task creation
    task = Task(
        title="Review Project Proposal",
        description="Review and provide feedback on the new project proposal",
        due_date=datetime.datetime.now().strftime('%Y-%m-%d'),
        priority=Priority.HIGH,
        status=TaskStatus.PENDING,
        category="Work",
        estimated_duration=60,
        tags=["project", "review"]
    )
    
    # Add task
    task_id = scheduler.add_task(task)
    logging.info(f"Created task with ID: {task_id}")
    
    # Generate and display schedule
    print("\nDaily Schedule:")
    print(scheduler.export_schedule('text'))

if __name__ == "__main__":
    main()
