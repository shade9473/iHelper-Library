# Your First Automation: Email Response System

Welcome to your first iHelper automation! In this tutorial, we'll implement the Email Response Automation system, a practical example that will save you hours of repetitive email work.

## What You'll Learn
- How to set up an automation
- How to customize templates
- How to test and deploy
- Best practices for automation

## Prerequisites
- Completed "Getting Started with iHelper" guide
- Python 3.8+ installed
- Basic understanding of JSON
- Access to an email account

## Step-by-Step Guide

### 1. Setup (5 minutes)

```bash
# Navigate to the Workflow Automation directory
cd 09_Workflow_Automation

# Create necessary directories
mkdir -p config responses logs
```

### 2. Understanding the Components (10 minutes)

Our email automation system consists of three main parts:
1. `email_response_automation.py` - The main automation script
2. `config/email_config.json` - Configuration and templates
3. `responses/` - Directory for saved responses

### 3. Customizing Your Templates (15 minutes)

#### A. Open `config/email_config.json`
```json
{
    "templates": {
        "login_support": "Dear {name},\n\nThank you for reaching out..."
    }
}
```

#### B. Add Your Own Template
1. Choose a category (e.g., "meeting_schedule")
2. Write your template
3. Add classification rules

Example:
```json
{
    "templates": {
        "meeting_schedule": "Dear {name},\n\nI'd love to schedule a meeting to discuss {topic}.\n\nHow about {proposed_time}?\n\nBest regards,\n{your_name}"
    },
    "rules": {
        "meeting_schedule": [
            "schedule meeting",
            "meet up",
            "appointment"
        ]
    }
}
```

### 4. Implementation (20 minutes)

#### A. Basic Usage
```python
from email_response_automation import EmailResponseAutomation

# Initialize the system
automation = EmailResponseAutomation()

# Define your variables
variables = {
    'name': 'John',
    'topic': 'project planning',
    'proposed_time': 'Tuesday at 2 PM',
    'your_name': 'Alice'
}

# Process an email
response = automation.process_email(
    "Can we schedule a meeting to discuss the project?",
    variables
)
```

#### B. Add Error Handling
```python
try:
    response = automation.process_email(email_content, variables)
    if response:
        print("Response generated successfully!")
    else:
        print("No appropriate template found.")
except Exception as e:
    print(f"Error: {str(e)}")
```

### 5. Testing Your Automation (15 minutes)

#### A. Create a Test Script
```python
# test_automation.py
from email_response_automation import EmailResponseAutomation

def test_templates():
    automation = EmailResponseAutomation()
    
    test_cases = [
        {
            'content': "Need to schedule a meeting",
            'variables': {
                'name': 'Test User',
                'topic': 'testing',
                'proposed_time': 'tomorrow',
                'your_name': 'Admin'
            }
        }
        # Add more test cases
    ]
    
    for test in test_cases:
        response = automation.process_email(
            test['content'],
            test['variables']
        )
        print(f"Test Response:\n{response}\n")

if __name__ == '__main__':
    test_templates()
```

### 6. Integration (20 minutes)

#### A. Email Integration
```python
import smtplib
from email.mime.text import MIMEText

def send_email(response, to_address):
    # Configure your email settings
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = "your-email@example.com"
    
    # Create message
    msg = MIMEText(response)
    msg['Subject'] = "Automated Response"
    msg['From'] = sender_email
    msg['To'] = to_address
    
    # Send email
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(sender_email, "your-password")
        server.send_message(msg)
```

### 7. Best Practices

1. **Template Management**
   - Keep templates simple and clear
   - Use consistent variable names
   - Document all templates

2. **Testing**
   - Test with various inputs
   - Verify response formatting
   - Check error handling

3. **Maintenance**
   - Regular template updates
   - Monitor response quality
   - Gather user feedback

## Common Issues and Solutions

### Issue 1: Template Not Found
```python
# Add a fallback template
if template_name not in self.templates:
    return self.templates['default']
```

### Issue 2: Missing Variables
```python
# Add variable validation
for required_var in ['name', 'topic']:
    if required_var not in variables:
        raise ValueError(f"Missing required variable: {required_var}")
```

## Next Steps

1. **Customize Further**
   - Add more templates
   - Refine classification rules
   - Implement advanced features

2. **Scale Up**
   - Add more automation types
   - Integrate with other systems
   - Build response analytics

3. **Advanced Features**
   - AI-powered responses
   - Template learning
   - Response optimization

## Resources
- Full documentation: `/docs/automation`
- Template examples: `/examples/templates`
- Community templates: [template repository]
- Support: [support email]

## Troubleshooting

If you encounter issues:
1. Check the logs in `logs/`
2. Verify configuration
3. Test with simple templates first
4. Contact support if needed

Remember: Start simple, test thoroughly, and gradually add complexity as needed.
