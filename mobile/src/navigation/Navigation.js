// Mobile App Navigation Stack
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import DestinationDetailScreen from '../screens/destinations/DestinationDetailScreen';
import PlannerScreen from '../screens/planner/PlannerScreen';
import ItineraryScreen from '../screens/itinerary/ItineraryScreen';
import TripsScreen from '../screens/trips/TripsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PaymentScreen from '../screens/payments/PaymentScreen';
import HotelsScreen from '../screens/accommodations/HotelsScreen';
import BikeRentalScreen from '../screens/rentals/BikeRentalScreen';
import CarRentalScreen from '../screens/rentals/CarRentalScreen';
import BookingDetailScreen from '../screens/bookings/BookingDetailScreen';
import SafetyScreen from '../screens/safety/SafetyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animationEnabled: true
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

// Home Stack
function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FF6B35'
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold'
                }
            }}
        >
            <Stack.Screen 
                name="HomeMain" 
                component={HomeScreen}
                options={{ title: 'Discover' }}
            />
            <Stack.Screen 
                name="DestinationDetail" 
                component={DestinationDetailScreen}
                options={{ title: 'Destination Details' }}
            />
            <Stack.Screen 
                name="Hotels" 
                component={HotelsScreen}
                options={{ title: 'Hotels & Accommodations' }}
            />
            <Stack.Screen 
                name="Safety" 
                component={SafetyScreen}
                options={{ title: 'Safety & Health' }}
            />
        </Stack.Navigator>
    );
}

// Search Stack
function SearchStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FF6B35'
                },
                headerTintColor: '#fff'
            }}
        >
            <Stack.Screen 
                name="SearchMain" 
                component={SearchScreen}
                options={{ title: 'Search' }}
            />
            <Stack.Screen 
                name="DestinationSearch" 
                component={DestinationDetailScreen}
            />
        </Stack.Navigator>
    );
}

// Planner Stack
function PlannerStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FF6B35'
                },
                headerTintColor: '#fff'
            }}
        >
            <Stack.Screen 
                name="PlannerMain" 
                component={PlannerScreen}
                options={{ title: 'Trip Planner' }}
            />
            <Stack.Screen 
                name="Itinerary" 
                component={ItineraryScreen}
                options={{ title: 'Itinerary' }}
            />
            <Stack.Screen 
                name="BikeRental" 
                component={BikeRentalScreen}
                options={{ title: 'Bike Rentals' }}
            />
            <Stack.Screen 
                name="CarRental" 
                component={CarRentalScreen}
                options={{ title: 'Car Rentals' }}
            />
        </Stack.Navigator>
    );
}

// Trips Stack
function TripsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FF6B35'
                },
                headerTintColor: '#fff'
            }}
        >
            <Stack.Screen 
                name="TripsMain" 
                component={TripsScreen}
                options={{ title: 'My Trips' }}
            />
            <Stack.Screen 
                name="BookingDetail" 
                component={BookingDetailScreen}
                options={{ title: 'Booking Details' }}
            />
            <Stack.Screen 
                name="Payment" 
                component={PaymentScreen}
                options={{ title: 'Payment' }}
            />
        </Stack.Navigator>
    );
}

// Profile Stack
function ProfileStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FF6B35'
                },
                headerTintColor: '#fff'
            }}
        >
            <Stack.Screen 
                name="ProfileMain" 
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Stack.Navigator>
    );
}

// Bottom Tab Navigator
function AppStack() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Home':
                            iconName = 'home';
                            break;
                        case 'Search':
                            iconName = 'search';
                            break;
                        case 'Planner':
                            iconName = 'edit';
                            break;
                        case 'Trips':
                            iconName = 'card-travel';
                            break;
                        case 'Profile':
                            iconName = 'person';
                            break;
                        default:
                            iconName = 'home';
                    }

                    return (
                        <MaterialIcons 
                            name={iconName} 
                            size={size} 
                            color={color} 
                        />
                    );
                },
                tabBarActiveTintColor: '#FF6B35',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopColor: '#e0e0e0'
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600'
                }
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeStack}
                options={{ title: 'Discover' }}
            />
            <Tab.Screen 
                name="Search" 
                component={SearchStack}
                options={{ title: 'Search' }}
            />
            <Tab.Screen 
                name="Planner" 
                component={PlannerStack}
                options={{ title: 'Plan' }}
            />
            <Tab.Screen 
                name="Trips" 
                component={TripsStack}
                options={{ title: 'Trips' }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileStack}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

// Main Navigation
export default function Navigation() {
    const [isSignedIn, setIsSignedIn] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        async function checkAuth() {
            try {
                const token = await SecureStore.getItemAsync('auth_token');
                setIsSignedIn(!!token);
            } catch (err) {
                console.error('Auth check error:', err);
                setIsSignedIn(false);
            }
        }

        checkAuth();
    }, []);

    if (isSignedIn === null) {
        return null; // Loading
    }

    return (
        <NavigationContainer>
            {isSignedIn ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
