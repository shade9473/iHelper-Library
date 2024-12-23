import json
import datetime
from pathlib import Path
from typing import Dict, List, Optional, Union
from dataclasses import dataclass, asdict
import sqlite3
from enum import Enum
import logging
from datetime import datetime, timedelta
import plotly.figure_factory as ff
import plotly.graph_objects as go
import pandas as pd

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('project_timeline.log'),
        logging.StreamHandler()
    ]
)

class TaskStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"
    BLOCKED = "blocked"

class Priority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class Milestone:
    title: str
    date: str
    description: str
    deliverables: List[str]
    status: TaskStatus = TaskStatus.NOT_STARTED
    completion_date: Optional[str] = None

@dataclass
class Task:
    title: str
    start_date: str
    end_date: str
    assignee: str
    description: str
    status: TaskStatus
    priority: Priority
    dependencies: List[str] = None
    progress: float = 0.0  # 0 to 1
    notes: Optional[str] = None

@dataclass
class Project:
    name: str
    description: str
    start_date: str
    end_date: str
    tasks: List[Task]
    milestones: List[Milestone]
    team: List[str]
    status: TaskStatus = TaskStatus.NOT_STARTED
    budget: Optional[float] = None
    notes: Optional[str] = None

class ProjectTimelineManager:
    def __init__(self, db_path: str = "project_timeline.db", config_path: str = "config/project_timeline_config.json"):
        self.db_path = db_path
        self.config = self._load_config(config_path)
        self.setup_database()

    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file."""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logging.warning(f"Config file not found at {config_path}, using defaults")
            return {}

    def setup_database(self):
        """Initialize SQLite database with required tables."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    team TEXT NOT NULL,
                    status TEXT NOT NULL,
                    budget REAL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    assignee TEXT NOT NULL,
                    description TEXT,
                    status TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    dependencies TEXT,
                    progress REAL DEFAULT 0,
                    notes TEXT,
                    FOREIGN KEY (project_id) REFERENCES projects (id)
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS milestones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    date TEXT NOT NULL,
                    description TEXT,
                    deliverables TEXT NOT NULL,
                    status TEXT NOT NULL,
                    completion_date TEXT,
                    FOREIGN KEY (project_id) REFERENCES projects (id)
                )
            """)

    def create_project(self, project: Project) -> int:
        """Create a new project with tasks and milestones."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Insert project
            project_dict = asdict(project)
            project_dict['team'] = json.dumps(project_dict['team'])
            project_dict['status'] = project_dict['status'].value
            
            # Remove tasks and milestones as they're stored separately
            tasks = project_dict.pop('tasks')
            milestones = project_dict.pop('milestones')
            
            columns = ', '.join(project_dict.keys())
            placeholders = ', '.join(['?' for _ in project_dict])
            query = f"INSERT INTO projects ({columns}) VALUES ({placeholders})"
            
            cursor.execute(query, list(project_dict.values()))
            project_id = cursor.lastrowid
            
            # Insert tasks
            for task in tasks:
                task_dict = asdict(task)
                task_dict['project_id'] = project_id
                task_dict['status'] = task_dict['status'].value
                task_dict['priority'] = task_dict['priority'].value
                if task_dict['dependencies']:
                    task_dict['dependencies'] = json.dumps(task_dict['dependencies'])
                
                columns = ', '.join(task_dict.keys())
                placeholders = ', '.join(['?' for _ in task_dict])
                query = f"INSERT INTO tasks ({columns}) VALUES ({placeholders})"
                
                cursor.execute(query, list(task_dict.values()))
            
            # Insert milestones
            for milestone in milestones:
                milestone_dict = asdict(milestone)
                milestone_dict['project_id'] = project_id
                milestone_dict['status'] = milestone_dict['status'].value
                milestone_dict['deliverables'] = json.dumps(milestone_dict['deliverables'])
                
                columns = ', '.join(milestone_dict.keys())
                placeholders = ', '.join(['?' for _ in milestone_dict])
                query = f"INSERT INTO milestones ({columns}) VALUES ({placeholders})"
                
                cursor.execute(query, list(milestone_dict.values()))
            
            return project_id

    def get_project(self, project_id: int) -> Optional[Project]:
        """Retrieve a project by its ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get project details
            cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            project_data = cursor.fetchone()
            
            if not project_data:
                return None
            
            # Get tasks
            cursor.execute("SELECT * FROM tasks WHERE project_id = ?", (project_id,))
            tasks_data = cursor.fetchall()
            
            # Get milestones
            cursor.execute("SELECT * FROM milestones WHERE project_id = ?", (project_id,))
            milestones_data = cursor.fetchall()
            
            # Convert project data to dictionary
            project_dict = dict(zip([col[0] for col in cursor.description], project_data))
            project_dict['team'] = json.loads(project_dict['team'])
            project_dict['status'] = TaskStatus(project_dict['status'])
            
            # Convert tasks data to Task objects
            tasks = []
            for task_data in tasks_data:
                task_dict = dict(zip([col[0] for col in cursor.description], task_data))
                if task_dict['dependencies']:
                    task_dict['dependencies'] = json.loads(task_dict['dependencies'])
                task_dict['status'] = TaskStatus(task_dict['status'])
                task_dict['priority'] = Priority(task_dict['priority'])
                tasks.append(Task(**{k: v for k, v in task_dict.items() 
                                   if k in Task.__annotations__}))
            
            # Convert milestones data to Milestone objects
            milestones = []
            for milestone_data in milestones_data:
                milestone_dict = dict(zip([col[0] for col in cursor.description], milestone_data))
                milestone_dict['deliverables'] = json.loads(milestone_dict['deliverables'])
                milestone_dict['status'] = TaskStatus(milestone_dict['status'])
                milestones.append(Milestone(**{k: v for k, v in milestone_dict.items() 
                                             if k in Milestone.__annotations__}))
            
            project_dict['tasks'] = tasks
            project_dict['milestones'] = milestones
            
            return Project(**{k: v for k, v in project_dict.items() 
                            if k in Project.__annotations__})

    def update_task_progress(self, task_id: int, progress: float) -> bool:
        """Update the progress of a task."""
        if not 0 <= progress <= 1:
            raise ValueError("Progress must be between 0 and 1")
            
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE tasks 
                SET progress = ?,
                    status = CASE 
                        WHEN ? = 1 THEN ? 
                        WHEN ? > 0 THEN ? 
                        ELSE status 
                    END
                WHERE id = ?
            """, (
                progress, 
                progress, TaskStatus.COMPLETED.value,
                progress, TaskStatus.IN_PROGRESS.value,
                task_id
            ))
            return cursor.rowcount > 0

    def generate_gantt_chart(self, project_id: int, output_path: str = "timeline.html"):
        """Generate an interactive Gantt chart using plotly."""
        project = self.get_project(project_id)
        if not project:
            raise ValueError(f"Project with ID {project_id} not found")
        
        # Prepare data for tasks
        task_data = []
        for task in project.tasks:
            task_data.append(dict(
                Task=task.title,
                Start=task.start_date,
                Finish=task.end_date,
                Resource=task.assignee,
                Progress=task.progress,
                Status=task.status.value,
                Priority=task.priority.value
            ))
        
        # Create DataFrame
        df = pd.DataFrame(task_data)
        
        # Create Gantt chart
        fig = ff.create_gantt(df, 
                             index_col='Resource',
                             show_colorbar=True,
                             group_tasks=True,
                             showgrid_x=True,
                             showgrid_y=True)
        
        # Add milestones
        for milestone in project.milestones:
            fig.add_trace(go.Scatter(
                x=[milestone.date],
                y=[0],
                mode='markers',
                name=milestone.title,
                marker=dict(
                    symbol='diamond',
                    size=16,
                    color='red',
                    line=dict(color='darkred', width=2)
                ),
                showlegend=True
            ))
        
        # Update layout
        fig.update_layout(
            title=f"Project Timeline: {project.name}",
            xaxis_title="Date",
            height=400 + (len(project.tasks) * 30),
            font=dict(size=10)
        )
        
        # Save to file
        fig.write_html(output_path)
        return output_path

    def export_timeline(self, project_id: int, format: str = 'json') -> Union[str, Dict]:
        """Export project timeline in various formats."""
        project = self.get_project(project_id)
        if not project:
            raise ValueError(f"Project with ID {project_id} not found")
        
        if format.lower() == 'json':
            return self._export_as_json(project)
        elif format.lower() == 'markdown':
            return self._export_as_markdown(project)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _export_as_json(self, project: Project) -> Dict:
        """Export project timeline as JSON."""
        return asdict(project)

    def _export_as_markdown(self, project: Project) -> str:
        """Export project timeline as markdown."""
        md = [
            f"# {project.name}",
            "",
            f"**Project Duration:** {project.start_date} to {project.end_date}",
            f"**Status:** {project.status.value}",
            "",
            "## Team",
            *[f"- {member}" for member in project.team],
            "",
            "## Milestones",
            *[f"### {m.title}\n- Date: {m.date}\n- Status: {m.status.value}\n"
              f"- Deliverables:\n  - " + "\n  - ".join(m.deliverables)
              for m in project.milestones],
            "",
            "## Tasks",
            *[f"### {t.title}\n- Duration: {t.start_date} to {t.end_date}\n"
              f"- Assignee: {t.assignee}\n- Status: {t.status.value}\n"
              f"- Priority: {t.priority.value}\n- Progress: {t.progress*100}%"
              for t in project.tasks]
        ]
        return "\n".join(md)

