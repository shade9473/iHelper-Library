import os
import shutil
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class FileOrganizer:
    """A flexible file organization system that helps maintain a clean workspace."""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_config(config_path)
        self.stats = {
            'files_moved': 0,
            'errors': [],
            'start_time': None,
            'end_time': None
        }

    def _load_config(self, config_path: Optional[str] = None) -> Dict:
        """Load configuration from file or use defaults."""
        default_config = {
            'rules': {
                'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
                'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
                'audio': ['.mp3', '.wav', '.flac', '.m4a'],
                'video': ['.mp4', '.avi', '.mkv', '.mov'],
                'archives': ['.zip', '.rar', '.7z', '.tar.gz'],
                'code': ['.py', '.js', '.html', '.css', '.java']
            },
            'target_dirs': {
                'documents': 'Documents',
                'images': 'Images',
                'audio': 'Audio',
                'video': 'Video',
                'archives': 'Archives',
                'code': 'Code',
                'other': 'Other'
            },
            'options': {
                'create_date_subfolders': True,
                'skip_hidden_files': True,
                'backup_existing': True,
                'min_file_size': 0,  # in bytes
                'max_file_size': None  # in bytes
            }
        }

        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                return {**default_config, **user_config}
        return default_config

    def organize_directory(self, source_dir: str, target_base_dir: str) -> Dict:
        """
        Organize files in the source directory according to configuration rules.
        
        Args:
            source_dir: Directory containing files to organize
            target_base_dir: Base directory where organized folders will be created
        
        Returns:
            Dict containing statistics about the organization process
        """
        self.stats['start_time'] = datetime.now()
        source_path = Path(source_dir)
        target_base_path = Path(target_base_dir)

        # Create target directories if they don't exist
        for dir_name in self.config['target_dirs'].values():
            target_dir = target_base_path / dir_name
            target_dir.mkdir(parents=True, exist_ok=True)

        # Process each file in the source directory
        for file_path in source_path.rglob('*'):
            if not file_path.is_file():
                continue

            if self._should_skip_file(file_path):
                continue

            try:
                self._process_file(file_path, target_base_path)
            except Exception as e:
                self.stats['errors'].append(f"Error processing {file_path}: {str(e)}")

        self.stats['end_time'] = datetime.now()
        return self.stats

    def _should_skip_file(self, file_path: Path) -> bool:
        """Determine if a file should be skipped based on configuration rules."""
        if self.config['options']['skip_hidden_files'] and file_path.name.startswith('.'):
            return True

        file_size = file_path.stat().st_size
        min_size = self.config['options']['min_file_size']
        max_size = self.config['options']['max_file_size']

        if min_size and file_size < min_size:
            return True
        if max_size and file_size > max_size:
            return True

        return False

    def _process_file(self, file_path: Path, target_base_path: Path):
        """Process a single file according to organization rules."""
        file_category = self._get_file_category(file_path)
        target_dir = target_base_path / self.config['target_dirs'][file_category]

        if self.config['options']['create_date_subfolders']:
            file_date = datetime.fromtimestamp(file_path.stat().st_mtime)
            target_dir = target_dir / f"{file_date.year}-{file_date.month:02d}"

        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / file_path.name

        if target_path.exists() and self.config['options']['backup_existing']:
            backup_path = self._create_backup_path(target_path)
            shutil.move(str(target_path), str(backup_path))

        shutil.move(str(file_path), str(target_path))
        self.stats['files_moved'] += 1

    def _get_file_category(self, file_path: Path) -> str:
        """Determine the category of a file based on its extension."""
        extension = ''.join(file_path.suffixes).lower()
        
        for category, extensions in self.config['rules'].items():
            if extension in extensions:
                return category
        return 'other'

    def _create_backup_path(self, file_path: Path) -> Path:
        """Create a unique backup path for a file."""
        counter = 1
        while True:
            backup_path = file_path.parent / f"{file_path.stem}_backup{counter}{file_path.suffix}"
            if not backup_path.exists():
                return backup_path
            counter += 1

    def generate_report(self) -> str:
        """Generate a summary report of the organization process."""
        if not self.stats['start_time'] or not self.stats['end_time']:
            return "No organization process has been run yet."

        duration = self.stats['end_time'] - self.stats['start_time']
        
        report = [
            "File Organization Report",
            "=====================",
            f"Start Time: {self.stats['start_time']}",
            f"End Time: {self.stats['end_time']}",
            f"Duration: {duration}",
            f"Files Moved: {self.stats['files_moved']}",
            "",
            "Errors:" if self.stats['errors'] else "No errors occurred.",
        ]
        
        for error in self.stats['errors']:
            report.append(f"- {error}")
            
        return '\n'.join(report)


def main():
    """Example usage of the FileOrganizer class."""
    # Create an organizer instance
    organizer = FileOrganizer()
    
    # Get source and target directories from user
    source_dir = input("Enter the source directory path: ")
    target_dir = input("Enter the target directory path: ")
    
    # Organize files
    stats = organizer.organize_directory(source_dir, target_dir)
    
    # Print report
    print("\n" + organizer.generate_report())


if __name__ == "__main__":
    main()
