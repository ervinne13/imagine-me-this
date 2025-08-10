import os

# Path to the workflow JSON and a sample output image (for now, hardcoded)
WORKFLOW_PATH = os.getenv('WORKFLOW_JSON_PATH', './stable_diffusion/imt-workflow-v0.0.1.json')
SAMPLE_OUTPUT_IMAGE = os.path.join(os.path.dirname(__file__), '../../uploads/20250810154710-upscaled.jpg')

class PromptError(Exception):
    def __init__(self, message, code=400):
        super().__init__(message)
        self.code = code

def send_prompt():
    if not os.path.exists(WORKFLOW_PATH):
        raise PromptError('Workflow JSON not found', 404)
    if not os.path.exists(SAMPLE_OUTPUT_IMAGE):
        raise PromptError('Sample output image not found', 404)
    with open(WORKFLOW_PATH, 'r') as f:
        workflow_json = f.read()
    return {
        'workflow': workflow_json,
        'image_path': SAMPLE_OUTPUT_IMAGE
    }
