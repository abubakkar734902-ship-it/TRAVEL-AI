// Home/Discover Screen - Mobile App
import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    FlatList,
    TextInput
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDestinations, useRecommendations } from '../store/store';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;

export default function HomeScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('discover');
    const [searchQuery, setSearchQuery] = useState('');

    const destinations = useDestinations();
    const recommendations = useRecommendations();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await destinations.fetchDestinations();
        await recommendations.fetchRecommendations();
    };

    const handleDestinationPress = (destination) => {
        destinations.selectDestination(destination.id);
        navigation.navigate('DestinationDetail', { destination });
    };

    const DestinationCard = ({ item }) => (
        <TouchableOpacity
            style={styles.destinationCard}
            onPress={() => handleDestinationPress(item)}
        >
            <Image
                source={{ uri: item.thumbnail }}
                style={styles.destinationImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.destinationName} numberOfLines={1}>
                    {item.name}
                </Text>
                <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={14} color="#FFB800" />
                    <Text style={styles.rating}>{item.averageRating}</Text>
                </View>
                <Text style={styles.price}>₹{item.minBudget} onwards</Text>
            </View>
        </TouchableOpacity>
    );

    const RecommendationCard = ({ item }) => (
        <TouchableOpacity
            style={styles.recommendationCard}
            onPress={() => handleDestinationPress(item)}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.recommendationImage}
            />
            <View style={styles.recommendationContent}>
                <Text style={styles.recommendationName}>{item.name}</Text>
                <Text style={styles.recommendationReason}>
                    {item.reason}
                </Text>
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Score</Text>
                    <Text style={styles.score}>{item.score}%</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Good Morning</Text>
                    <Text style={styles.subGreeting}>Explore amazing destinations</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Image
                        source={{ uri: 'https://via.placeholder.com/40' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Planner')}
                    >
                        <MaterialIcons name="edit" size={24} color="#FF6B35" />
                        <Text style={styles.actionLabel}>Plan Trip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Hotels')}
                    >
                        <MaterialIcons name="hotel" size={24} color="#FF6B35" />
                        <Text style={styles.actionLabel}>Hotels</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('BikeRental')}
                    >
                        <MaterialIcons name="two-wheeler" size={24} color="#FF6B35" />
                        <Text style={styles.actionLabel}>Bikes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('CarRental')}
                    >
                        <MaterialIcons name="directions-car" size={24} color="#FF6B35" />
                        <Text style={styles.actionLabel}>Cars</Text>
                    </TouchableOpacity>
                </View>

                {/* Recommendations Section */}
                {recommendations.recommendations.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recommended For You</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        {recommendations.loading ? (
                            <ActivityIndicator color="#FF6B35" />
                        ) : (
                            <FlatList
                                data={recommendations.recommendations.slice(0, 3)}
                                renderItem={({ item }) => (
                                    <RecommendationCard item={item} />
                                )}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                )}

                {/* Popular Destinations Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Destinations</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Search')}
                        >
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {destinations.loading ? (
                        <ActivityIndicator color="#FF6B35" />
                    ) : (
                        <View style={styles.destinationsGrid}>
                            <FlatList
                                data={destinations.destinations.slice(0, 4)}
                                renderItem={({ item }) => (
                                    <DestinationCard item={item} />
                                )}
                                keyExtractor={item => item.id}
                                numColumns={2}
                                columnWrapperStyle={styles.columnWrapper}
                                scrollEnabled={false}
                            />
                        </View>
                    )}
                </View>

                {/* Banner */}
                <TouchableOpacity style={styles.promoBanner}>
                    <View>
                        <Text style={styles.promoTitle}>Special Offer</Text>
                        <Text style={styles.promoSubtitle}>Get 20% off on your next booking</Text>
                    </View>
                    <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Explore by Category</Text>
                    <View style={styles.categoriesGrid}>
                        {['Adventure', 'Beach', 'Culture', 'Mountain', 'Wildlife', 'Shopping'].map(
                            category => (
                                <TouchableOpacity
                                    key={category}
                                    style={styles.categoryChip}
                                >
                                    <Text style={styles.categoryLabel}>{category}</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    scrollContent: {
        paddingBottom: 80
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    greeting: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000'
    },
    subGreeting: {
        fontSize: 12,
        color: '#999',
        marginTop: 2
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0'
    },
    searchContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 12,
        borderColor: '#e0e0e0',
        borderWidth: 1
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        padding: 10,
        fontSize: 14,
        color: '#000'
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 16,
        paddingHorizontal: 8
    },
    actionButton: {
        alignItems: 'center'
    },
    actionLabel: {
        fontSize: 12,
        marginTop: 6,
        color: '#333'
    },
    section: {
        marginVertical: 16,
        paddingHorizontal: 16
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000'
    },
    seeAll: {
        fontSize: 12,
        color: '#FF6B35',
        fontWeight: '600'
    },
    destinationsGrid: {
        marginBottom: 12
    },
    columnWrapper: {
        justifyContent: 'space-between'
    },
    destinationCard: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    destinationImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#e0e0e0'
    },
    cardContent: {
        padding: 8
    },
    destinationName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000'
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    rating: {
        fontSize: 11,
        marginLeft: 4,
        color: '#666'
    },
    price: {
        fontSize: 11,
        color: '#FF6B35',
        fontWeight: '600',
        marginTop: 4
    },
    recommendationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        flexDirection: 'row'
    },
    recommendationImage: {
        width: 100,
        height: 100,
        backgroundColor: '#e0e0e0'
    },
    recommendationContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between'
    },
    recommendationName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000'
    },
    recommendationReason: {
        fontSize: 11,
        color: '#666',
        marginTop: 4
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8
    },
    scoreLabel: {
        fontSize: 10,
        color: '#999'
    },
    score: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF6B35'
    },
    promoBanner: {
        marginHorizontal: 16,
        marginVertical: 12,
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    promoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff'
    },
    promoSubtitle: {
        fontSize: 12,
        color: '#fff',
        marginTop: 4,
        opacity: 0.9
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderColor: '#FF6B35',
        borderWidth: 1
    },
    categoryLabel: {
        fontSize: 12,
        color: '#FF6B35',
        fontWeight: '500'
    }
});
