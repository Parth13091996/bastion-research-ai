# Add Search Bar to Premium Webinars, Webinars, and Podcasts

## Tasks
- [x] Add search functionality to PremiumWebinars.tsx
- [x] Add search functionality to WebinarsListPage.tsx
- [x] Add search functionality to PodcastsListPage.tsx

## Implementation Details
Each page needs:
- Import Search icon from lucide-react
- Add useState for searchQuery
- Add search input UI in header section
- Filter data array based on search term (by title)
- Reset pagination to page 1 when search changes
