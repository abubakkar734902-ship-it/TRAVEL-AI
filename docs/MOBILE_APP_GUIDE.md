# TravelAI Mobile App - Developer Guide

## 📱 Overview

TravelAI Mobile is a production-ready React Native/Expo application for the travel planning platform. It provides a seamless mobile experience for discovering destinations, planning trips, booking accommodations, and renting bikes/cars.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (for development)
- Android: Android Studio (for development)
- Expo Go app (for testing)

### Installation

```bash
cd mobile
npm install

# or with yarn
yarn install
```

### Running the App

```bash
# Start development server
npm start
# or
expo start

# Run on iOS simulator
npm run ios
# or
expo start --ios

# Run on Android emulator
npm run android
# or
expo start --android

# Run on web
npm run web
# or
expo start --web
```

## 📂 Project Structure

```
mobile/
├── App.js                          # Main entry point
├── app.json                        # Expo configuration
├── eas.json                        # EAS Build configuration
├── package.json                    # Dependencies
│
├── src/
│   ├── navigation/
│   │   └── Navigation.js          # Navigation stack setup
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── home/
│   │   │   └── HomeScreen.js      # Discover destinations
│   │   ├── search/
│   │   │   └── SearchScreen.js
│   │   ├── destinations/
│   │   │   └── DestinationDetailScreen.js
│   │   ├── planner/
│   │   │   └── PlannerScreen.js
│   │   ├── itinerary/
│   │   │   └── ItineraryScreen.js
│   │   ├── trips/
│   │   │   └── TripsScreen.js
│   │   ├── accommodations/
│   │   │   └── HotelsScreen.js
│   │   ├── rentals/
│   │   │   ├── BikeRentalScreen.js
│   │   │   └── CarRentalScreen.js
│   │   ├── bookings/
│   │   │   └── BookingDetailScreen.js
│   │   ├── payments/
│   │   │   └── PaymentScreen.js
│   │   ├── safety/
│   │   │   └── SafetyScreen.js
│   │   └── profile/
│   │       └── ProfileScreen.js
│   │
│   ├── store/
│   │   └── store.js               # Zustand state management
│   │
│   ├── services/
│   │   ├── api.js                 # API client
│   │   ├── notificationService.js # Notifications
│   │   ├── locationService.js     # Location tracking
│   │   └── paymentService.js      # Payment integration
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.js
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   └── Loader.js
│   │   ├── hotel/
│   │   │   └── HotelCard.js
│   │   ├── bike/
│   │   │   └── BikeCard.js
│   │   ├── car/
│   │   │   └── CarCard.js
│   │   └── payment/
│   │       ├── StripePayment.js
│   │       └── PayPalPayment.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useLocation.js
│   │   ├── useNotifications.js
│   │   └── usePayment.js
│   │
│   └── utils/
│       ├── validators.js          # Form validation
│       ├── formatters.js          # Data formatting
│       ├── constants.js           # App constants
│       └── permissions.js         # Permission helpers
│
├── assets/
│   ├── fonts/
│   ├── images/
│   └── icons/
│
└── __tests__/
    ├── screens/
    ├── components/
    ├── services/
    └── utils/
```

## 🎯 Key Features

### 1. Authentication
- Email/password login
- Social login (Google, Facebook)
- Email verification
- Secure token storage

### 2. Destination Discovery
- Browse popular destinations
- Search with filters
- View trending places
- Get personalized recommendations
- Real-time safety alerts

### 3. Trip Planning
- Create and manage trips
- AI-powered itinerary optimization
- Activity recommendations
- Budget tracking
- Collaborative trip planning

### 4. Accommodations
- Search hotels and accommodations
- Filter by amenities, price, rating
- View room details and photos
- Book directly in app
- Cancel bookings

### 5. Rentals
- Bike rental availability
- Car rental options
- Real-time availability check
- Insurance options
- Pickup/dropoff locations

### 6. Payments
- Stripe integration for cards
- PayPal integration
- Secure payment processing
- Receipt management
- Refund handling

### 7. Real-time Features
- Live notifications
- WebSocket connections
- Push notifications
- Offline support

### 8. User Profile
- Profile management
- Saved destinations
- Booking history
- Reviews and ratings
- Travel preferences

