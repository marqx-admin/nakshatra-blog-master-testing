import requests

def fetch_and_process_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()
        
        print("--- Successfully Fetched Data ---")
        
        # Example processing: If the data is a list of users, print some details.
        if isinstance(data, list) and len(data) > 0 and 'title' in data[0]:
            print(f"Successfully fetched a list containing {len(data)} items.")
            # Display title and email of the first three items as an example
            for i, item in enumerate(data[:3]):
                try:
                    print(f"{i+1}. Title: {item.get('title', 'N/A')}, Email: {item.get('email', 'N/A')}")
                except AttributeError:
                     print("Item structure unexpected.")
        elif isinstance(data, dict) and 'id' in data and 'message' in data:
             print("Successfully fetched a single resource object.")
             print(f"ID: {data.get('id')}, Message Preview: {data.get('message', '')[:50]}...")
        else:
            print("Data structure is complex or not recognized for specific processing examples. Printing first 3 keys of the main object:")
            keys = list(data.keys())[:3]
            for key in keys:
                print(f"  - {key}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from {url}: {e}")
        return False

if __name__ == "__main__":
    # Using JSONPlaceholder /users endpoint for demonstration of fetching a list.
    API_URL = "https://jsonplaceholder.typicode.com/users"
    fetch_and_process_data(API_URL)

