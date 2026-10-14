// TravelAI Mobile App - Main Entry Point
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Navigation from './src/navigation/Navigation';
import { StoreProvider } from './src/store/store';
import { initializeNotifications } from './src/services/notificationService';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Load fonts
                await Font.loadAsync({
                    'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
                    'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
                    'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
                });

                // Initialize notifications
                await initializeNotifications();

                // Simulate loading delay for demo
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.warn(e);
            } finally {
                setIsReady(true);
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, []);

    if (!isReady) {
        return null;
    }

    return (
        <StoreProvider>
            <StatusBar barStyle="dark-content" />
            <Navigation />
        </StoreProvider>
    );
}
