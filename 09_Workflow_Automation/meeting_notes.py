import json
import datetime
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import sqlite3
from enum import Enum
import logging
import markdown
import jinja2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('meeting_notes.log'),
        logging.StreamHandler()
    ]
)

class MeetingType(Enum):
    TEAM_SYNC = "team_sync"
    PROJECT_REVIEW = "project_review"
    CLIENT_MEETING = "client_meeting"
    PLANNING = "planning"
    RETROSPECTIVE = "retrospective"
    OTHER = "other"

@dataclass
class ActionItem:
    description: str
    assignee: str
    due_date: str
    priority: str
    status: str = "pending"
    notes: Optional[str] = None

@dataclass
class MeetingNotes:
    title: str
    date: str
    meeting_type: MeetingType
    attendees: List[str]
    agenda: List[str]
    discussion_points: List[str]
    action_items: List[ActionItem]
    decisions: List[str]
    next_steps: List[str]
    duration: int  # in minutes
    location: Optional[str] = None
    recording_link: Optional[str] = None
    attachments: Optional[List[str]] = None
    notes: Optional[str] = None

    def to_dict(self) -> Dict:
        return {k: str(v) if isinstance(v, MeetingType) else v 
                for k, v in asdict(self).items()}

class MeetingNotesManager:
    def __init__(self, db_path: str = "meeting_notes.db", config_path: str = "config/meeting_notes_config.json"):
        self.db_path = db_path
        self.config = self._load_config(config_path)
        self.setup_database()
        self.template_env = self._setup_templates()

    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file."""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logging.warning(f"Config file not found at {config_path}, using defaults")
            return {}

    def _setup_templates(self) -> jinja2.Environment:
        """Set up Jinja2 template environment."""
        template_loader = jinja2.FileSystemLoader(searchpath="./templates")
        return jinja2.Environment(loader=template_loader)

    def setup_database(self):
        """Initialize SQLite database with required tables."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS meetings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    date TEXT NOT NULL,
                    meeting_type TEXT NOT NULL,
                    attendees TEXT NOT NULL,
                    agenda TEXT NOT NULL,
                    discussion_points TEXT NOT NULL,
                    decisions TEXT NOT NULL,
                    next_steps TEXT NOT NULL,
                    duration INTEGER NOT NULL,
                    location TEXT,
                    recording_link TEXT,
                    attachments TEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS action_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    meeting_id INTEGER NOT NULL,
                    description TEXT NOT NULL,
                    assignee TEXT NOT NULL,
                    due_date TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    status TEXT NOT NULL,
                    notes TEXT,
                    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
                )
            """)

    def create_meeting_notes(self, meeting: MeetingNotes) -> int:
        """Create new meeting notes entry."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Insert meeting details
            meeting_dict = meeting.to_dict()
            meeting_dict['attendees'] = json.dumps(meeting_dict['attendees'])
            meeting_dict['agenda'] = json.dumps(meeting_dict['agenda'])
            meeting_dict['discussion_points'] = json.dumps(meeting_dict['discussion_points'])
            meeting_dict['decisions'] = json.dumps(meeting_dict['decisions'])
            meeting_dict['next_steps'] = json.dumps(meeting_dict['next_steps'])
            meeting_dict['attachments'] = json.dumps(meeting_dict['attachments'])
            
            # Remove action_items from dict as they're stored separately
            action_items = meeting_dict.pop('action_items')
            
            columns = ', '.join(meeting_dict.keys())
            placeholders = ', '.join(['?' for _ in meeting_dict])
            query = f"INSERT INTO meetings ({columns}) VALUES ({placeholders})"
            
            cursor.execute(query, list(meeting_dict.values()))
            meeting_id = cursor.lastrowid
            
            # Insert action items
            for item in action_items:
                item_dict = asdict(item)
                item_dict['meeting_id'] = meeting_id
                
                columns = ', '.join(item_dict.keys())
                placeholders = ', '.join(['?' for _ in item_dict])
                query = f"INSERT INTO action_items ({columns}) VALUES ({placeholders})"
                
                cursor.execute(query, list(item_dict.values()))
            
            return meeting_id

    def get_meeting_notes(self, meeting_id: int) -> Optional[MeetingNotes]:
        """Retrieve meeting notes by ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get meeting details
            cursor.execute("SELECT * FROM meetings WHERE id = ?", (meeting_id,))
            meeting_data = cursor.fetchone()
            
            if not meeting_data:
                return None
            
            # Get action items
            cursor.execute("SELECT * FROM action_items WHERE meeting_id = ?", (meeting_id,))
            action_items_data = cursor.fetchall()
            
            # Convert meeting data to dictionary
            meeting_dict = dict(zip([col[0] for col in cursor.description], meeting_data))
            
            # Parse JSON strings back to lists
            meeting_dict['attendees'] = json.loads(meeting_dict['attendees'])
            meeting_dict['agenda'] = json.loads(meeting_dict['agenda'])
            meeting_dict['discussion_points'] = json.loads(meeting_dict['discussion_points'])
            meeting_dict['decisions'] = json.loads(meeting_dict['decisions'])
            meeting_dict['next_steps'] = json.loads(meeting_dict['next_steps'])
            if meeting_dict['attachments']:
                meeting_dict['attachments'] = json.loads(meeting_dict['attachments'])
            
            # Convert action items data to ActionItem objects
            action_items = []
            for item_data in action_items_data:
                item_dict = dict(zip([col[0] for col in cursor.description], item_data))
                action_items.append(ActionItem(
                    description=item_dict['description'],
                    assignee=item_dict['assignee'],
                    due_date=item_dict['due_date'],
                    priority=item_dict['priority'],
                    status=item_dict['status'],
                    notes=item_dict['notes']
                ))
            
            meeting_dict['action_items'] = action_items
            meeting_dict['meeting_type'] = MeetingType(meeting_dict['meeting_type'])
            
            return MeetingNotes(**{k: v for k, v in meeting_dict.items() 
                                 if k in MeetingNotes.__annotations__})

    def export_notes(self, meeting_id: int, format: str = 'markdown') -> str:
        """Export meeting notes in various formats."""
        meeting = self.get_meeting_notes(meeting_id)
        if not meeting:
            raise ValueError(f"Meeting with ID {meeting_id} not found")
        
        if format.lower() == 'markdown':
            return self._format_as_markdown(meeting)
        elif format.lower() == 'html':
            md_content = self._format_as_markdown(meeting)
            return markdown.markdown(md_content)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _format_as_markdown(self, meeting: MeetingNotes) -> str:
        """Format meeting notes as markdown."""
        template = self.template_env.get_template('meeting_notes_template.md')
        return template.render(meeting=meeting)

    def send_notes(self, meeting_id: int, recipients: List[str]):
        """Send meeting notes to attendees."""
        meeting = self.get_meeting_notes(meeting_id)
        if not meeting:
            raise ValueError(f"Meeting with ID {meeting_id} not found")
        
        html_content = self.export_notes(meeting_id, 'html')
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Meeting Notes: {meeting.title} ({meeting.date})"
        msg['From'] = self.config.get('email', {}).get('sender', 'noreply@example.com')
        msg['To'] = ', '.join(recipients)
        
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email using configured SMTP settings
        smtp_config = self.config.get('email', {}).get('smtp', {})
        with smtplib.SMTP(smtp_config.get('server'), smtp_config.get('port', 587)) as server:
            server.starttls()
            server.login(smtp_config.get('username'), smtp_config.get('password'))
            server.send_message(msg)

    def get_action_items_by_assignee(self, assignee: str) -> List[Dict]:
        """Get all action items assigned to a specific person."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT a.*, m.title as meeting_title, m.date as meeting_date
                FROM action_items a
                JOIN meetings m ON a.meeting_id = m.id
                WHERE a.assignee = ? AND a.status != 'completed'
                ORDER BY a.due_date ASC
            """, (assignee,))
            
            return [dict(zip([col[0] for col in cursor.description], row))
                   for row in cursor.fetchall()]

    def update_action_item(self, item_id: int, updates: Dict) -> bool:
        """Update an action item's status or details."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
            query = f"UPDATE action_items SET {set_clause} WHERE id = ?"
            values = list(updates.values()) + [item_id]
            cursor.execute(query, values)
            return cursor.rowcount > 0

