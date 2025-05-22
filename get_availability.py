import requests
import re
from icalendar import Calendar
from datetime import datetime, date, timedelta
import json
import time

# Replace with your actual Airbnb iCal URL
ICAL_URL = "https://www.airbnb.com/calendar/ical/1370710838980597687.ics?s=17efef269bb39b5480e3d0715e6c6b1c"
# File to store the availability data
AVAILABILITY_FILE = "availability.json"
# How often to update the data (in seconds - e.g., 3600 for once an hour)
UPDATE_INTERVAL = 3600

def fetch_ical_data(url):
    """Fetches the iCal data from the given URL."""
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
       
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching iCal data: {e}")
        return None

def parse_ical_data(ical_content):
    """Parses the iCal data and extracts booked dates."""
    booked_dates = set()
    if ical_content:
        try:
            calendar = Calendar.from_ical(ical_content)
            for event in calendar.walk('VEVENT'):
                if 'DTSTART' in event and 'DTEND' in event:
                    print(f"Processing event: {event.get('SUMMARY')}")
                    print(f"  Raw DTSTART: {event['DTSTART']}")
                    print(f"  Raw DTEND: {event['DTEND']}")

                    start_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', str(event['DTSTART']))
                    end_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', str(event['DTEND']))

                    if start_match and end_match:
                        start_year, start_month, start_day = map(int, start_match.groups())
                        end_year, end_month, end_day = map(int, end_match.groups())
                        print(f"  Extracted DTSTART: {start_year}-{start_month}-{start_day}")
                        print(f"  Extracted DTEND: {end_year}-{end_month}-{end_day}")
                        try:
                            start_date = date(start_year, start_month, start_day)
                            end_date = date(end_year, end_month, end_day)

                            current_date = start_date
                            while current_date < end_date:
                                print(f" Booked date: {current_date.isoformat()}")
                                booked_dates.add(current_date.isoformat())
                                current_date += timedelta(days=1)  # Use timedelta for safe increment
                                

                        except ValueError as e:
                            print(f"ValueError during date() creation in event '{event.get('SUMMARY')}': {e}")
                    else:
                        print(f"Warning: Could not find date strings for event '{event.get('SUMMARY')}'")

        except Exception as e:
            print(f"Error parsing iCal data: {e}")
    return list(booked_dates)

def save_availability_data(availability, filename):
    """Saves the availability data to a JSON file."""
    try:
        with open(filename, 'w') as f:
            json.dump({'booked_dates': availability, 'last_updated': datetime.now().isoformat()}, f)
        print(f"Availability data saved to {filename} at {datetime.now().isoformat()}")
    except IOError as e:
        print(f"Error saving availability data: {e}")

def main():
    """Main function to fetch, parse, and save availability data."""
    while True:
        print("Fetching and updating availability data...")
        ical_content = fetch_ical_data(ICAL_URL)
        if ical_content:
            booked_dates = parse_ical_data(ical_content)
            save_availability_data(booked_dates, AVAILABILITY_FILE)
        time.sleep(UPDATE_INTERVAL)

if __name__ == "__main__":
    main()