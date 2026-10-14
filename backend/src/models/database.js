// Database Models and Schema Definitions
// Compatible with PostgreSQL, MongoDB, and other databases
// Enhanced with Hotels, Places, Bike & Car Rentals

// User Model
export const UserModel = {
    name: 'User',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        email: { type: 'VARCHAR(255)', unique: true, notNull: true },
        password: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(100)', notNull: true },
        phone: { type: 'VARCHAR(20)' },
        avatar: { type: 'TEXT' },
        role: { type: 'VARCHAR(20)', default: "'user'" }, // user, admin, moderator
        
        // Verified info
        isEmailVerified: { type: 'BOOLEAN', default: false },
        isPhoneVerified: { type: 'BOOLEAN', default: false },
        emailVerificationToken: { type: 'VARCHAR(255)' },
        
        // Preferences
        preferences: {
            budgetMin: { type: 'INTEGER', default: 5000 },
            budgetMax: { type: 'INTEGER', default: 100000 },
            interests: { type: 'TEXT[]' },
            travelStyle: { type: 'VARCHAR(50)', default: "'adventure'" },
            groupSize: { type: 'INTEGER', default: 1 },
            notificationPreferences: { type: 'JSONB' },
            currency: { type: 'VARCHAR(3)', default: "'INR'" },
            language: { type: 'VARCHAR(10)', default: "'en'" }
        },
        
        // Address
        address: {
            street: { type: 'VARCHAR(255)' },
            city: { type: 'VARCHAR(100)' },
            state: { type: 'VARCHAR(100)' },
            zipCode: { type: 'VARCHAR(20)' },
            country: { type: 'VARCHAR(100)' }
        },
        
        // Loyalty
        loyaltyPoints: { type: 'INTEGER', default: 0 },
        membershipTier: { type: 'VARCHAR(50)', default: "'bronze'" }, // bronze, silver, gold, platinum
        
        // Social
        socialLinks: { type: 'JSONB' }, // Facebook, Twitter, Instagram
        emergencyContact: { type: 'VARCHAR(255)' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        lastLogin: { type: 'TIMESTAMP' },
        isActive: { type: 'BOOLEAN', default: true }
    },
    indexes: ['email', 'createdAt', 'membershipTier']
};

