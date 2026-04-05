# Create virtual environment
python -m venv myenv

# Activate it
.\myenv\Scripts\Activate

# Upgrade pip
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt

Write-Host "✅ Setup complete!"