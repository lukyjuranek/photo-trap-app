import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, TouchableHighlight, Alert, SafeAreaView, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import { ceil } from 'react-native-reanimated';


var thumbnail_img = require('./img/example-img.jpg');
var settings_img = require('./img/settings.png');
var camera_img = require('./img/camera.png');
var delete_img = require('./img/delete.png');
var plus_img = require('./img/plus.png');
var aperture_img = require('./img/aperture.png');

const Stack = createStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name="Home" component={MainScreen} options={{
					headerShown: false,
				}} />
				< Stack.Screen name="Camera" component={CameraScreen} options={{
					headerStyle: {
						backgroundColor: '#202020',
					},
					headerTintColor: 'white'
				}} />
				<Stack.Screen name="Settings" component={SettigsScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

const MainScreen = ({ navigation }) => {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.container}>
				<ImageBackground source={require('./img/bg-img.jpg')} style={styles.imagebackground} resizeMode='repeat'>

					{/* Add button */}
					<View style={styles.topPanel}>
						<Text style={{ fontSize: 30, color: 'white' }}>Photo Trap</Text>
						<TouchableOpacity style={styles.touchableOpacity} activeOpacity={0.2} onPress={() => navigation.navigate('Settings')}>
							<Image style={{ height: 30, width: 30 }} source={settings_img} />
						</TouchableOpacity>
					</View>

					{/* List of items */}
					<ScrollView style={styles.scrollview} overScrollMode='never'>
						<TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Camera')}>
							<Image source={plus_img} style={{ height: 50, width: 50, }} />
							<Text style={{ fontSize: 20, color: 'grey', flexGrow: 2, marginLeft: 20 }}>...</Text>
						</TouchableOpacity>
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />
						<Item img={thumbnail_img} date='Jan 28, 2021 12:33 PM' />

						<View style={{ height: 100 }}></View>
					</ScrollView>
				</ImageBackground>
			</View>
		</SafeAreaView>
	);
}

const CameraScreen = () => {
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.back);

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestPermissionsAsync();
			setHasPermission(status === 'granted');
		})();
	}, []);

	if (hasPermission === null) {
		return null;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}


	return (
		<View style={{ flex: 1, backgroundColor:'#202020' }}>
			<Camera style={{ height: Dimensions.get('window').width * 4 / 3, }} type={Camera.Constants.Type.back} ratio={"4:3"}>
			</Camera>
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
				<TouchableOpacity>
					<Image style={{ height: 60, width: 60 }} source={aperture_img} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const SettigsScreen = () => {
	return (
		<Text style={{ fontSize: 30 }}>Settings screen</Text>
	);
}

const PreviewScreen = () => {
	return (
		<Text style={{ fontSize: 30 }}>Preview screen</Text>
	);
}

const CompareScreen = () => {
	return (
		<Text style={{ fontSize: 30 }}>Compare screen</Text>
	);
}

const Item = (props) => {
	const showConfirmDialog = (text) => {
		return Alert.alert(
			"Are you sure?",
			"Are you sure you want to delete this item?",
			[
				// The "Yes" button
				{
					text: "Yes",
					onPress: () => {
						// setShowBox(false);
						var x = 0;
					},
					style: 'destructive'
				},
				// The "No" button
				// Does nothing but dismiss the dialog when tapped
				{
					text: "No",
				},
			]
		);
	};
	return (
		<View style={styles.item}>
			<Image source={props.img} style={styles.img} />
			<Text style={{ fontSize: 15, color: 'black', flexGrow: 2, marginLeft: 20 }}>{props.date}</Text>
			<TouchableOpacity style={styles.touchableOpacity} activeOpacity={0.2} onPress={() => showConfirmDialog(props.date)}>
				<Image style={{ height: 30, width: 30 }} source={delete_img} />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		// fontFamily: "-apple-system, BlinkMacSystemFont Segoe UI",
		justifyContent: "center",
		alignItems: "center",
		// backgroundColor: "orange"
	},
	topPanel: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 50,
		marginHorizontal: 20
	},
	item: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		margin: 10,
	},
	scrollview: {
		flex: 1,
		backgroundColor: 'white',
		margin: 0,
		marginTop: 80,
		padding: 20,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		shadowColor: '#171717',
		shadowOffset: { width: -2, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
	},
	img: {
		height: 50,
		width: 50,
		borderRadius: 5
	},
	imagebackground: {
		flex: 1,
		width: '100%',
		height: '100%',
		// justifyContent: "center",
		// alignItems: "center",
		// opacity: 0.7
	},
	touchableOpacity: {
		flexDirection: 'row',
		alignItems: 'center',
		// height: 40,
		// borderRadius: 5,
		// margin: 5,
	},
});