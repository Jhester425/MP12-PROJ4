# 🌍 Go Activity - Discover Spain

An interactive web application to discover, explore, and share points of interest across Spain. Users can search for cities, view descriptions, nearby activities, and manually add new places.

---

## 🚀 Features

1. **Discover**:  
   Dynamically select Autonomous Communities (CCAA), provinces, and cities in Spain. Displays location, Wikipedia description, and nearby places using Geoapify.

2. **Explore**:  
   View places previously added by users from a MySQL database.

3. **Share**:  
   A form allowing users to manually add new points of interest.

---

## 🏛️ Application Architecture

- **Frontend**: HTML, CSS, Vanilla JavaScript.
- **Backend**: Node.js with Express.
- **Database**: MySQL.
- **External APIs**:
  - Wikipedia REST API. ´https://en.wikipedia.org/api/rest_v1/´
  - Geoapify Places API. ´https://www.geoapify.com/´
  - OpenStreetMap (Nominatim). https://nominatim.openstreetmap.org/ui/search.html´
- **Other Resources**: Geographical data for CCAA/Provinces/Cities (from GitHub raw JSON).

---

## 🔧 Detalles de Código

### **Frontend (HTML, CSS, Vanilla JavaScript)**

- **HTML**:  
  The structure of the application is composed of HTML5 elements, which provides semantic meaning to the content (like `header`, `main`, `footer`, etc.). Dynamic content is added to the DOM based on user interaction, such as when searching for a city or interacting with the map.

- **CSS**:  
  The application uses custom CSS for styling, ensuring the app is responsive across various devices. Media queries are employed to adjust layout elements for different screen sizes. Map styling is particularly emphasized to ensure that the map takes the full available space on the screen.

- **Vanilla JavaScript**:  
  - **Fetching Data**: The `fetch()` function is used to interact with external APIs such as OpenStreetMap (Nominatim) and Geoapify. For example, to fetch place data from OpenStreetMap:
    ```javascript
    const fetchPlaceData = async (placeName) => {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName + ', España')}`);
      const data = await response.json();
      return data;
    };
    ```
  - **Dynamic Updates**: The JavaScript code dynamically updates the content on the page, including the map markers and the list of places, based on the API response data.

---

### **Backend (Node.js with Express)**

- **Node.js**:  
  The backend is powered by Node.js, which serves as the runtime environment for the application.

- **Express**:  
  Express.js is used for creating the backend routes, handling incoming requests, and interacting with the MySQL database. Express handles the logic for fetching, inserting, and querying places from the database.

---

## 🖧 Endpoints del Backend y Objetos Utilizados

### **Endpoints del Backend**:

1. **GET `/places`**:
   - **Description**: Retrieves a list of places from the MySQL database.
   - **Response**: A JSON array of places, each with details such as name, description, latitude, longitude, and address.

2. **POST `/places`**:
   - **Description**: Allows users to manually add a new place of interest to the database.
   - **Request Body**:
     ```json
     {
       "name": "Place Name",
       "description": "Place description",
       "latitude": 40.7128,
       "longitude": -74.0060,
       "address": "Full address"
     }
     ```

3. **GET `/place/:id`**:
   - **Description**: Retrieves a specific place from the database by its `id`.
   - **Response**: A JSON object containing the place details.

---

### **Objetos Utilizados (Objects Used)**:

1. **Place Object**:  
   The `Place` object represents a place of interest in the system. Each `Place` object has the following properties:
   ```javascript
   {
     name: 'Place Name',
     description: 'Place description',
     latitude: 40.7128,
     longitude: -74.0060,
     address: 'Full address',
   }
---

## 📊 UML and ER Diagrams

### 📐 UML Diagram (Simplified)

```plantuml
@startuml
actor User
User --> UI: Interacts with tabs

UI --> App: DOM Events
App --> Wikipedia API: Fetch description
App --> Geoapify API: Fetch nearby places
App --> MySQL: Insert/Query places

@enduml
