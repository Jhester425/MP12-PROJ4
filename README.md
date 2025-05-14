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
  - OpenStreetMap (Nominatim).
- **Other Resources**: Geographical data for CCAA/Provinces/Cities (from GitHub raw JSON).

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