def main():
    """Example usage of the ProjectTimelineManager."""
    manager = ProjectTimelineManager()
    
    # Example project creation
    tasks = [
        Task(
            title="Requirements Gathering",
            start_date="2024-12-08",
            end_date="2024-12-15",
            assignee="john@example.com",
            description="Gather and document project requirements",
            status=TaskStatus.NOT_STARTED,
            priority=Priority.HIGH
        ),
        Task(
            title="Design Phase",
            start_date="2024-12-16",
            end_date="2024-12-30",
            assignee="jane@example.com",
            description="Create system design documents",
            status=TaskStatus.NOT_STARTED,
            priority=Priority.HIGH,
            dependencies=["Requirements Gathering"]
        )
    ]
    
    milestones = [
        Milestone(
            title="Project Kickoff",
            date="2024-12-08",
            description="Official project start",
            deliverables=["Project Charter", "Initial Timeline"]
        ),
        Milestone(
            title="Design Review",
            date="2024-12-30",
            description="Review and approve design documents",
            deliverables=["Design Documents", "Technical Specifications"]
        )
    ]
    
    project = Project(
        name="New Feature Development",
        description="Develop new feature set for Q1 2024",
        start_date="2024-12-08",
        end_date="2024-12-30",
        tasks=tasks,
        milestones=milestones,
        team=["john@example.com", "jane@example.com"]
    )
    
    # Create project
    project_id = manager.create_project(project)
    logging.info(f"Created project with ID: {project_id}")
    
    # Generate Gantt chart
    chart_path = manager.generate_gantt_chart(project_id)
    logging.info(f"Generated Gantt chart at: {chart_path}")
    
    # Export timeline
    print("\nProject Timeline (Markdown):")
    print(manager.export_timeline(project_id, 'markdown'))

if __name__ == "__main__":
    main()
