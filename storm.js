// Add to the showSection function
case 'hurricane':
    loadHurricaneData();
    break;

// Add this new function
async function loadHurricaneData() {
    console.log("Loading hurricane data...");
    try {
        // For demo purposes - in a real implementation you would use a hurricane API
        const demoStorms = [
            {
                name: "Tropical Storm Alex",
                category: "Tropical Storm",
                location: "200 miles NE of Barbados",
                winds: "50 mph",
                movement: "NW at 15 mph",
                pressure: "1002 mb"
            },
            {
                name: "Invest 92L",
                category: "Potential Tropical Cyclone",
                location: "Eastern Atlantic",
                winds: "35 mph",
                movement: "W at 10 mph",
                pressure: "1008 mb"
            }
        ];
        
        // Display active storms
        const stormsContainer = document.getElementById('active-storms');
        stormsContainer.innerHTML = demoStorms.map(storm => `
            <div class="storm-card">
                <div class="storm-name">${storm.name} - ${storm.category}div>
                <div class="storm-details">
                    <p><strong>Location:strong> ${storm.location}p>
                    <p><strong>Max Winds:strong> ${storm.winds}p>
                    <p><strong>Movement:strong> ${storm.movement}p>
                    <p><strong>Pressure:strong> ${storm.pressure}p>
                div>
            div>
        `).join('');
        
    } catch (error) {
        console.error("Error loading hurricane data:", error);
        document.getElementById('active-storms').innerHTML = 
            '<p>Unable to load current storm data. Please check back later.p>';
    }
}