// Trip Model
export const TripModel = {
    name: 'Trip',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        destination: { type: 'VARCHAR(255)', notNull: true },
        startDate: { type: 'DATE', notNull: true },
        endDate: { type: 'DATE', notNull: true },
        budget: { type: 'DECIMAL(10,2)', notNull: true },
        interests: { type: 'TEXT[]' },
        travelers: { type: 'INTEGER', default: 1 },
        tripType: { type: 'VARCHAR(50)' }, // solo, couple, family, group
        status: { type: 'VARCHAR(50)', default: "'draft'" }, // draft, active, completed, cancelled
        
        // Optimization data
        optimizedItinerary: { type: 'JSONB' },
        optimizationMetrics: { type: 'JSONB' },
        
        // Risk assessment
        riskAssessment: { type: 'JSONB' },
        lastRiskUpdate: { type: 'TIMESTAMP' },
        
        // Images
        coverImage: { type: 'TEXT' },
        images: { type: 'TEXT[]' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['userId', 'destination', 'startDate', 'status']
};

// Itinerary Model
export const ItineraryModel = {
    name: 'Itinerary',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        tripId: { type: 'UUID', notNull: true, foreignKey: 'Trip.id' },
        dayNumber: { type: 'INTEGER', notNull: true },
        date: { type: 'DATE', notNull: true },
        
        activities: { type: 'JSONB' }, // Array of activity objects
        totalCost: { type: 'DECIMAL(10,2)' },
        totalDuration: { type: 'DECIMAL(10,2)' },
        highlights: { type: 'TEXT' },
        
        notes: { type: 'TEXT' },
        weather: { type: 'JSONB' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['tripId', 'date']
};

// Activity Model
export const ActivityModel = {
    name: 'Activity',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        itineraryId: { type: 'UUID', notNull: true, foreignKey: 'Itinerary.id' },
        tripId: { type: 'UUID', notNull: true, foreignKey: 'Trip.id' },
        
        title: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT' },
        location: { type: 'VARCHAR(255)', notNull: true },
        latitude: { type: 'DECIMAL(10,8)' },
        longitude: { type: 'DECIMAL(11,8)' },
        
        category: { type: 'VARCHAR(50)' }, // heritage, nature, food, adventure, etc.
        
        startTime: { type: 'TIME' },
        duration: { type: 'DECIMAL(10,2)' }, // in hours
        
        cost: { type: 'DECIMAL(10,2)' },
        rating: { type: 'DECIMAL(3,1)' }, // 1-5
        reviews: { type: 'INTEGER', default: 0 },
        
        isRecommended: { type: 'BOOLEAN', default: false },
        isUnique: { type: 'BOOLEAN', default: false },
        
        images: { type: 'TEXT[]' },
        tags: { type: 'TEXT[]' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['itineraryId', 'tripId', 'category']
};

// Expense Model
export const ExpenseModel = {
    name: 'Expense',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        tripId: { type: 'UUID', notNull: true, foreignKey: 'Trip.id' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        
        amount: { type: 'DECIMAL(10,2)', notNull: true },
        category: { type: 'VARCHAR(50)', notNull: true }, // food, transport, accommodation, activities, shopping, other
        description: { type: 'VARCHAR(255)', notNull: true },
        
        date: { type: 'DATE', notNull: true },
        paymentMethod: { type: 'VARCHAR(50)' }, // cash, card, online
        
        receipt: { type: 'TEXT' }, // URL to receipt image
        notes: { type: 'TEXT' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['tripId', 'userId', 'date', 'category']
};

// Destination Model
export const DestinationModel = {
    name: 'Destination',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        name: { type: 'VARCHAR(255)', unique: true, notNull: true },
        
        latitude: { type: 'DECIMAL(10,8)', notNull: true },
        longitude: { type: 'DECIMAL(11,8)', notNull: true },
        
        country: { type: 'VARCHAR(100)', notNull: true },
        state: { type: 'VARCHAR(100)' },
        region: { type: 'VARCHAR(100)' },
        
        description: { type: 'TEXT' },
        bestTimeToVisit: { type: 'TEXT' },
        
        categories: { type: 'TEXT[]' }, // heritage, nature, beach, adventure, etc.
        
        // Risk and weather data
        weatherRiskLevel: { type: 'VARCHAR(20)' },
        securityRiskLevel: { type: 'VARCHAR(20)' },
        healthRiskLevel: { type: 'VARCHAR(20)' },
        averageRiskScore: { type: 'DECIMAL(3,1)' },
        
        // Tourism data
        popularity: { type: 'INTEGER', default: 0 }, // 0-100
        averageRating: { type: 'DECIMAL(3,1)' },
        reviewCount: { type: 'INTEGER', default: 0 },
        
        images: { type: 'TEXT[]' },
        attractions: { type: 'JSONB' }, // List of main attractions
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['name', 'country', 'categories']
};

// Feedback Model
export const FeedbackModel = {
    name: 'Feedback',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        tripId: { type: 'UUID', foreignKey: 'Trip.id' },
        destinationId: { type: 'UUID', foreignKey: 'Destination.id' },
        
        rating: { type: 'INTEGER', notNull: true }, // 1-5
        title: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT', notNull: true },
        
        tags: { type: 'TEXT[]' },
        wouldRecommend: { type: 'BOOLEAN' },
        
        images: { type: 'TEXT[]' },
        
        helpfulCount: { type: 'INTEGER', default: 0 },
        unhelpfulCount: { type: 'INTEGER', default: 0 },
        
        status: { type: 'VARCHAR(20)', default: "'pending'" }, // pending, approved, rejected
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['userId', 'tripId', 'destinationId', 'rating']
};

// Recommendation Model (for ML training)
export const RecommendationModel = {
    name: 'Recommendation',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        destinationId: { type: 'UUID', notNull: true, foreignKey: 'Destination.id' },
        
        score: { type: 'DECIMAL(5,2)', notNull: true },
        confidence: { type: 'DECIMAL(5,2)' },
        
        algorithm: { type: 'VARCHAR(50)' }, // collaborative, content_based, hybrid
        reason: { type: 'TEXT' },
        
        clicked: { type: 'BOOLEAN', default: false },
        booked: { type: 'BOOLEAN', default: false },
        saved: { type: 'BOOLEAN', default: false },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        expiresAt: { type: 'TIMESTAMP' }
    },
    indexes: ['userId', 'destinationId', 'score', 'createdAt']
};

// User Interaction Model (for analytics)
export const UserInteractionModel = {
    name: 'UserInteraction',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        destinationId: { type: 'UUID', foreignKey: 'Destination.id' },
        
        actionType: { type: 'VARCHAR(50)', notNull: true }, // view, click, save, share, book
        
        metadata: { type: 'JSONB' }, // Additional context
        sessionId: { type: 'VARCHAR(100)' },
        ipAddress: { type: 'VARCHAR(45)' },
        userAgent: { type: 'TEXT' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['userId', 'actionType', 'createdAt']
};

// Notification Model
export const NotificationModel = {
    name: 'Notification',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        
        type: { type: 'VARCHAR(50)', notNull: true }, // alert, recommendation, weather, safety, price
        title: { type: 'VARCHAR(255)', notNull: true },
        message: { type: 'TEXT', notNull: true },
        
        destinationId: { type: 'UUID', foreignKey: 'Destination.id' },
        tripId: { type: 'UUID', foreignKey: 'Trip.id' },
        
        priority: { type: 'VARCHAR(20)', default: "'normal'" }, // low, normal, high, critical
        
        read: { type: 'BOOLEAN', default: false },
        readAt: { type: 'TIMESTAMP' },
        
        actionUrl: { type: 'TEXT' },
        metadata: { type: 'JSONB' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        expiresAt: { type: 'TIMESTAMP' }
    },
    indexes: ['userId', 'type', 'read', 'createdAt']
};

// ========== HOTELS & ACCOMMODATIONS ==========

// Hotel Model
export const HotelModel = {
    name: 'Hotel',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        destinationId: { type: 'UUID', notNull: true, foreignKey: 'Destination.id' },
        
        // Basic Info
        name: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT', notNull: true },
        
        // Location
        address: { type: 'VARCHAR(255)', notNull: true },
        city: { type: 'VARCHAR(100)', notNull: true },
        latitude: { type: 'DECIMAL(10,8)', notNull: true },
        longitude: { type: 'DECIMAL(11,8)', notNull: true },
        mapUrl: { type: 'TEXT' },
        
        // Contact
        phone: { type: 'VARCHAR(20)' },
        email: { type: 'VARCHAR(255)' },
        website: { type: 'TEXT' },
        
        // Classification
        starRating: { type: 'DECIMAL(3,1)' }, // 1-5
        hotelCategory: { type: 'VARCHAR(50)' }, // luxury, midrange, budget, hostel
        hotelType: { type: 'VARCHAR(50)', notNull: true }, // hotel, resort, villa, guesthouse, hostel, apartment
        
        // Ratings & Reviews
        averageRating: { type: 'DECIMAL(3,2)', default: 0 },
        reviewCount: { type: 'INTEGER', default: 0 },
        
        // Rooms
        totalRooms: { type: 'INTEGER', notNull: true },
        availableRooms: { type: 'INTEGER', notNull: true },
        
        // Pricing
        minPricePerNight: { type: 'DECIMAL(10,2)', notNull: true },
        maxPricePerNight: { type: 'DECIMAL(10,2)', notNull: true },
        currency: { type: 'VARCHAR(3)', default: "'INR'" },
        
        // Amenities (array of amenity IDs)
        amenities: { type: 'TEXT[]' }, // wifi, pool, gym, spa, restaurant, parking, etc.
        
        // Services
        services: { type: 'JSONB' }, // breakfast included, airport transfer, 24hr room service
        
        // Policy
        checkInTime: { type: 'TIME', default: "'14:00'" },
        checkOutTime: { type: 'TIME', default: "'11:00'" },
        cancellationPolicy: { type: 'VARCHAR(50)' }, // free, paid, nonrefundable
        minimumStay: { type: 'INTEGER', default: 1 }, // in nights
        
        // Media
        images: { type: 'TEXT[]' },
        videoUrl: { type: 'TEXT' },
        thumbnail: { type: 'TEXT' },
        
        // Verification
        isVerified: { type: 'BOOLEAN', default: false },
        verificationDate: { type: 'TIMESTAMP' },
        
        // Status
        isActive: { type: 'BOOLEAN', default: true },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['destinationId', 'city', 'hotelType', 'starRating', 'averageRating']
};

// Hotel Room Model
export const HotelRoomModel = {
    name: 'HotelRoom',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        hotelId: { type: 'UUID', notNull: true, foreignKey: 'Hotel.id' },
        
        // Room Details
        roomNumber: { type: 'VARCHAR(20)', notNull: true },
        roomType: { type: 'VARCHAR(50)', notNull: true }, // single, double, suite, deluxe, etc.
        capacity: { type: 'INTEGER', notNull: true }, // number of guests
        area: { type: 'DECIMAL(8,2)' }, // in sqft
        
        // Bed Configuration
        bedType: { type: 'VARCHAR(50)' }, // single, double, queen, king, bunk
        bedCount: { type: 'INTEGER' },
        
        // Pricing
        pricePerNight: { type: 'DECIMAL(10,2)', notNull: true },
        weekendSurcharge: { type: 'DECIMAL(10,2)', default: 0 },
        seasonalPricing: { type: 'JSONB' }, // high/low season rates
        
        // Amenities
        amenities: { type: 'TEXT[]' }, // AC, TV, WiFi, minibar, etc.
        
        // Occupancy
        isAvailable: { type: 'BOOLEAN', default: true },
        isOccupied: { type: 'BOOLEAN', default: false },
        
        // Media
        images: { type: 'TEXT[]' },
        video360Url: { type: 'TEXT' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['hotelId', 'roomType', 'capacity', 'isAvailable']
};

// ========== ATTRACTIONS & PLACES ==========

// Place/Attraction Model
export const PlaceModel = {
    name: 'Place',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        destinationId: { type: 'UUID', notNull: true, foreignKey: 'Destination.id' },
        
        // Basic Info
        name: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT', notNull: true },
        category: { type: 'VARCHAR(50)', notNull: true }, // temple, museum, beach, park, monument, market, etc.
        
        // Location
        address: { type: 'VARCHAR(255)', notNull: true },
        latitude: { type: 'DECIMAL(10,8)', notNull: true },
        longitude: { type: 'DECIMAL(11,8)', notNull: true },
        
        // Contact
        phone: { type: 'VARCHAR(20)' },
        website: { type: 'TEXT' },
        email: { type: 'VARCHAR(255)' },
        
        // Visiting Information
        entryFee: { type: 'DECIMAL(10,2)' }, // 0 if free
        entryFeeCurrency: { type: 'VARCHAR(3)', default: "'INR'" },
        feeCategory: { type: 'JSONB' }, // adult, child, senior rates
        
        openingTime: { type: 'TIME' },
        closingTime: { type: 'TIME' },
        closedDays: { type: 'TEXT[]' }, // Monday, etc.
        
        // Duration
        avgVisitDuration: { type: 'DECIMAL(5,2)' }, // in hours
        bestTimeToVisit: { type: 'TEXT' },
        
        // Ratings
        averageRating: { type: 'DECIMAL(3,2)', default: 0 },
        reviewCount: { type: 'INTEGER', default: 0 },
        
        // Details
        historicalSignificance: { type: 'TEXT' },
        culturalImportance: { type: 'VARCHAR(255)' },
        builtYear: { type: 'INTEGER' },
        architect: { type: 'VARCHAR(255)' },
        
        // Accessibility
        wheelchairAccessible: { type: 'BOOLEAN', default: false },
        parkingAvailable: { type: 'BOOLEAN', default: true },
        guidedToursAvailable: { type: 'BOOLEAN', default: false },
        guidedTourCost: { type: 'DECIMAL(10,2)' },
        
        // Features
        photography: { type: 'VARCHAR(50)' }, // allowed, with_fee, not_allowed
        videography: { type: 'VARCHAR(50)' }, // allowed, with_fee, not_allowed
        dressCode: { type: 'VARCHAR(255)' },
        
        // Media
        images: { type: 'TEXT[]' },
        videoUrl: { type: 'TEXT' },
        virtualTourUrl: { type: 'TEXT' },
        
        // Admin
        isVerified: { type: 'BOOLEAN', default: false },
        isActive: { type: 'BOOLEAN', default: true },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['destinationId', 'category', 'averageRating', 'name']
};

// ========== BIKE & CAR RENTALS ==========

// Bike Rental Store Model
export const BikeRentalModel = {
    name: 'BikeRental',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        destinationId: { type: 'UUID', notNull: true, foreignKey: 'Destination.id' },
        
        // Store Info
        name: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT' },
        
        // Location
        address: { type: 'VARCHAR(255)', notNull: true },
        latitude: { type: 'DECIMAL(10,8)', notNull: true },
        longitude: { type: 'DECIMAL(11,8)', notNull: true },
        
        // Contact
        phone: { type: 'VARCHAR(20)', notNull: true },
        email: { type: 'VARCHAR(255)' },
        website: { type: 'TEXT' },
        
        // Hours
        openingTime: { type: 'TIME', default: "'08:00'" },
        closingTime: { type: 'TIME', default: "'18:00'" },
        
        // Ratings
        averageRating: { type: 'DECIMAL(3,2)', default: 0 },
        reviewCount: { type: 'INTEGER', default: 0 },
        
        // Policy
        minRentalDuration: { type: 'INTEGER', default: 1 }, // in hours
        maxRentalDuration: { type: 'INTEGER', default: 7 }, // in days
        securityDeposit: { type: 'DECIMAL(10,2)', notNull: true },
        depositRefundable: { type: 'BOOLEAN', default: true },
        
        // Services
        deliveryAvailable: { type: 'BOOLEAN', default: false },
        pickupAvailable: { type: 'BOOLEAN', default: false },
        helmetsIncluded: { type: 'BOOLEAN', default: true },
        lockIncluded: { type: 'BOOLEAN', default: true },
        insuranceAvailable: { type: 'BOOLEAN', default: true },
        
        // Documents Required
        documentsRequired: { type: 'TEXT[]' }, // idProof, drivingLicense, etc.
        
        // Media
        images: { type: 'TEXT[]' },
        
        // Verification
        isVerified: { type: 'BOOLEAN', default: false },
        licenseNumber: { type: 'VARCHAR(100)' },
        
        isActive: { type: 'BOOLEAN', default: true },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['destinationId', 'averageRating', 'city']
};

// Bike Inventory Model
export const BikeInventoryModel = {
    name: 'BikeInventory',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        rentalStoreId: { type: 'UUID', notNull: true, foreignKey: 'BikeRental.id' },
        
        // Bike Details
        bikeType: { type: 'VARCHAR(50)', notNull: true }, // mountain, road, hybrid, electric, cruiser
        model: { type: 'VARCHAR(100)', notNull: true },
        brand: { type: 'VARCHAR(100)', notNull: true },
        color: { type: 'VARCHAR(50)' },
        registrationNumber: { type: 'VARCHAR(50)' },
        
        // Specifications
        gears: { type: 'INTEGER' }, // number of gears
        wheelSize: { type: 'VARCHAR(20)' }, // 20", 24", 26", 29"
        frameSize: { type: 'VARCHAR(20)' }, // XS, S, M, L, XL
        weight: { type: 'DECIMAL(5,2)' }, // in kg
        
        // Condition
        yearOfManufacture: { type: 'INTEGER' },
        condition: { type: 'VARCHAR(50)' }, // excellent, good, fair
        lastServiceDate: { type: 'DATE' },
        
        // Pricing
        hourlyRate: { type: 'DECIMAL(10,2)', notNull: true },
        dailyRate: { type: 'DECIMAL(10,2)', notNull: true },
        weeklyRate: { type: 'DECIMAL(10,2)' },
        monthlyRate: { type: 'DECIMAL(10,2)' },
        
        // Features
        hasGPS: { type: 'BOOLEAN', default: false },
        hasLock: { type: 'BOOLEAN', default: true },
        hasBasket: { type: 'BOOLEAN', default: false },
        hasCarrier: { type: 'BOOLEAN', default: false },
        isElectric: { type: 'BOOLEAN', default: false },
        batteryRange: { type: 'DECIMAL(5,2)' }, // in km (for e-bikes)
        
        // Availability
        isAvailable: { type: 'BOOLEAN', default: true },
        isUnderMaintenance: { type: 'BOOLEAN', default: false },
        
        // Images
        images: { type: 'TEXT[]' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['rentalStoreId', 'bikeType', 'isAvailable']
};

// Car Rental Store Model
export const CarRentalModel = {
    name: 'CarRental',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        destinationId: { type: 'UUID', notNull: true, foreignKey: 'Destination.id' },
        
        // Store Info
        name: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT' },
        companyName: { type: 'VARCHAR(255)', notNull: true },
        
        // Location
        address: { type: 'VARCHAR(255)', notNull: true },
        latitude: { type: 'DECIMAL(10,8)', notNull: true },
        longitude: { type: 'DECIMAL(11,8)', notNull: true },
        
        // Multiple Locations
        locations: { type: 'JSONB' }, // array of location details
        
        // Contact
        phone: { type: 'VARCHAR(20)', notNull: true },
        email: { type: 'VARCHAR(255)' },
        website: { type: 'TEXT' },
        
        // Hours
        openingTime: { type: 'TIME', default: "'06:00'" },
        closingTime: { type: 'TIME', default: "'23:00'" },
        
        // Ratings
        averageRating: { type: 'DECIMAL(3,2)', default: 0 },
        reviewCount: { type: 'INTEGER', default: 0 },
        
        // Policy
        minRentalDuration: { type: 'INTEGER', default: 1 }, // in days
        maxRentalDuration: { type: 'INTEGER', default: 30 },
        securityDeposit: { type: 'DECIMAL(10,2)', notNull: true },
        depositRefundable: { type: 'BOOLEAN', default: true },
        minimumAge: { type: 'INTEGER', default: 21 },
        licenseValidityRequired: { type: 'INTEGER', default: 180 }, // days
        
        // Services
        driverAvailable: { type: 'BOOLEAN', default: true },
        driverChargePerDay: { type: 'DECIMAL(10,2)' },
        pickupAvailable: { type: 'BOOLEAN', default: true },
        dropoffAtDifferentLocation: { type: 'BOOLEAN', default: true },
        airportPickupAvailable: { type: 'BOOLEAN', default: true },
        
        // Insurance
        basicInsuranceIncluded: { type: 'BOOLEAN', default: true },
        premiumInsuranceAvailable: { type: 'BOOLEAN', default: true },
        
        // Documents Required
        documentsRequired: { type: 'TEXT[]' },
        
        // Payment
        acceptedPaymentMethods: { type: 'TEXT[]' },
        
        // Media
        images: { type: 'TEXT[]' },
        logo: { type: 'TEXT' },
        
        // Verification
        isVerified: { type: 'BOOLEAN', default: false },
        licenseNumber: { type: 'VARCHAR(100)' },
        insuranceProvider: { type: 'VARCHAR(100)' },
        
        isActive: { type: 'BOOLEAN', default: true },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['destinationId', 'averageRating', 'companyName']
};

// Car Inventory Model
export const CarInventoryModel = {
    name: 'CarInventory',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        rentalStoreId: { type: 'UUID', notNull: true, foreignKey: 'CarRental.id' },
        
        // Vehicle Details
        carType: { type: 'VARCHAR(50)', notNull: true }, // sedan, suv, hatchback, mpv, van
        make: { type: 'VARCHAR(100)', notNull: true }, // BMW, Maruti, Hyundai
        model: { type: 'VARCHAR(100)', notNull: true }, // Swift, i20, etc.
        color: { type: 'VARCHAR(50)' },
        registrationNumber: { type: 'VARCHAR(50)', notNull: true },
        registrationState: { type: 'VARCHAR(50)' },
        
        // Specifications
        yearOfManufacture: { type: 'INTEGER', notNull: true },
        engineCapacity: { type: 'VARCHAR(50)' }, // in cc
        fuelType: { type: 'VARCHAR(50)' }, // petrol, diesel, cng, hybrid, electric
        transmission: { type: 'VARCHAR(50)' }, // manual, automatic
        seating: { type: 'INTEGER', notNull: true },
        doors: { type: 'INTEGER', default: 4 },
        
        // Condition & Mileage
        condition: { type: 'VARCHAR(50)' }, // excellent, good, fair
        totalKmRun: { type: 'INTEGER' },
        lastServiceDate: { type: 'DATE' },
        
        // Pricing
        dailyRate: { type: 'DECIMAL(10,2)', notNull: true },
        weeklyRate: { type: 'DECIMAL(10,2)' },
        monthlyRate: { type: 'DECIMAL(10,2)' },
        kmChargePerDay: { type: 'DECIMAL(10,2)', default: 0 }, // 0 = unlimited km
        kmLimit: { type: 'INTEGER' }, // per day
        excessKmCharge: { type: 'DECIMAL(10,2)' }, // per km over limit
        
        // Features & Amenities
        features: { type: 'TEXT[]' }, // AC, power steering, ABS, airbags, etc.
        
        // Fuel & Charges
        fuelPolicy: { type: 'VARCHAR(50)' }, // full_to_full, same_as_rented, prepaid
        
        // Documents
        insurancePolicyNumber: { type: 'VARCHAR(100)' },
        pollutionCertificate: { type: 'VARCHAR(100)' },
        fitnessCertificate: { type: 'VARCHAR(100)' },
        
        // Availability
        isAvailable: { type: 'BOOLEAN', default: true },
        isUnderMaintenance: { type: 'BOOLEAN', default: false },
        currentLocation: { type: 'VARCHAR(255)' },
        
        // Images
        images: { type: 'TEXT[]' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['rentalStoreId', 'carType', 'isAvailable', 'fuelType', 'seating']
};

// ========== BOOKINGS & RESERVATIONS ==========

// Hotel Booking Model
export const HotelBookingModel = {
    name: 'HotelBooking',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        tripId: { type: 'UUID', foreignKey: 'Trip.id' },
        hotelId: { type: 'UUID', notNull: true, foreignKey: 'Hotel.id' },
        roomId: { type: 'UUID', notNull: true, foreignKey: 'HotelRoom.id' },
        
        // Dates
        checkInDate: { type: 'DATE', notNull: true },
        checkOutDate: { type: 'DATE', notNull: true },
        numberOfNights: { type: 'INTEGER', notNull: true },
        
        // Guests
        numberOfGuests: { type: 'INTEGER', notNull: true },
        guestDetails: { type: 'JSONB' }, // primary guest info
        
        // Pricing
        pricePerNight: { type: 'DECIMAL(10,2)', notNull: true },
        totalPrice: { type: 'DECIMAL(10,2)', notNull: true },
        taxAmount: { type: 'DECIMAL(10,2)', default: 0 },
        discountAmount: { type: 'DECIMAL(10,2)', default: 0 },
        finalAmount: { type: 'DECIMAL(10,2)', notNull: true },
        currency: { type: 'VARCHAR(3)', default: "'INR'" },
        
        // Special Requests
        specialRequests: { type: 'TEXT' },
        
        // Status
        status: { type: 'VARCHAR(50)', notNull: true }, // confirmed, cancelled, completed, pending
        confirmationNumber: { type: 'VARCHAR(50)' },
        
        // Payment
        paymentStatus: { type: 'VARCHAR(50)', default: "'pending'" }, // pending, partial, completed, failed
        paymentMethod: { type: 'VARCHAR(50)' },
        transactionId: { type: 'VARCHAR(100)' },
        
        // Cancellation
        cancellationDate: { type: 'TIMESTAMP' },
        refundAmount: { type: 'DECIMAL(10,2)' },
        cancellationReason: { type: 'TEXT' },
        
        // Reviews
        reviewId: { type: 'UUID', foreignKey: 'Review.id' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['userId', 'hotelId', 'checkInDate', 'status', 'paymentStatus']
};

// Bike Rental Booking Model
export const BikeBookingModel = {
    name: 'BikeBooking',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        tripId: { type: 'UUID', foreignKey: 'Trip.id' },
        bikeId: { type: 'UUID', notNull: true, foreignKey: 'BikeInventory.id' },
        rentalStoreId: { type: 'UUID', notNull: true, foreignKey: 'BikeRental.id' },
        
        // Rental Period
        pickupDateTime: { type: 'TIMESTAMP', notNull: true },
        returnDateTime: { type: 'TIMESTAMP', notNull: true },
        duration: { type: 'DECIMAL(5,2)', notNull: true }, // in hours or days
        
        // Pricing
        rentalRate: { type: 'DECIMAL(10,2)', notNull: true },
        rentalCost: { type: 'DECIMAL(10,2)', notNull: true },
        depositAmount: { type: 'DECIMAL(10,2)', notNull: true },
        insuranceCost: { type: 'DECIMAL(10,2)', default: 0 },
        totalCost: { type: 'DECIMAL(10,2)', notNull: true },
        
        // Insurance
        insuranceIncluded: { type: 'BOOLEAN', default: false },
        insuranceType: { type: 'VARCHAR(50)' }, // basic, premium
        
        // Status
        status: { type: 'VARCHAR(50)', notNull: true }, // confirmed, picked_up, returned, cancelled
        
        // Actual Return
        actualReturnDateTime: { type: 'TIMESTAMP' },
        bikeConditionAtReturn: { type: 'VARCHAR(50)' }, // excellent, good, damaged
        damageReport: { type: 'TEXT' },
        
        // Payment
        paymentStatus: { type: 'VARCHAR(50)', default: "'pending'" },
        paymentMethod: { type: 'VARCHAR(50)' },
        transactionId: { type: 'VARCHAR(100)' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['userId', 'bikeId', 'pickupDateTime', 'status']
};

// Car Rental Booking Model
export const CarBookingModel = {
    name: 'CarBooking',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        tripId: { type: 'UUID', foreignKey: 'Trip.id' },
        carId: { type: 'UUID', notNull: true, foreignKey: 'CarInventory.id' },
        rentalStoreId: { type: 'UUID', notNull: true, foreignKey: 'CarRental.id' },
        
        // Rental Period
        pickupDate: { type: 'DATE', notNull: true },
        pickupTime: { type: 'TIME', notNull: true },
        dropoffDate: { type: 'DATE', notNull: true },
        dropoffTime: { type: 'TIME', notNull: true },
        numberOfDays: { type: 'INTEGER', notNull: true },
        
        // Driver Info
        driverProvided: { type: 'BOOLEAN', default: false },
        driverId: { type: 'UUID', foreignKey: 'User.id' },
        
        // Pricing
        dailyRate: { type: 'DECIMAL(10,2)', notNull: true },
        rentalCost: { type: 'DECIMAL(10,2)', notNull: true },
        kmChargeType: { type: 'VARCHAR(50)' }, // unlimited, limited, per_km
        kmCharge: { type: 'DECIMAL(10,2)', default: 0 },
        driverCost: { type: 'DECIMAL(10,2)', default: 0 },
        insuranceCost: { type: 'DECIMAL(10,2)', default: 0 },
        taxAmount: { type: 'DECIMAL(10,2)', default: 0 },
        discountAmount: { type: 'DECIMAL(10,2)', default: 0 },
        securityDeposit: { type: 'DECIMAL(10,2)', notNull: true },
        totalCost: { type: 'DECIMAL(10,2)', notNull: true },
        
        // Fuel
        fuelPolicy: { type: 'VARCHAR(50)' },
        fuelStatusAtPickup: { type: 'VARCHAR(20)' }, // full, half, quarter
        fuelStatusAtDropoff: { type: 'VARCHAR(20)' },
        
        // Mileage
        kmAtPickup: { type: 'INTEGER', notNull: true },
        kmAtDropoff: { type: 'INTEGER' },
        kmDriven: { type: 'INTEGER' },
        
        // Status
        status: { type: 'VARCHAR(50)', notNull: true }, // confirmed, picked_up, returned, cancelled
        confirmationNumber: { type: 'VARCHAR(50)' },
        
        // Payment
        paymentStatus: { type: 'VARCHAR(50)', default: "'pending'" },
        paymentMethod: { type: 'VARCHAR(50)' },
        transactionId: { type: 'VARCHAR(100)' },
        
        // Condition Reports
        pickupConditionReport: { type: 'JSONB' },
        dropoffConditionReport: { type: 'JSONB' },
        damageReport: { type: 'TEXT' },
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['userId', 'carId', 'pickupDate', 'status', 'paymentStatus']
};

// ========== REVIEWS ==========

// Review Model (for hotels, places, rentals)
export const ReviewModel = {
    name: 'Review',
    fields: {
        id: { type: 'UUID', primaryKey: true, default: 'uuid()' },
        userId: { type: 'UUID', notNull: true, foreignKey: 'User.id' },
        
        // What is being reviewed
        reviewType: { type: 'VARCHAR(50)', notNull: true }, // hotel, place, bike_rental, car_rental
        entityId: { type: 'UUID', notNull: true }, // hotel/place/rental ID
        bookingId: { type: 'UUID' }, // associated booking
        
        // Rating & Review
        overallRating: { type: 'DECIMAL(3,2)', notNull: true }, // 1-5
        categoryRatings: { type: 'JSONB' }, // cleanliness: 4, comfort: 5, etc.
        
        title: { type: 'VARCHAR(255)', notNull: true },
        reviewText: { type: 'TEXT', notNull: true },
        
        // Metadata
        tags: { type: 'TEXT[]' }, // comfortable, spacious, friendly staff, etc.
        wouldRecommend: { type: 'BOOLEAN', notNull: true },
        tripType: { type: 'VARCHAR(50)' }, // solo, couple, family, friends
        visitMonth: { type: 'VARCHAR(20)' },
        stayDuration: { type: 'INTEGER' }, // number of days/nights
        
        // Media
        images: { type: 'TEXT[]' },
        videos: { type: 'TEXT[]' },
        
        // Engagement
        helpfulCount: { type: 'INTEGER', default: 0 },
        unhelpfulCount: { type: 'INTEGER', default: 0 },
        
        // Moderation
        status: { type: 'VARCHAR(50)', default: "'pending'" }, // pending, approved, rejected
        moderationNotes: { type: 'TEXT' },
        
        // Response from owner
        ownerResponseId: { type: 'UUID' }, // response review ID
        
        createdAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        updatedAt: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    },
    indexes: ['userId', 'entityId', 'reviewType', 'overallRating', 'createdAt']
};

// Table Creation Helper
export function generateSQL(model, dbType = 'postgresql') {
    let sql = `CREATE TABLE IF NOT EXISTS ${model.name} (`;
    const fields = [];

    for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
        let fieldSQL = `${fieldName} ${fieldDef.type}`;

        if (fieldDef.notNull) fieldSQL += ' NOT NULL';
        if (fieldDef.unique) fieldSQL += ' UNIQUE';
        if (fieldDef.default) fieldSQL += ` DEFAULT ${fieldDef.default}`;
        if (fieldDef.primaryKey) fieldSQL += ' PRIMARY KEY';
        if (fieldDef.foreignKey) fieldSQL += ` REFERENCES ${fieldDef.foreignKey}`;

        fields.push(fieldSQL);
    }

    sql += fields.join(',\n  ');
    sql += '\n);';

    // Add indexes
    if (model.indexes) {
        model.indexes.forEach(indexField => {
            sql += `\nCREATE INDEX IF NOT EXISTS idx_${model.name.toLowerCase()}_${indexField} ON ${model.name}(${indexField});`;
        });
    }

    return sql;
}

// Export all models
export const AllModels = [
    // Core Models
    UserModel,
    TripModel,
    ItineraryModel,
    ActivityModel,
    ExpenseModel,
    DestinationModel,
    FeedbackModel,
    RecommendationModel,
    UserInteractionModel,
    NotificationModel,
    
    // Hotels & Accommodations
    HotelModel,
    HotelRoomModel,
    
    // Places & Attractions
    PlaceModel,
    
    // Bike Rentals
    BikeRentalModel,
    BikeInventoryModel,
    BikeBookingModel,
    
    // Car Rentals
    CarRentalModel,
    CarInventoryModel,
    CarBookingModel,
    
    // Bookings
    HotelBookingModel,
    
    // Reviews
    ReviewModel
];

// Generate all table creation scripts
export function generateAllSQL(dbType = 'postgresql') {
    return AllModels.map(model => generateSQL(model, dbType)).join('\n\n');
}

// Database Connection Pool Helper (for production)
export class DatabaseConnection {
    constructor(config) {
        this.config = config;
        this.pool = null;
    }

    async connect() {
        // Implement with pg, mysql2, mongoose, etc.
        console.log('Database connection initialized');
    }

    async query(sql, params) {
        // Execute query
    }

    async transaction(callback) {
        // Execute transaction
    }

    async disconnect() {
        // Close connection
    }
}