## 🔗 API Integration

All API calls use the centralized `api.js` service:

```javascript
import api from '../services/api';

// Login
const response = await api.login(email, password);

// Get destinations
const destinations = await api.getDestinations(filters);

// Book hotel
const booking = await api.bookHotel(hotelId, roomId, bookingData);
```

## 🎨 Styling

The app uses React Native StyleSheet for styling. Key design system:

- **Primary Color**: #FF6B35 (Orange)
- **Secondary Color**: #004E89 (Blue)
- **Background**: #f8f9fa (Light Gray)
- **Text**: #000 (Black), #666 (Gray)
- **Font Family**: Montserrat

## 📦 State Management

Uses Zustand for state management with the following stores:

```javascript
// User store
const { user, login, logout } = useUser();

// Trips store
const { trips, createTrip, deleteTrip } = useTrips();

// Destinations store
const { destinations, searchDestinations } = useDestinations();

// Bookings store
const { bookings, cancelBooking } = useBookings();

// Recommendations store
const { recommendations, rateRecommendation } = useRecommendations();

// Notifications store
const { notifications, markAsRead } = useNotifications();
```

## 🔐 Security

- JWT tokens stored in secure storage
- HTTPS only API communication
- Automatic token refresh
- Sensitive data encrypted
- Permission-based access

## 📍 Location Services

The app uses:
- **expo-location** for GPS tracking
- **react-native-maps** for map display
- Mapbox integration for advanced mapping

```javascript
import { useLocation } from '../hooks/useLocation';

const { location, getLocation } = useLocation();
```

## 📲 Push Notifications

Integrated with:
- Expo Notifications
- Firebase Cloud Messaging

```javascript
import { useNotifications } from '../hooks/useNotifications';

const { registerForNotifications } = useNotifications();
```

## 💳 Payment Processing

### Stripe Integration
```javascript
const { createPaymentIntent, confirmPayment } = usePayment();

const intent = await createPaymentIntent(amount, 'hotel', bookingId);
const result = await confirmPayment(intent.id, paymentMethodId);
```

### PayPal Integration
```javascript
const order = await api.createPayPalOrder(amount, description);
const result = await api.capturePayPalOrder(order.id);
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Example Test
```javascript
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
    it('should render destinations', () => {
        render(<HomeScreen />);
        expect(screen.getByText(/Popular Destinations/i)).toBeTruthy();
    });
});
```

## 🌐 Offline Support

The app supports offline functionality with:
- AsyncStorage for persistent data
- Service Worker caching
- Sync queue for delayed actions

## 📈 Performance Optimization

- Lazy loading of screens
- Memoization of components
- Image optimization
- Virtual scrolling for long lists
- Efficient state updates

## 🚀 Building for Production

### EAS Build

```bash
# Build for iOS
npm run build:ios
# or
eas build --platform ios

# Build for Android
npm run build:android
# or
eas build --platform android
```

### App Store Submission
```bash
npm run submit
```

## 🔄 Deployment

### Environment Configuration

Create `.env` file:
```
REACT_APP_API_URL=https://api.travelai.com
REACT_APP_SOCKET_URL=https://api.travelai.com
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
PAYPAL_CLIENT_ID=xxx
```

### Release Channels
```bash
# Create release channel
eas channel create production

# Build for specific channel
eas build --platform ios --channel production
```

## 📚 Dependencies

Key dependencies:
- **react-native**: Core framework
- **expo**: Development platform
- **react-navigation**: Screen navigation
- **zustand**: State management
- **axios**: HTTP client
- **socket.io-client**: Real-time communication
- **react-hook-form**: Form validation
- **react-native-maps**: Mapping
- **expo-notifications**: Push notifications

## 🐛 Debugging

### Debug Logs
```javascript
import { DEBUG } from '../utils/constants';

if (DEBUG) {
    console.log('Debug info');
}
```

### Redux DevTools
Use Zustand DevTools extension for state inspection.

### Network Debugging
Use Flipper for network inspection and logs.

## 📖 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Stripe React Native](https://stripe.com/docs/stripe-js/react)
- [PayPal Documentation](https://developer.paypal.com/)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/name`
4. Submit pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and feature requests, contact the development team or open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: September 2, 2026
