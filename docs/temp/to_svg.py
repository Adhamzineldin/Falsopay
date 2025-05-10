import os
import subprocess

# Function to run PlantUML on each diagram individually
def run_plantuml(jar_file, diagrams_file, output_dir):
    # Read the paths from the provided .txt file
    with open(diagrams_file, 'r') as file:
        diagram_paths = file.readlines()

    # Transform the paths to absolute paths (remove extra spaces and newlines)
    diagram_paths = [os.path.abspath(path.strip()) for path in diagram_paths]

    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Loop through each diagram file and run PlantUML individually
    for diagram_path in diagram_paths:
        # Check if the file exists before attempting to process it
        if os.path.isfile(diagram_path):
            print(f"Processing diagram: {diagram_path}")

            # Prepare the command to run PlantUML for the current diagram
            command = ['java', '-jar', jar_file, '-v', '-tsvg', '-o', output_dir, diagram_path]

            # Debugging: Print the command being executed
            print(f"Running command: {' '.join(command)}")

            # Execute the command for the current diagram
            try:
                subprocess.run(command, check=True)
                print(f"Successfully generated SVG for {diagram_path}")
            except subprocess.CalledProcessError as e:
                print(f"An error occurred while processing {diagram_path}: {e}")
        else:
            print(f"Warning: {diagram_path} is not a valid file.")

# Set the paths (change these paths to your environment)
jar_file = 'plantuml.jar'  # Specify the path to your PlantUML jar
diagrams_file = 'diagrams.txt'  # Path to your diagrams.txt file
output_dir = 'svg-output'  # Output directory for generated SVG files

# Run the function
run_plantuml(jar_file, diagrams_file, output_dir)
