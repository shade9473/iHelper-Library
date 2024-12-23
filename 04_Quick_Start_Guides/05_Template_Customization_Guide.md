# Template Customization Guide

Learn how to customize and extend iHelper's core templates to match your specific needs. This guide covers configuration options, extension points, and best practices for all our template types.

## Table of Contents
1. [General Principles](#general-principles)
2. [Email Response Templates](#email-response-templates)
3. [File Organization Templates](#file-organization-templates)
4. [Task Scheduler Templates](#task-scheduler-templates)
5. [Meeting Notes Templates](#meeting-notes-templates)
6. [Project Timeline Templates](#project-timeline-templates)
7. [Advanced Customization](#advanced-customization)

## General Principles

### Configuration Structure
All templates follow a consistent configuration pattern:
```json
{
    "core_settings": {},
    "customization": {},
    "integrations": {},
    "notifications": {}
}
```

### Best Practices
1. Always backup configurations before modifying
2. Test changes in a development environment
3. Document custom modifications
4. Use version control for tracking changes

## Email Response Templates

### Basic Configuration
Edit `email_config.json`:
```json
{
    "templates": {
        "custom_template": {
            "subject": "RE: {original_subject}",
            "body": "Dear {recipient},\n\n{custom_message}\n\nBest regards,\n{sender}",
            "variables": ["recipient", "custom_message", "sender"]
        }
    },
    "rules": {
        "custom_template": [
            "keyword1",
            "keyword2"
        ]
    }
}
```

### Advanced Features
1. **Custom Variables**
```json
{
    "custom_variables": {
        "company_name": "Your Company",
        "support_hours": "9 AM - 5 PM EST",
        "signature_template": "Best regards,\n{name}\n{position}"
    }
}
```

2. **Response Rules**
```python
def custom_rule(email_content: str) -> bool:
    """Custom rule for email classification."""
    keywords = ["urgent", "priority", "asap"]
    return any(keyword in email_content.lower() for keyword in keywords)
```

## File Organization Templates

### Directory Rules
Customize `file_organizer_config.json`:
```json
{
    "rules": {
        "custom_category": [".custom", ".specific"],
        "work_documents": [".doc", ".docx", ".pdf"]
    },
    "target_dirs": {
        "custom_category": "Custom Files",
        "work_documents": "Work/Documents"
    }
}
```

### Advanced Organization
```json
{
    "organization_rules": {
        "date_based": {
            "enabled": true,
            "format": "YYYY/MM",
            "apply_to": ["documents", "images"]
        },
        "project_based": {
            "enabled": true,
            "project_folders": ["Project-A", "Project-B"],
            "subfolder_template": "{project}/{'docs'|'src'|'resources'}"
        }
    }
}
```

## Task Scheduler Templates

### Custom Task Types
Update `task_scheduler_config.json`:
```json
{
    "task_types": {
        "custom_task": {
            "fields": ["priority", "deadline", "assignee"],
            "required_fields": ["priority", "deadline"],
            "default_duration": 60,
            "notifications": {
                "reminder_before": 24,
                "escalation_after": 48
            }
        }
    }
}
```

### Workflow Integration
```json
{
    "workflows": {
        "custom_workflow": {
            "steps": [
                {
                    "type": "task",
                    "template": "custom_task",
                    "auto_assign": true
                },
                {
                    "type": "notification",
                    "template": "status_update"
                }
            ]
        }
    }
}
```

## Meeting Notes Templates

### Custom Meeting Types
Modify `meeting_notes_config.json`:
```json
{
    "meeting_types": {
        "custom_meeting": {
            "template": "custom_meeting_template.md",
            "required_sections": [
                "agenda",
                "decisions",
                "action_items"
            ],
            "optional_sections": [
                "notes",
                "follow_up"
            ]
        }
    }
}
```

### Template Variables
```json
{
    "template_variables": {
        "company": {
            "name": "Your Company",
            "department": "Your Department"
        },
        "branding": {
            "logo_path": "/path/to/logo",
            "color_scheme": {
                "primary": "#FF0000",
                "secondary": "#00FF00"
            }
        }
    }
}
```

## Project Timeline Templates

### Custom Project Types
Edit `project_timeline_config.json`:
```json
{
    "project_types": {
        "custom_project": {
            "phases": [
                "Planning",
                "Execution",
                "Review"
            ],
            "milestones": [
                {
                    "name": "Project Start",
                    "required_deliverables": ["charter", "timeline"]
                },
                {
                    "name": "Mid-Point Review",
                    "required_deliverables": ["progress_report"]
                }
            ],
            "default_duration": 90
        }
    }
}
```

### Visualization Settings
```json
{
    "visualization": {
        "custom_theme": {
            "colors": {
                "milestone": "#FF0000",
                "task": "#00FF00",
                "dependency": "#0000FF"
            },
            "styles": {
                "milestone_shape": "diamond",
                "task_height": 30,
                "dependency_style": "dashed"
            }
        }
    }
}
```

## Advanced Customization

### 1. Custom Scripts
Create script extensions in `/custom_scripts`:
```python
# custom_task_handler.py
class CustomTaskHandler:
    def __init__(self, config):
        self.config = config
    
    def process_task(self, task):
        # Custom task processing logic
        pass
```

### 2. Template Functions
Add custom template functions:
```python
def custom_formatter(text: str, **kwargs) -> str:
    """Custom text formatting function."""
    # Add your formatting logic
    return formatted_text

def custom_validator(data: dict, template: str) -> bool:
    """Custom data validation for templates."""
    # Add your validation logic
    return is_valid
```

### 3. Integration Hooks
Create custom integration points:
```python
class CustomIntegration:
    def pre_process(self, data):
        # Pre-processing hook
        pass
    
    def post_process(self, result):
        # Post-processing hook
        pass
```

## Best Practices

### 1. Configuration Management
- Use environment variables for sensitive data
- Implement configuration validation
- Create configuration backups
- Document all customizations

### 2. Error Handling
```python
def safe_config_update(config_path: str, updates: dict):
    """Safely update configuration files."""
    try:
        # Create backup
        backup_path = f"{config_path}.bak"
        shutil.copy2(config_path, backup_path)
        
        # Update configuration
        with open(config_path, 'r+') as f:
            current_config = json.load(f)
            updated_config = deep_update(current_config, updates)
            f.seek(0)
            json.dump(updated_config, f, indent=4)
            f.truncate()
            
    except Exception as e:
        # Restore from backup
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, config_path)
        raise ConfigurationError(f"Failed to update configuration: {str(e)}")
```

### 3. Testing
- Create test cases for custom functions
- Validate templates with sample data
- Test integration points
- Verify error handling

## Common Customization Scenarios

### 1. Adding New Template Types
1. Create template configuration
2. Define template structure
3. Implement processing logic
4. Add validation rules

### 2. Extending Existing Templates
1. Copy original template
2. Add custom fields
3. Update processing logic
4. Test compatibility

### 3. Custom Integrations
1. Define integration points
2. Implement handlers
3. Add configuration options
4. Test end-to-end flow

## Resources
- Template Reference: `/docs/templates/`
- Example Customizations: `/examples/custom/`
- API Documentation: `/docs/api/`
- Support: [support channel]

Remember: While customization provides flexibility, maintain compatibility with core functionality. Document all changes and test thoroughly before deploying to production.
