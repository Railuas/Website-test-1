import scrapeCaribbeanEvents from './caribbean-events-scraper.js';
import scrapeStKittsMusicFestival from './stkitts-music-festival-scraper.js';

/**
 * Main function to load all events
 * @returns {Promise<Array>} - Combined array of all events
 */
async function loadAllEvents() {
    try {
        const [caribbeanEvents, stKittsEvents] = await Promise.all([
            scrapeCaribbeanEvents(),
            scrapeStKittsMusicFestival()
        ]);
        
        // Combine and sort by date
        const allEvents = [...caribbeanEvents, ...stKittsEvents]
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return allEvents;
    } catch (error) {
        console.error("Error loading events:", error);
        return [];
    }
}

export default {
    scrapeCaribbeanEvents,
    scrapeStKittsMusicFestival,
    loadAllEvents
};
