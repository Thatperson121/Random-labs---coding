import os
import sys
import json
import docker
import tempfile
from pathlib import Path
from typing import Dict, Any

class CodeExecutionService:
    def __init__(self):
        self.client = docker.from_env()
        self.container = None
        self.timeout = int(os.getenv('VITE_MAX_EXECUTION_TIME', 30000)) / 1000  # Convert to seconds

    def execute_code(self, code: str, language: str = 'python') -> Dict[str, Any]:
        """
        Execute code in a Docker container and return the results
        """
        try:
            # Create a temporary file for the code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name

            # Create and run the container
            self.container = self.client.containers.run(
                'collaborative-ide-executor:latest',
                command=f'python {temp_file}',
                volumes={
                    os.path.dirname(temp_file): {
                        'bind': '/app/code',
                        'mode': 'ro'
                    }
                },
                detach=True,
                mem_limit='512m',
                cpu_period=100000,
                cpu_quota=50000,
                network_disabled=True,
                remove=True
            )

            # Wait for the container to finish
            try:
                result = self.container.wait(timeout=self.timeout)
            except docker.errors.Timeout:
                self.container.kill()
                return {
                    'success': False,
                    'error': 'Execution timed out',
                    'output': ''
                }

            # Get the output
            output = self.container.logs().decode('utf-8')

            # Clean up
            self.container.remove()
            os.unlink(temp_file)

            return {
                'success': result['StatusCode'] == 0,
                'output': output,
                'error': '' if result['StatusCode'] == 0 else 'Execution failed'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'output': ''
            }

    def get_available_packages(self) -> Dict[str, Any]:
        """
        Get a list of pre-installed packages
        """
        try:
            # Run pip list in the container
            container = self.client.containers.run(
                'collaborative-ide-executor:latest',
                command='pip list --format=json',
                detach=True,
                remove=True
            )
            
            # Wait for the container to finish
            container.wait()
            
            # Get the output
            output = container.logs().decode('utf-8')
            packages = json.loads(output)
            
            # Clean up
            container.remove()
            
            return {
                'success': True,
                'packages': packages
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'packages': []
            }

if __name__ == '__main__':
    # Test the service
    service = CodeExecutionService()
    
    # Test code execution
    test_code = """
import pygame
import numpy as np
import pandas as pd

print("Testing pre-installed packages:")
print(f"Pygame version: {pygame.version.ver}")
print(f"Numpy version: {np.__version__}")
print(f"Pandas version: {pd.__version__}")
    """
    
    result = service.execute_code(test_code)
    print("Execution result:", result)
    
    # Test package listing
    packages = service.get_available_packages()
    print("Available packages:", packages) 