#!/bin/bash

# Replace 'input.csv' with the actual name of your CSV file
CSV_FILE="input.csv"

# Function to process each line from the CSV
process_line() {
    local username="$1"
    local result=$(curl -s "http://localhost:8081/$username")
    echo "$result" | grep -oE '[0-9]+'
}

# Set maximum number of parallel processes
MAX_PARALLEL=4

# Read CSV file line by line and process in parallel
while IFS=',' read -r _ username _; do
    username=${username//\"/}
    process_line "$username" &
    if [[ $(jobs | wc -l) -ge $MAX_PARALLEL ]]; then
        wait -n || true
    fi
done < "$CSV_FILE"

# Wait for remaining background processes to finish
wait
