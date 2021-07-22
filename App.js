import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
	StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, TouchableHighlight, Alert, SafeAreaView, Dimensions, ToastAndroid,
	Platform,
	AlertIOS,
} from 'react-native';
import { NavigationContainer, useIsFocused  } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera } from 'expo-camera';
import { ceil } from 'react-native-reanimated';
import * as SQLite from 'expo-sqlite';


var thumbnail_img = require('./img/example-img.jpg');
var settings_img = require('./img/settings.png');
var camera_img = require('./img/camera.png');
var delete_img = require('./img/delete.png');
var plus_img = require('./img/plus.png');
var aperture_img = require('./img/aperture.png');
var save_img = require('./img/save.png');
var cancel_img = require('./img/cancel.png');

const Stack = createStackNavigator();

const db = SQLite.openDatabase('MainDB', () => { console.log(error) });

export default function App() {
	const createTable = () => {
		db.transaction((tx) => {
			tx.executeSql(
				"CREATE TABLE IF NOT EXISTS "
				+ "Items "
				+ "(ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Image TEXT);", [],
				(tx, results) => { console.log("Table created successfully") },
				(tx, err) => { console.log("Error when creating table") });
		});
	};

	createTable();
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



const removeItem = () => {
	null;
};

// <MainScreen /> component
const MainScreen = ({ navigation }) => {

	const [items, setItems] = useState([]);
	
	const isFocused = useIsFocused();
	
	// Runs when items focused
	React.useEffect(() => {
		console.log("Use effect");
		getData();
		// setItems(getData());
		// console.log("Test", typeof (items));
		console.log(items.length);
	}, [isFocused]);

	const addItem = (name, img) => {
		try {
			db.transaction(
				(tx) => {
					tx.executeSql("INSERT INTO Items (Name, Image) VALUES (?, ?)",
						[name, img],
						(tx, results) => {
							console.log('Rows affected: ', results.rowsAffected);
							if (results.rowsAffected > 0) {
								console.log('Data Inserted Successfully....');
							} else console.log('Failed....');
						}
					),
						(tx, error) => {
							console.log("Could not execute query");
						};
				}, (err) => {
					console.log("Error1")
				}, () => {
					console.log("Success")
				}
			);
		} catch (error) {
			console.log(error);
		}
	};

	const getData = async () => {
		try {
			await db.transaction(
				async (tx) => {
					await tx.executeSql(
						"SELECT ID, Name, Image from Items",
						[],
						(tx, results) => {
							var temp = [];
							for (let i = 0; i < results.rows.length; ++i)
								temp.push(results.rows.item(i));
							setItems(temp);
						}
					)
				})
		} catch (error) {
			console.log(error);
		};
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.container}>
				<ImageBackground source={require('./img/bg-img.jpg')} style={styles.imagebackground} resizeMode='repeat'>

					{/* Top bar */}
					<View style={styles.topPanel}>
						<Text style={{ fontSize: 30, color: 'white', fontWeight: 'bold' }}>Photo Trap</Text>
						<TouchableOpacity style={styles.touchableOpacity} activeOpacity={0.2} onPress={() => navigation.navigate('Settings')}>
							<Image style={{ height: 30, width: 30 }} source={settings_img} />
						</TouchableOpacity>
					</View>

					{/* List of items */}
					<ScrollView style={styles.scrollview} overScrollMode='never'>
						{/* Add button */}
						<TouchableOpacity style={styles.item} onPress={() => { navigation.navigate('Camera') }}>
							<Image source={plus_img} style={{ height: 50, width: 50, }} />
							<Text style={{ fontSize: 20, color: 'grey', flexGrow: 2, marginLeft: 20 }}>Add ...</Text>
						</TouchableOpacity>
						{
							items.map((item, key) => {
								return (<Item img={item.Image} date={item.Name + " (ID:" + item.ID + ")"} key={key} />);
							})
						}
						<View style={{ height: 100 }}></View>
					</ScrollView>
				</ImageBackground>
			</View>
		</SafeAreaView>
	);
}

// <CameraScreen /> component
const CameraScreen = () => {
	const cameraRef = useRef();
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.back);
	const [imgBase64, setImgBase64] = useState('');
	const [isPreview, setIsPreview] = useState(false);

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

	const addItem = (name, img) => {
		try {
			db.transaction(
				(tx) => {
					// console.log(name, img);
					tx.executeSql("INSERT INTO Items (Name, Image) VALUES (?, ?)",
						[name, img],
						(tx, results) => {
							console.log('Rows affected: ', results.rowsAffected);
							if (results.rowsAffected > 0) {
								console.log('Data Inserted Successfully....');
							} else console.log('Failed....');
						}
					),
						(tx, error) => {
							console.log("Could not execute query");
						};
				}, (tx, err) => {
					console.log("Error2")
				}, () => {
					console.log("Success")
				}
			);
		} catch (error) {
			console.log(error);
		}
	};

	const onSnap = async () => {
		if (cameraRef.current) {
			const options = { quality: 0.7, base64: true };
			const data = await cameraRef.current.takePictureAsync(options);
			const source = data.base64;
			setImgBase64(source);

			if (source) {
				await cameraRef.current.pausePreview();
				setIsPreview(true);
			}
		}
	};


	const getCurrentDateAndTime = () => {
		const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		const d = new Date();
		var date = d.getDate(); //To get the Current Date
		var month = monthNames[d.getMonth()]; //To get the Current Month
		var year = d.getFullYear(); //To get the Current Year
		var hours = d.getHours(); //To get the Current Hours
		var min = d.getMinutes(); //To get the Current Minutes
		return date + " " + month + ", " + year + " " + hours + ":" + min;
	}

	function notifyMessage(msg) {
		if (Platform.OS === 'android') {
			ToastAndroid.show(msg, ToastAndroid.SHORT)
		} else {
			AlertIOS.alert(msg);
		}
	}

	const stopPreview = async () => {
		await cameraRef.current.resumePreview();
		setIsPreview(false);
	}

	const saveImage = () => {
		addItem(getCurrentDateAndTime(), imgBase64);
		stopPreview();
		notifyMessage("Image saved successfully");
	}

	return (
		<View style={{ flex: 1, backgroundColor: '#202020' }}>
			<Camera style={{ height: Dimensions.get('window').width * 4 / 3, }} type={Camera.Constants.Type.back} ratio={"4:3"} ref={cameraRef}>
			</Camera>
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
				{isPreview
					? <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row' }}><TouchableOpacity onPress={saveImage}><Image style={{ height: 60, width: 60 }} source={save_img} /></TouchableOpacity><TouchableOpacity onPress={stopPreview}><Image style={{ height: 60, width: 60 }} source={cancel_img} /></TouchableOpacity></View>
					: <TouchableOpacity onPress={onSnap}><Image style={{ height: 60, width: 60 }} source={aperture_img} /></TouchableOpacity>
				}
			</View>
		</View>
	);
}

// <SettingsScreen /> component
const SettigsScreen = () => {
	return (
		<Text style={{ fontSize: 30 }}>Settings screen</Text>
	);
}

// <Compare screen /> component
const CompareScreen = () => {
	return (
		<Text style={{ fontSize: 30 }}>Compare screen</Text>
	);
}

// <Item /> component
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
			<Image source={{ uri: `data:image/png;base64,${props.img}` }} style={styles.img} />
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
		marginTop: 60,
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
		marginTop: 60,
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