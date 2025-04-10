/**
 * Scrapes events from caribbeanevents.com
 * @param {string} baseUrl - The base URL of the site
 * @returns {Promise<Array>} - Array of event objects
 */
async function scrapeCaribbeanEvents(baseUrl = 'https://caribbeanevents.com') {
    console.log("Scraping Caribbean Events...");
    try {
        const proxyUrl = "https://api.allorigins.win/get?url=";
        const encodedUrl = encodeURIComponent(`${baseUrl}/event/`);
        const response = await fetch(`${proxyUrl}${encodedUrl}`);
        
        if (!response.ok) throw new Error("Failed to fetch Caribbean Events");
        
        const data = await response.json();
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data.contents, "text/html");
        
        const events = [];
        const eventElements = htmlDoc.querySelectorAll('.event-card');
        
        for (let i = 0; i < Math.min(eventElements.length, 5); i++) {
            const event = eventElements[i];
            const titleElement = event.querySelector('.event-title a');
            const dateElement = event.querySelector('.event-date');
            const locationElement = event.querySelector('.event-location');
            const descriptionElement = event.querySelector('.event-excerpt');
            const imageElement = event.querySelector('.event-image img');
            const ticketLinkElement = event.querySelector('.event-tickets a');
            
            if (titleElement) {
                const title = titleElement.textContent.trim();
                const url = `${baseUrl}${titleElement.getAttribute('href')}`;
                const dateText = dateElement ? dateElement.textContent.trim() : '';
                const location = locationElement ? locationElement.textContent.trim() : 'Caribbean';
                const description = descriptionElement ? descriptionElement.textContent.trim() : '';
                const imageUrl = imageElement ? imageElement.getAttribute('src') : `${baseUrl}/wp-content/uploads/2021/01/caribbean-events-logo.png`;
                const ticketUrl = ticketLinkElement ? ticketLinkElement.getAttribute('href') : '';
                
                // Parse date (adjust based on actual date format)
                let eventDate = new Date();
                if (dateText) {
                    const dateMatch = dateText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                    if (dateMatch) {
                        eventDate = new Date(`${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`);
                    }
                }
                
                events.push({
                    title,
                    url,
                    source: 'Caribbean Events',
                    date: eventDate.toISOString(),
                    description,
                    location,
                    imageUrl: imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`,
                    ticketUrl,
                    type: 'event'
                });
            }
        }
        
        return events;
    } catch (error) {
        console.error("Error scraping Caribbean Events:", error);
        return [];
    }
}

export default scrapeCaribbeanEvents;