def main():
    """Example usage of the MeetingNotesManager."""
    manager = MeetingNotesManager()
    
    # Example meeting notes creation
    action_items = [
        ActionItem(
            description="Update project timeline",
            assignee="john@example.com",
            due_date="2024-12-15",
            priority="high",
            status="pending"
        ),
        ActionItem(
            description="Schedule follow-up meeting",
            assignee="jane@example.com",
            due_date="2024-12-10",
            priority="medium",
            status="pending"
        )
    ]
    
    meeting = MeetingNotes(
        title="Project Kickoff Meeting",
        date=datetime.datetime.now().strftime('%Y-%m-%d'),
        meeting_type=MeetingType.PROJECT_REVIEW,
        attendees=["john@example.com", "jane@example.com"],
        agenda=["Project Overview", "Timeline Discussion", "Resource Allocation"],
        discussion_points=["Discussed project goals", "Reviewed timeline"],
        action_items=action_items,
        decisions=["Approved project timeline", "Allocated resources"],
        next_steps=["Schedule weekly follow-ups", "Set up project tools"],
        duration=60,
        location="Conference Room A"
    )
    
    # Create meeting notes
    meeting_id = manager.create_meeting_notes(meeting)
    logging.info(f"Created meeting notes with ID: {meeting_id}")
    
    # Export notes
    print("\nMeeting Notes (Markdown):")
    print(manager.export_notes(meeting_id, 'markdown'))

if __name__ == "__main__":
    main()
