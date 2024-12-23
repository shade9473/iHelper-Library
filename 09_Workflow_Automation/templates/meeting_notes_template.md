# {{ meeting.title }}

**Date:** {{ meeting.date }}  
**Type:** {{ meeting.meeting_type.value }}  
**Duration:** {{ meeting.duration }} minutes  
{% if meeting.location %}**Location:** {{ meeting.location }}{% endif %}

## Attendees
{% for attendee in meeting.attendees %}
- {{ attendee }}
{% endfor %}

## Agenda
{% for item in meeting.agenda %}
1. {{ item }}
{% endfor %}

## Discussion Points
{% for point in meeting.discussion_points %}
- {{ point }}
{% endfor %}

## Decisions Made
{% for decision in meeting.decisions %}
- {{ decision }}
{% endfor %}

## Action Items
{% for item in meeting.action_items %}
### {{ loop.index }}. {{ item.description }}
- **Assignee:** {{ item.assignee }}
- **Due Date:** {{ item.due_date }}
- **Priority:** {{ item.priority }}
- **Status:** {{ item.status }}
{% if item.notes %}
- **Notes:** {{ item.notes }}
{% endif %}
{% endfor %}

## Next Steps
{% for step in meeting.next_steps %}
- {{ step }}
{% endfor %}

{% if meeting.recording_link %}
## Recording
[Meeting Recording]({{ meeting.recording_link }})
{% endif %}

{% if meeting.attachments %}
## Attachments
{% for attachment in meeting.attachments %}
- [{{ attachment.split('/')[-1] }}]({{ attachment }})
{% endfor %}
{% endif %}

{% if meeting.notes %}
## Additional Notes
{{ meeting.notes }}
{% endif %}
